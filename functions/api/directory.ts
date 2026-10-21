import {
    checkDirectoryRequest,
    directoryHeaders,
} from '../_shared/access';

interface D1QueryResult<Row> {
    results: Row[];
}

interface D1Database {
    prepare(query: string): {
        all<Row>(): Promise<D1QueryResult<Row>>;
    };
}

interface Env {
    DB: D1Database;
}

interface ChapterRow {
    id: number;
    name: string | null;
    country: string | null;
    region: string | null;
    schoolCount: number;
}

interface SchoolRow {
    id: number;
    chapterId: number | null;
    name: string;
    link: string | null;
    coverImage: string | null;
    chapterName: string | null;
    country: string | null;
    region: string | null;
}

function toSlug(value: string): string {
    return value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

export const onRequest = async ({
    request,
    env,
}: {
    request: Request;
    env: Env;
}): Promise<Response> => {
    const rejectedRequest = checkDirectoryRequest(request);
    if (rejectedRequest) return rejectedRequest;

    try {
        const [chapterResult, schoolResult] = await Promise.all([
            env.DB.prepare(`
                SELECT
                    c.id,
                    COALESCE(c.name, 'Unnamed chapter') AS name,
                    COALESCE(c.country, 'Other') AS country,
                    COALESCE(c.region, 'Other') AS region,
                    COUNT(s.id) AS schoolCount
                FROM chapters c
                LEFT JOIN schools s ON s.chapter_id = c.id
                GROUP BY c.id, c.name, c.country, c.region
                ORDER BY c.name
            `).all<ChapterRow>(),
            env.DB.prepare(`
                SELECT
                    s.id,
                    s.name,
                    c.id AS chapterId,
                    s.link,
                    s.cover_image AS coverImage,
                    c.name AS chapterName,
                    COALESCE(c.country, 'Other') AS country,
                    COALESCE(c.region, 'Other') AS region
                FROM schools s
                LEFT JOIN chapters c ON s.chapter_id = c.id
                ORDER BY s.name
            `).all<SchoolRow>(),
        ]);

        const chapters = chapterResult.results.map((chapter) => ({
            id: chapter.id,
            title: chapter.name ?? 'Unnamed chapter',
            subtitle: `${chapter.schoolCount} ${chapter.schoolCount === 1 ? 'school' : 'schools'}`,
            country: chapter.country ?? 'Other',
            region: chapter.region ?? 'Other',
            url: `/aboutUs/chapters/chapter/${chapter.id}-${toSlug(chapter.name ?? 'chapter')}`,
            image: null,
            chapterUrl: null,
        }));
        const schools = schoolResult.results.map((school) => ({
            id: school.id,
            title: school.name,
            subtitle: school.chapterName
                ? `${school.chapterName} chapter`
                : 'No chapter assigned',
            country: school.country ?? 'Other',
            region: school.region ?? 'Other',
            url: `/aboutUs/chapters/school/${school.id}-${toSlug(school.name)}`,
            image: school.coverImage,
            chapterUrl:
                school.chapterName && school.chapterId
                    ? `/aboutUs/chapters/chapter/${school.chapterId}-${toSlug(school.chapterName)}`
                    : null,
        }));

        const headers = directoryHeaders(request);
        headers.set('Cache-Control', 'public, max-age=60');
        return Response.json(
            {
                chapters,
                schools,
            },
            { headers }
        );
    } catch (error) {
        console.error('Failed to load the chapter and school directory:', error);
        return Response.json(
            { error: 'Unable to load the chapter and school directory.' },
            { status: 500, headers: directoryHeaders(request) }
        );
    }
};
