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
                    COALESCE(co.name, c.country, 'Other') AS country,
                    COALESCE(r.name, 'Other') AS region,
                    COUNT(s.id) AS schoolCount
                FROM chapters c
                LEFT JOIN countries co ON co.id = c.country_id
                LEFT JOIN regions r ON r.id = c.region_id
                LEFT JOIN schools s ON s.chapter_id = c.id
                GROUP BY c.id, c.name, co.name, c.country, r.name
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
                    COALESCE(co.name, c.country, 'Other') AS country,
                    COALESCE(r.name, 'Other') AS region
                FROM schools s
                LEFT JOIN chapters c ON s.chapter_id = c.id
                LEFT JOIN countries co ON co.id = c.country_id
                LEFT JOIN regions r ON r.id = c.region_id
                ORDER BY
                    COALESCE(co.name, c.country, 'Other') COLLATE NOCASE,
                    COALESCE(r.name, 'Other') COLLATE NOCASE,
                    s.name COLLATE NOCASE
            `).all<SchoolRow>(),
        ]);

        const chapters = chapterResult.results.map((chapter) => ({
            id: chapter.id,
            title: chapter.name ?? 'Unnamed chapter',
            subtitle: `${chapter.schoolCount} ${chapter.schoolCount === 1 ? 'school' : 'schools'}`,
            country: chapter.country ?? 'Other',
            region: chapter.region ?? 'Other',
            url: `/aboutUs/locations/chapter/${chapter.id}-${toSlug(chapter.name ?? 'chapter')}`,
            image: null,
            images: schoolResult.results
                .filter((school) => school.chapterId === chapter.id)
                .map((school) => school.coverImage)
                .filter((image): image is string => Boolean(image)),
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
            url: `/aboutUs/locations/school/${school.id}-${toSlug(school.name)}`,
            image: school.coverImage,
            chapterUrl:
                school.chapterName && school.chapterId
                    ? `/aboutUs/locations/chapter/${school.chapterId}-${toSlug(school.chapterName)}`
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
