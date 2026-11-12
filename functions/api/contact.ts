interface D1PreparedStatement {
    bind(...values: (number | string)[]): D1PreparedStatement;
    first<Row>(): Promise<Row | null>;
}

interface D1Database {
    prepare(query: string): D1PreparedStatement;
}

interface Env {
    DB: D1Database;
    TICKET_API_URL?: string;
    TICKET_API_SECRET?: string;
    TICKET_OPENER_USER_ID?: string;
    TURNSTILE_HOSTNAMES?: string;
    TURNSTILE_SECRET_KEY?: string;
}

interface ContactRequest {
    email: string;
    subject: string;
    category: 'general' | 'new_chapter' | 'chapter';
    chapterName?: string;
    message: string;
    turnstileToken: string;
}

interface ChapterRow {
    name: string;
}

interface TurnstileResult {
    success: boolean;
    action?: string;
    hostname?: string;
}

function jsonError(error: string, status: number): Response {
    return Response.json({ error }, { status });
}

function isSameOrigin(request: Request): boolean {
    const origin = request.headers.get('Origin');
    if (!origin) return false;

    try {
        return new URL(origin).origin === new URL(request.url).origin;
    } catch {
        return false;
    }
}

function isContactRequest(value: unknown): value is ContactRequest {
    if (!value || typeof value !== 'object') return false;
    const body = value as Record<string, unknown>;

    return (
        typeof body.email === 'string' &&
        typeof body.subject === 'string' &&
        ['general', 'new_chapter', 'chapter'].includes(
            body.category as string
        ) &&
        (body.chapterName === undefined ||
            typeof body.chapterName === 'string') &&
        typeof body.message === 'string' &&
        typeof body.turnstileToken === 'string'
    );
}

async function verifyTurnstile(
    request: Request,
    token: string,
    secret: string
): Promise<TurnstileResult> {
    const formData = new URLSearchParams({
        secret,
        response: token,
    });
    const clientIp = request.headers.get('CF-Connecting-IP');
    if (clientIp) formData.set('remoteip', clientIp);

    const response = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        }
    );

    if (!response.ok) {
        throw new Error(`Turnstile verification failed (${response.status}).`);
    }

    return (await response.json()) as TurnstileResult;
}

export const onRequestPost = async ({
    request,
    env,
}: {
    request: Request;
    env: Env;
}): Promise<Response> => {
    if (!isSameOrigin(request)) {
        return jsonError('This request is not allowed.', 403);
    }

    const contentLength = Number(request.headers.get('Content-Length') ?? 0);
    if (contentLength > 12_000) {
        return jsonError('The submitted form is too large.', 413);
    }

    let input: unknown;
    let rawBody: string;
    try {
        rawBody = await request.text();
    } catch {
        return jsonError('Unable to read the submitted form.', 400);
    }

    if (new TextEncoder().encode(rawBody).byteLength > 12_000) {
        return jsonError('The submitted form is too large.', 413);
    }

    try {
        input = JSON.parse(rawBody) as unknown;
    } catch {
        return jsonError('Invalid JSON request.', 400);
    }

    if (!isContactRequest(input)) {
        return jsonError('Complete all required fields and try again.', 400);
    }

    const email = input.email.trim();
    const subject = input.subject.trim();
    const message = input.message.trim();
    const chapterName = input.chapterName?.trim() ?? '';

    if (
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        return jsonError('Enter a valid email address.', 400);
    }

    if (!subject || subject.length > 120 || !message || message.length > 3000) {
        return jsonError(
            'Subject must be 1-120 characters and message 1-3000 characters.',
            400
        );
    }

    if (input.category === 'chapter' && !chapterName) {
        return jsonError('Choose a chapter from the list.', 400);
    }

    if (!input.turnstileToken) {
        return jsonError('Complete the spam-protection check and try again.', 400);
    }

    if (
        !env.TURNSTILE_SECRET_KEY ||
        !env.TURNSTILE_HOSTNAMES ||
        !env.TICKET_API_SECRET ||
        !env.TICKET_API_URL ||
        !env.TICKET_OPENER_USER_ID
    ) {
        console.error('Contact ticket endpoint is missing required settings.');
        return jsonError(
            'The contact form is not fully configured. Please contact SPARK directly.',
            503
        );
    }

    let verification: TurnstileResult;
    try {
        verification = await verifyTurnstile(
            request,
            input.turnstileToken,
            env.TURNSTILE_SECRET_KEY
        );
    } catch (error) {
        console.error('Unable to verify the contact form challenge:', error);
        return jsonError(
            'Spam protection is temporarily unavailable. Please try again later.',
            502
        );
    }

    const allowedHostnames = new Set(
        env.TURNSTILE_HOSTNAMES.split(',')
            .map((hostname) => hostname.trim().toLowerCase())
            .filter(Boolean)
    );
    if (
        !verification.success ||
        verification.action !== 'contact_submit' ||
        !verification.hostname ||
        !allowedHostnames.has(verification.hostname.toLowerCase())
    ) {
        return jsonError(
            'Spam protection could not be verified. Please try again.',
            400
        );
    }

    let verifiedChapterName = '';
    if (input.category === 'chapter') {
        const chapter = await env.DB.prepare(
            'SELECT name FROM chapters WHERE name = ? COLLATE NOCASE LIMIT 1'
        )
            .bind(chapterName)
            .first<ChapterRow>();

        if (!chapter?.name) {
            return jsonError('Choose a chapter from the current list.', 400);
        }
        verifiedChapterName = chapter.name;
    }

    const categoryLabels = {
        general: 'General inquiry',
        new_chapter: 'Starting a new chapter',
        chapter: 'Question about an existing chapter',
    } as const;
    const topicLines = [
        `Category: ${categoryLabels[input.category]}`,
        verifiedChapterName ? `Chapter: ${verifiedChapterName}` : null,
        `Email: ${email}`,
        `Subject: ${subject}`,
        '',
        'Message:',
        message,
    ]
        .filter((line): line is string => line !== null);
    const topic = topicLines.join('\n');

    if (topic.length > 4096) {
        return jsonError(
            'Your message and contact details are too long for a ticket. Please shorten them and try again.',
            400
        );
    }

    let ticketUrl: URL;
    try {
        ticketUrl = new URL(env.TICKET_API_URL);
        if (ticketUrl.protocol !== 'https:') {
            return jsonError('The ticket service URL is not secure.', 503);
        }
    } catch {
        console.error('The configured ticket service URL is invalid.');
        return jsonError('The ticket service is not configured correctly.', 503);
    }

    let ticketResponse: Response;
    try {
        ticketResponse = await fetch(ticketUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${env.TICKET_API_SECRET}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                channelName: `contact-${crypto.randomUUID().slice(0, 8)}`,
                userId: env.TICKET_OPENER_USER_ID,
                category: categoryLabels[input.category],
                email,
                subject,
                message,
                ...(input.chapterName
                    ? { chapterName: input.chapterName }
                    : {}),
                embedTitle: `Contact Us — ${categoryLabels[input.category]}`,
                topic,
            }),
        });
    } catch (error) {
        console.error('Unable to reach the ticket service:', error);
        return jsonError(
            'The ticket service is temporarily unavailable. Please try again later.',
            502
        );
    }

    if (!ticketResponse.ok) {
        let rejectionDetail = '';
        try {
            const responseBody = await ticketResponse.text();
            try {
                const parsedBody = JSON.parse(responseBody) as Record<
                    string,
                    unknown
                >;
                const detail = [
                    parsedBody.error,
                    parsedBody.message,
                    parsedBody.detail,
                ].find((value) => typeof value === 'string');
                if (typeof detail === 'string') {
                    rejectionDetail = detail;
                }
            } catch {
                rejectionDetail = responseBody;
            }
        } catch {
            rejectionDetail = '';
        }
        rejectionDetail = rejectionDetail
            .replace(/[\u0000-\u001f\u007f]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 240);

        console.error(
            `Ticket service request failed with status ${ticketResponse.status}.`
        );
        if (ticketResponse.status === 400) {
            return jsonError(
                rejectionDetail
                    ? `The ticket service rejected the submission: ${rejectionDetail}`
                    : 'The ticket service rejected the submission (HTTP 400) without a readable error message.',
                400
            );
        }

        return jsonError(
            ticketResponse.status === 429
                ? 'Too many requests. Please wait before trying again.'
                : `The ticket service returned an error (HTTP ${ticketResponse.status}). Please try again later or contact SPARK directly.`,
            ticketResponse.status === 429 ? 429 : 502
        );
    }

    let ticket: { channelId?: unknown; channelUrl?: unknown };
    try {
        ticket = (await ticketResponse.json()) as typeof ticket;
    } catch (error) {
        console.error('Ticket service returned an invalid response:', error);
        return jsonError(
            'The ticket was created, but its confirmation could not be read.',
            502
        );
    }

    if (
        typeof ticket.channelId !== 'string' ||
        typeof ticket.channelUrl !== 'string'
    ) {
        console.error('Ticket service response omitted channel details.');
        return jsonError(
            'The ticket was created, but its confirmation could not be read.',
            502
        );
    }

    return Response.json({ success: true });
};
