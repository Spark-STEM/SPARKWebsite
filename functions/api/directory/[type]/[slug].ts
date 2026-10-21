import {
    checkDirectoryRequest,
    directoryHeaders,
} from '../../../_shared/access';

interface D1Result<Row> {
    results: Row[];
}

interface D1Statement {
    bind(...values: (number | string)[]): D1Statement;
    first<Row>(): Promise<Row | null>;
    all<Row>(): Promise<D1Result<Row>>;
}

interface D1Database {
    prepare(query: string): D1Statement;
}

interface Env {
    DB: D1Database;
}

interface ChapterRow {
    id: number;
    name: string | null;
    country: string;
    region: string | null;
    city: string;
}

interface SchoolRow {
    id: number;
    chapter_id: number | null;
    chapter_name: string | null;
    name: string;
    address: string | null;
    link: string | null;
    cover_image: string | null;
    latitude: number | null;
    longitude: number | null;
    country: string | null;
    region: string | null;
    city: string | null;
}

interface MemberRow {
    id: number;
    name: string;
    email: string | null;
    isLead: number;
    roles: string | null;
}

interface ProgramRow {
    id: number;
    school_id: number;
    school_name: string;
    name: string;
    description: string | null;
    min_grade: number | null;
    max_grade: number | null;
    status: string | null;
    start_date: string | null;
    end_date: string | null;
    student_count: number | null;
    tutor_count: number | null;
    fee: number | null;
    location: string | null;
}

interface ScheduleRow {
    program_id: number;
    runs_mon: number;
    runs_tue: number;
    runs_wed: number;
    runs_thu: number;
    runs_fri: number;
    start_time: string;
    end_time: string;
}

const schoolSelect = `
    SELECT
        s.id,
        s.chapter_id,
        c.name AS chapter_name,
        s.name,
        s.address,
        s.link,
        s.cover_image,
        s.latitude,
        s.longitude,
        c.country,
        c.region,
        c.city
    FROM schools s
    LEFT JOIN chapters c ON c.id = s.chapter_id
`;

function safeExternalUrl(value: string | null): string | null {
    if (!value) return null;

    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:'
            ? url.toString()
            : null;
    } catch {
        return null;
    }
}

export const onRequest = async ({
    request,
    env,
    params,
}: {
    request: Request;
    env: Env;
    params: Record<string, string>;
}): Promise<Response> => {
    const rejectedRequest = checkDirectoryRequest(request);
    if (rejectedRequest) return rejectedRequest;

    const type = params.type;
    const idMatch = /^(\d+)(?:-|$)/.exec(params.slug ?? '');
    const id = idMatch ? Number(idMatch[1]) : NaN;

    if ((type !== 'chapter' && type !== 'school') || !Number.isSafeInteger(id)) {
        return Response.json(
            { error: 'Directory entry not found.' },
            { status: 404, headers: directoryHeaders(request) }
        );
    }

    try {
        let entity:
            | {
                  id: number;
                  name: string;
                  country: string;
                  region: string;
                  city: string;
                  chapterId?: number | null;
                  chapterName?: string | null;
                  address?: string | null;
                  link?: string | null;
                  coverImage?: string | null;
                  schoolCount?: number;
              }
            | null;
        let schools: SchoolRow[];
        let chapterId: number | null;

        if (type === 'chapter') {
            const chapter = await env.DB.prepare(`
                SELECT id, name, country, region, city
                FROM chapters
                WHERE id = ?
            `)
                .bind(id)
                .first<ChapterRow>();

            if (!chapter) {
                return Response.json(
                    { error: 'Directory entry not found.' },
                    { status: 404, headers: directoryHeaders(request) }
                );
            }

            chapterId = chapter.id;
            const schoolResult = await env.DB.prepare(`
                ${schoolSelect}
                WHERE s.chapter_id = ?
                ORDER BY s.name
            `)
                .bind(chapter.id)
                .all<SchoolRow>();
            schools = schoolResult.results;
            entity = {
                id: chapter.id,
                name: chapter.name ?? 'Unnamed chapter',
                country: chapter.country,
                region: chapter.region ?? '',
                city: chapter.city,
                schoolCount: schools.length,
            };
        } else {
            const school = await env.DB.prepare(`
                ${schoolSelect}
                WHERE s.id = ?
            `)
                .bind(id)
                .first<SchoolRow>();

            if (!school) {
                return Response.json(
                    { error: 'Directory entry not found.' },
                    { status: 404, headers: directoryHeaders(request) }
                );
            }

            chapterId = school.chapter_id;
            schools = [school];
            entity = {
                id: school.id,
                name: school.name,
                country: school.country ?? '',
                region: school.region ?? '',
                city: school.city ?? '',
                chapterId: school.chapter_id,
                chapterName: school.chapter_name,
                address: school.address,
                link: safeExternalUrl(school.link),
                coverImage: school.cover_image,
            };
        }

        const [membersResult, programsResult, schedulesResult] =
            await Promise.all([
                chapterId === null
                    ? Promise.resolve({ results: [] as MemberRow[] })
                    : env.DB.prepare(`
                        SELECT
                            m.id,
                            m.name,
                            CASE
                                WHEN MAX(CASE WHEN LOWER(r.name) = 'chapter lead' THEN 1 ELSE 0 END) = 1
                                THEN MAX(m.email)
                                ELSE NULL
                            END AS email,
                            MAX(CASE WHEN LOWER(r.name) = 'chapter lead' THEN 1 ELSE 0 END) AS isLead,
                            GROUP_CONCAT(DISTINCT r.name) AS roles
                        FROM members m
                        LEFT JOIN member_roles mr ON mr.member_id = m.id
                        LEFT JOIN roles r ON r.id = mr.role_id
                        WHERE m.chapter_id = ?
                        GROUP BY m.id, m.name
                        ORDER BY isLead DESC, m.name
                    `)
                          .bind(chapterId)
                          .all<MemberRow>(),
                env.DB.prepare(`
                    SELECT
                        p.id,
                        p.school_id,
                        s.name AS school_name,
                        p.name,
                        p.description,
                        p.min_grade,
                        p.max_grade,
                        p.status,
                        p.start_date,
                        p.end_date,
                        p.student_count,
                        p.tutor_count,
                        p.fee,
                        p.location
                    FROM programs p
                    JOIN schools s ON s.id = p.school_id
                    WHERE ${
                        type === 'chapter'
                            ? 's.chapter_id = ?'
                            : 'p.school_id = ?'
                    }
                    ORDER BY p.start_date DESC, p.name
                `)
                    .bind(id)
                    .all<ProgramRow>(),
                env.DB.prepare(`
                    SELECT
                        ps.program_id,
                        ps.runs_mon,
                        ps.runs_tue,
                        ps.runs_wed,
                        ps.runs_thu,
                        ps.runs_fri,
                        ps.start_time,
                        ps.end_time
                    FROM program_schedules ps
                    JOIN programs p ON p.id = ps.program_id
                    JOIN schools s ON s.id = p.school_id
                    WHERE ${
                        type === 'chapter'
                            ? 's.chapter_id = ?'
                            : 'p.school_id = ?'
                    }
                `)
                    .bind(id)
                    .all<ScheduleRow>(),
            ]);

        const schedulesByProgram = new Map<number, ScheduleRow[]>();
        for (const schedule of schedulesResult.results) {
            const existing = schedulesByProgram.get(schedule.program_id) ?? [];
            existing.push(schedule);
            schedulesByProgram.set(schedule.program_id, existing);
        }

        const dayLabels = [
            ['runs_mon', 'Monday'],
            ['runs_tue', 'Tuesday'],
            ['runs_wed', 'Wednesday'],
            ['runs_thu', 'Thursday'],
            ['runs_fri', 'Friday'],
        ] as const;

        const programs = programsResult.results.map((program) => ({
            ...program,
            schedules: (schedulesByProgram.get(program.id) ?? []).map(
                (schedule) => ({
                    days: dayLabels
                        .filter(([field]) => schedule[field] === 1)
                        .map(([, label]) => label),
                    startTime: schedule.start_time,
                    endTime: schedule.end_time,
                })
            ),
        }));

        const headers = directoryHeaders(request);
        headers.set('Cache-Control', 'public, max-age=60');

        return Response.json(
            {
                type,
                entity,
                schools: schools.map((school) => ({
                    id: school.id,
                    name: school.name,
                    address: school.address,
                    latitude: school.latitude,
                    longitude: school.longitude,
                    link: safeExternalUrl(school.link),
                })),
                members: membersResult.results.map((member) => ({
                    id: member.id,
                    name: member.name,
                    email: member.isLead ? member.email : null,
                    isLead: member.isLead === 1,
                    roles: member.roles,
                })),
                activePrograms: programs.filter(
                    (program) => program.status?.toLowerCase() === 'active'
                ),
                oldPrograms: programs.filter(
                    (program) => program.status?.toLowerCase() !== 'active'
                ),
            },
            { headers }
        );
    } catch (error) {
        console.error('Failed to load a chapter or school detail:', error);
        return Response.json(
            { error: 'Unable to load this directory entry.' },
            { status: 500, headers: directoryHeaders(request) }
        );
    }
};
