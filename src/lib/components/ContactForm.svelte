<script lang="ts">
    import { onMount } from 'svelte';
    import { fetchDirectoryApi } from '$lib/data/directoryApi';

    interface Chapter {
        id: number;
        title: string;
        country: string;
        region: string;
    }

    interface DirectoryResponse {
        chapters: Chapter[];
    }

    interface Turnstile {
        render(
            container: HTMLElement,
            options: {
                sitekey: string;
                action: string;
                callback: (token: string) => void;
                'expired-callback': () => void;
                'error-callback': () => void;
            }
        ): string;
        reset(widgetId: string): void;
    }

    interface TurnstileWindow extends Window {
        turnstile?: Turnstile;
    }

    type Category = 'general' | 'new_chapter' | 'chapter';

    function getTurnstile(): Turnstile | undefined {
        return (window as TurnstileWindow).turnstile;
    }

    let email = $state('');
    let emailError = $state('');
    let emailInput: HTMLInputElement;
    let subject = $state('');
    let category = $state<Category>('general');
    let chapterName = $state('');
    let selectedChapter = $state<Chapter | null>(null);
    let isChapterListOpen = $state(false);
    let activeChapterIndex = $state(0);
    let chapterInput = $state<HTMLInputElement>();
    let message = $state('');
    let chapters = $state<Chapter[]>([]);
    let turnstileSiteKey = $state('');
    let turnstileContainer: HTMLDivElement;
    let turnstileWidgetId = '';
    let captchaToken = $state('');
    let isSubmitting = $state(false);
    let setupError = $state('');
    let chapterError = $state('');
    let chapterValidationError = $state('');
    let statusMessage = $state<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);

    const categoryLabels: Record<Category, string> = {
        general: 'General inquiry',
        new_chapter: 'Starting a new chapter',
        chapter: 'Question about an existing chapter',
    };

    const filteredChapters = $derived(
        chapters
            .filter((chapter) =>
                chapter.title
                    .toLowerCase()
                    .includes(chapterName.trim().toLowerCase())
            )
            .slice(0, 8)
    );

    function handleChapterInput(event: Event) {
        chapterName = (event.currentTarget as HTMLInputElement).value;
        selectedChapter = null;
        chapterValidationError = '';
        activeChapterIndex = 0;
        isChapterListOpen = true;
    }

    function selectChapter(chapter: Chapter) {
        selectedChapter = chapter;
        chapterName = chapter.title;
        chapterValidationError = '';
        isChapterListOpen = false;
        activeChapterIndex = 0;
    }

    function handleChapterKeydown(event: KeyboardEvent) {
        if (event.key === 'ArrowDown' && filteredChapters.length > 0) {
            event.preventDefault();
            isChapterListOpen = true;
            activeChapterIndex =
                (activeChapterIndex + 1) % filteredChapters.length;
        } else if (event.key === 'ArrowUp' && filteredChapters.length > 0) {
            event.preventDefault();
            isChapterListOpen = true;
            activeChapterIndex =
                (activeChapterIndex - 1 + filteredChapters.length) %
                filteredChapters.length;
        } else if (
            event.key === 'Enter' &&
            isChapterListOpen &&
            filteredChapters[activeChapterIndex]
        ) {
            event.preventDefault();
            selectChapter(filteredChapters[activeChapterIndex]);
        } else if (event.key === 'Escape') {
            isChapterListOpen = false;
        }
    }

    function loadTurnstile(): Promise<void> {
        if (getTurnstile()) return Promise.resolve();

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src =
                'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
            script.async = true;
            script.defer = true;
            script.onload = () => {
                if (getTurnstile()) resolve();
                else reject(new Error('Cloudflare Turnstile did not load.'));
            };
            script.onerror = () =>
                reject(new Error('Unable to load Cloudflare Turnstile.'));
            document.head.appendChild(script);
        });
    }

    onMount(() => {
        async function initialize() {
            const [configResult, directoryResult] = await Promise.allSettled([
                fetch('/api/contact/config').then(async (response) => {
                    if (!response.ok) {
                        throw new Error('Unable to load contact form settings.');
                    }
                    return (await response.json()) as {
                        turnstileSiteKey?: string;
                    };
                }),
                fetchDirectoryApi().then(async (response) => {
                    if (!response.ok) {
                        throw new Error(
                            `Chapter directory request failed (${response.status}).`
                        );
                    }
                    return (await response.json()) as DirectoryResponse;
                }),
            ]);

            if (configResult.status === 'fulfilled') {
                turnstileSiteKey = configResult.value.turnstileSiteKey ?? '';
            } else {
                setupError =
                    configResult.reason instanceof Error
                        ? configResult.reason.message
                        : 'Unable to load contact form settings.';
            }

            if (directoryResult.status === 'fulfilled') {
                chapters = directoryResult.value.chapters;
            } else {
                chapterError =
                    directoryResult.reason instanceof Error
                        ? directoryResult.reason.message
                        : 'Unable to load the chapter list.';
            }

            if (!turnstileSiteKey) {
                setupError =
                    'The spam-protection widget is not configured yet. Please contact SPARK directly.';
                return;
            }

            try {
                await loadTurnstile();
                const turnstile = getTurnstile();
                if (!turnstileContainer || !turnstile) {
                    throw new Error('Unable to initialize Cloudflare Turnstile.');
                }

                turnstileWidgetId = turnstile.render(
                    turnstileContainer,
                    {
                        sitekey: turnstileSiteKey,
                        action: 'contact_submit',
                        callback: (token: string) => {
                            captchaToken = token;
                            setupError = '';
                        },
                        'expired-callback': () => {
                            captchaToken = '';
                        },
                        'error-callback': () => {
                            captchaToken = '';
                            setupError =
                                'Spam protection could not be verified. Please try again.';
                        },
                    }
                );
            } catch (error) {
                setupError =
                    error instanceof Error
                        ? error.message
                        : 'Unable to initialize spam protection.';
            }
        }

        void initialize();
    });

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        statusMessage = null;

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            emailError = 'Enter a valid email address.';
            emailInput.focus();
            return;
        }

        if (category === 'chapter' && !selectedChapter) {
            chapterValidationError = 'Choose a chapter from the suggestions.';
            chapterInput?.focus();
            return;
        }

        if (!captchaToken) {
            statusMessage = {
                type: 'error',
                text: 'Complete the spam-protection check before sending.',
            };
            return;
        }

        isSubmitting = true;

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim(),
                    subject: subject.trim(),
                    category,
                    chapterName:
                        category === 'chapter' ? selectedChapter?.title ?? '' : '',
                    message: message.trim(),
                    turnstileToken: captchaToken,
                }),
            });
            const result = (await response.json()) as {
                error?: string;
            };

            if (!response.ok) {
                throw new Error(
                    result.error ?? 'Unable to send your message. Please try again.'
                );
            }

            statusMessage = {
                type: 'success',
                text: 'Your message has been sent successfully. We will reply as soon as possible.',
            };
            email = '';
            subject = '';
            chapterName = '';
            selectedChapter = null;
            message = '';
            captchaToken = '';
            if (turnstileWidgetId) getTurnstile()?.reset(turnstileWidgetId);
        } catch (error) {
            statusMessage = {
                type: 'error',
                text:
                    error instanceof Error
                        ? error.message
                        : 'Failed to send your message. Please try again later.',
            };
            captchaToken = '';
            if (turnstileWidgetId) getTurnstile()?.reset(turnstileWidgetId);
        } finally {
            isSubmitting = false;
        }
    }
</script>

<div class="contact-form-container">
    {#if statusMessage}
        <div
            class="status-banner"
            class:success={statusMessage.type === 'success'}
            class:error={statusMessage.type === 'error'}
            role="status"
        >
            <p>{statusMessage.text}</p>
        </div>
    {/if}

    {#if setupError}
        <p class="setup-notice" role="status">{setupError}</p>
    {/if}

    <form onsubmit={handleSubmit} class="contact-form">
        <div class="form-group">
            <label for="contact-email">
                Email Address <span class="required">*</span>
            </label>
            <input
                type="email"
                id="contact-email"
                bind:this={emailInput}
                name="email"
                placeholder="you@example.com"
                required
                maxlength="254"
                autocomplete="email"
                aria-invalid={Boolean(emailError)}
                aria-describedby="contact-email-error"
                oninput={() => (emailError = '')}
                oninvalid={(event) => {
                    event.preventDefault();
                    emailError = 'Enter a valid email address.';
                    emailInput.focus();
                }}
                bind:value={email}
            />
            {#if emailError}
                <p class="field-note error-note" id="contact-email-error" role="alert">
                    {emailError}
                </p>
            {/if}
        </div>

        <div class="form-group">
            <label for="contact-subject">
                Subject <span class="required">*</span>
            </label>
            <input
                type="text"
                id="contact-subject"
                name="subject"
                placeholder="How can we help?"
                required
                maxlength="120"
                bind:value={subject}
            />
        </div>

        <div class="form-group">
            <label for="contact-category">
                Category <span class="required">*</span>
            </label>
            <select
                id="contact-category"
                name="category"
                required
                bind:value={category}
            >
                <option value="general">General inquiry</option>
                <option value="new_chapter">Starting a new chapter</option>
                <option value="chapter">Question about an existing chapter</option>
            </select>
        </div>

        {#if category === 'chapter'}
            <div class="form-group">
                <label for="chapter-name">
                    Chapter <span class="required">*</span>
                </label>
                <div
                    class="chapter-autocomplete"
                    onfocusout={(event) => {
                        if (
                            !event.currentTarget.contains(
                                event.relatedTarget as Node | null
                            )
                        ) {
                            isChapterListOpen = false;
                        }
                    }}
                >
                    <input
                        type="text"
                        id="chapter-name"
                        bind:this={chapterInput}
                        name="chapterName"
                        placeholder="Type to find a chapter..."
                        autocomplete="off"
                        role="combobox"
                        aria-invalid={Boolean(chapterValidationError)}
                        aria-describedby="chapter-name-error"
                        aria-autocomplete="list"
                        aria-expanded={isChapterListOpen &&
                            filteredChapters.length > 0}
                        aria-controls="chapter-options"
                        aria-activedescendant={isChapterListOpen
                            ? `chapter-option-${filteredChapters[activeChapterIndex]?.id ?? ''}`
                            : undefined}
                        required
                        maxlength="200"
                        value={selectedChapter
                            ? `${selectedChapter.title} Chapter`
                            : chapterName}
                        oninput={handleChapterInput}
                        onfocus={() => (isChapterListOpen = true)}
                        onkeydown={handleChapterKeydown}
                        oninvalid={(event) => {
                            event.preventDefault();
                            chapterValidationError =
                                'Choose a chapter from the suggestions.';
                            chapterInput?.focus();
                        }}
                        disabled={chapters.length === 0}
                    />
                    {#if isChapterListOpen && filteredChapters.length > 0}
                        <div
                            class="chapter-options"
                            id="chapter-options"
                            role="listbox"
                            aria-label="Matching chapters"
                        >
                            {#each filteredChapters as chapter, index (chapter.id)}
                                <button
                                    type="button"
                                    class="chapter-option"
                                    class:active={index === activeChapterIndex}
                                    id={`chapter-option-${chapter.id}`}
                                    role="option"
                                    aria-selected={selectedChapter?.id ===
                                        chapter.id}
                                    onpointerdown={(event) =>
                                        event.preventDefault()}
                                    onclick={() => selectChapter(chapter)}
                                >
                                    <span>{chapter.title} Chapter</span>
                                    <small>{chapter.country} / {chapter.region}</small>
                                </button>
                            {/each}
                        </div>
                    {/if}
                </div>
                {#if chapterValidationError}
                    <p
                        class="field-note error-note"
                        id="chapter-name-error"
                        role="alert"
                    >{chapterValidationError}</p>
                {:else if chapterError}
                    <p class="field-note error-note">{chapterError}</p>
                {:else}
                    <p class="field-note">Type a name to filter the chapter list.</p>
                {/if}
            </div>
        {/if}

        <div class="form-group">
            <label for="contact-message">
                Message <span class="required">*</span>
            </label>
            <textarea
                id="contact-message"
                name="message"
                rows="8"
                placeholder="Write your question, idea, or inquiry here..."
                required
                maxlength="3000"
                bind:value={message}
            ></textarea>
            <p class="field-note">{message.length}/3000 characters</p>
        </div>

        <div class="form-actions">
            <button
                type="submit"
                class="submit-button"
                disabled={isSubmitting || !turnstileSiteKey}
            >
                {#if isSubmitting}
                    <span class="spinner" aria-hidden="true"></span>
                    Sending...
                {:else}
                    Send Message →
                {/if}
            </button>

            <div class="captcha-container">
                <div class="captcha-widget" bind:this={turnstileContainer}></div>
            </div>
        </div>
    </form>
</div>

<style>
    .contact-form-container {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-xl);
        padding: var(--space-2xl);
        box-shadow: var(--shadow-sm);
        max-width: 680px;
    }

    .status-banner,
    .setup-notice {
        padding: 14px 18px;
        border-radius: var(--radius-md);
        margin: 0 0 var(--space-xl);
        font-size: 14px;
        font-weight: 500;
    }

    .status-banner p {
        margin: 0;
    }

    .status-banner.success {
        background: #ecfdf5;
        color: #065f46;
        border: 1px solid #a7f3d0;
    }

    .status-banner.error,
    .setup-notice {
        background: #fef2f2;
        color: #991b1b;
        border: 1px solid #fecaca;
    }

    .contact-form {
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
    }

    .form-group {
        display: flex;
        flex-direction: column;
    }

    .field-note {
        margin: 6px 0 0;
        color: var(--text-tertiary);
        font-size: 0.8125rem;
    }

    .error-note {
        color: #991b1b;
    }

    :global(#chapter-name[aria-invalid='true']) {
        border-color: #dc2626;
    }

    :global(#chapter-name[aria-invalid='true']:focus) {
        box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.2);
    }

    .chapter-autocomplete {
        position: relative;
        width: 100%;
    }

    .chapter-options {
        position: absolute;
        z-index: 10;
        top: calc(100% + 6px);
        left: 0;
        width: 100%;
        max-height: 240px;
        overflow-y: auto;
        padding: 5px;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        background: var(--color-surface);
        color: var(--color-text);
        box-shadow: var(--shadow-md);
    }

    .chapter-option {
        display: flex;
        width: 100%;
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
        padding: 9px 10px;
        border: 0;
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--color-text);
        font: inherit;
        text-align: left;
        cursor: pointer;
    }

    .chapter-option:hover,
    .chapter-option.active {
        background: var(--color-bg-subtle);
    }

    .chapter-option small {
        color: var(--color-text-muted);
        font-size: 0.75rem;
    }

    .form-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-lg);
        flex-wrap: wrap;
    }

    .captcha-container {
        width: 240px;
        height: 52px;
        flex: 0 0 240px;
        overflow: visible;
    }

    .captcha-widget {
        width: 300px;
        height: 65px;
        transform: scale(0.8);
        transform-origin: top left;
    }

    .submit-button {
        box-sizing: border-box;
        height: 52px;
        padding: 0 24px;
        font-size: 15px;
        flex: 0 0 auto;
    }

    .submit-button:disabled {
        cursor: not-allowed;
        opacity: 0.65;
    }

    .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: #ffffff;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
        display: inline-block;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    @media (max-width: 640px) {
        .contact-form-container {
            padding: var(--space-lg);
        }

        .form-actions {
            flex-direction: column;
            align-items: stretch;
        }

        .submit-button {
            width: 100%;
        }

        .captcha-container {
            align-self: flex-start;
        }
    }
</style>
