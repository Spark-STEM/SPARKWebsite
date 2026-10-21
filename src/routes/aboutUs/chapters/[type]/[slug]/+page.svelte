<script lang="ts">
    import { page } from '$app/state';
    import DirectoryMap from '$lib/components/DirectoryMap.svelte';
    import { getDirectoryApiBase } from '$lib/data/directoryApi';

    interface DirectorySchool {
        id: number;
        name: string;
        address: string | null;
        latitude: number | null;
        longitude: number | null;
        link: string | null;
    }

    interface DirectoryMember {
        id: number;
        name: string;
        email: string | null;
        isLead: boolean;
        roles: string | null;
    }

    interface ProgramSchedule {
        days: string[];
        startTime: string;
        endTime: string;
    }

    interface Program {
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
        schedules: ProgramSchedule[];
    }

    interface DirectoryDetail {
        type: 'chapter' | 'school';
        entity: {
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
        };
        schools: DirectorySchool[];
        members: DirectoryMember[];
        activePrograms: Program[];
        oldPrograms: Program[];
    }

    const type = $derived(page.params.type);
    const slug = $derived(page.params.slug);
    let isLoading = $state(true);
    let detail = $state<DirectoryDetail | null>(null);
    let loadError = $state('');
    let selectedProgram = $state<Program | null>(null);
    let programDialog: HTMLDialogElement | undefined;
    let requestVersion = 0;

    const chapterUrl = $derived(
        detail?.entity.chapterId && detail.entity.chapterName
            ? `/aboutUs/chapters/chapter/${detail.entity.chapterId}-${toSlug(detail.entity.chapterName)}`
            : null
    );

    function toSlug(value: string): string {
        return value
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }

    function formatDate(value: string | null): string {
        if (!value) return 'Not set';
        const date = new Date(`${value.slice(0, 10)}T00:00:00`);
        return Number.isNaN(date.getTime())
            ? value
            : date.toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
              });
    }

    function formatDateRange(program: Program): string {
        if (!program.start_date && !program.end_date) return 'Not set';
        return `${formatDate(program.start_date)} – ${formatDate(program.end_date)}`;
    }

    function formatFee(fee: number | null): string {
        if (fee === null) return 'Not set';
        return fee === 0
            ? 'Free'
            : new Intl.NumberFormat(undefined, {
                  style: 'currency',
                  currency: 'USD',
              }).format(fee);
    }

    function showProgram(program: Program) {
        selectedProgram = program;
        requestAnimationFrame(() => programDialog?.showModal());
    }

    $effect(() => {
        const currentType = type;
        const currentSlug = slug;
        const version = ++requestVersion;

        if (
            (currentType !== 'chapter' && currentType !== 'school') ||
            !currentSlug
        ) {
            detail = null;
            loadError = 'This directory entry was not found.';
            isLoading = false;
            return;
        }

        const entrySlug = currentSlug;
        detail = null;
        loadError = '';
        isLoading = true;

        async function loadDetail() {
            try {
                const response = await fetch(
                    `${getDirectoryApiBase()}/${currentType}/${encodeURIComponent(entrySlug)}`
                );
                if (!response.ok) {
                    throw new Error(
                        response.status === 404
                            ? 'This directory entry was not found.'
                            : `Directory request failed (${response.status}).`
                    );
                }

                const result = (await response.json()) as DirectoryDetail;
                if (version === requestVersion) detail = result;
            } catch (error) {
                if (version !== requestVersion) return;
                loadError =
                    error instanceof Error
                        ? error.message
                        : 'Unable to load this directory entry.';
            } finally {
                if (version === requestVersion) isLoading = false;
            }
        }

        void loadDetail();
    });
</script>

<svelte:head>
    <title>
        {detail?.entity.name
            ? `SPARK - ${detail.entity.name}`
            : 'SPARK - Chapter & School Details'}
    </title>
    <meta
        name="description"
        content="Explore SPARK chapter and school members, programs, and locations."
    />
</svelte:head>

<div class="container detail-page">
    {#if isLoading}
        <p class="status-message" aria-live="polite">Loading directory details...</p>
    {:else if loadError}
        <div class="status-message error-message" role="alert">
            <p>{loadError}</p>
            <a href="/aboutUs/chapters">Return to the chapter directory</a>
        </div>
    {:else if detail}
        {@const isChapter = detail.type === 'chapter'}
        <header class="hero">
            <div class="hero-image">
                {#if detail.entity.coverImage}
                    <img src={detail.entity.coverImage} alt="" />
                {:else}
                    <span aria-hidden="true">
                        {detail.entity.name.slice(0, 1)}
                    </span>
                {/if}
            </div>
            <div class="hero-copy">
                <p class="eyebrow">
                    {isChapter ? 'SPARK Chapter' : 'Partner School'}
                </p>
                <h1>{detail.entity.name}</h1>
                {#if isChapter}
                    <p>
                        {detail.entity.schoolCount ?? detail.schools.length}
                        {detail.entity.schoolCount === 1 ? 'school' : 'schools'}
                        · {detail.entity.city}, {detail.entity.region}
                    </p>
                {:else if detail.entity.chapterName && chapterUrl}
                    <a class="chapter-subtitle" href={chapterUrl}>
                        {detail.entity.chapterName} chapter
                    </a>
                    {#if detail.entity.address}
                        <p>{detail.entity.address}</p>
                    {/if}
                {:else if detail.entity.address}
                    <p>{detail.entity.address}</p>
                {/if}
                {#if !isChapter && detail.entity.link}
                    <a
                        class="school-website"
                        href={detail.entity.link}
                        target="_blank"
                        rel="noopener noreferrer"
                    >Visit school website</a>
                {/if}
            </div>
            <a class="back-link" href="/aboutUs/chapters">All chapters & schools</a>
        </header>

        <div class="detail-grid">
            <div class="main-column">
                <section class="panel members-panel">
                    <div class="section-title">
                        <h2>{isChapter ? 'Members' : 'Chapter Members'}</h2>
                        <span>{detail.members.length}</span>
                    </div>
                    {#if detail.members.length > 0}
                        <ul class="member-list">
                            {#each detail.members as member (member.id)}
                                <li class:chapter-lead={member.isLead}>
                                    <div class="member-info">
                                        <strong>{member.name}</strong>
                                        {#if member.isLead}
                                            <span class="lead-badge">Chapter Lead</span>
                                        {:else if member.roles}
                                            <span class="member-role">
                                                {member.roles}
                                            </span>
                                        {/if}
                                    </div>
                                    {#if member.isLead}
                                        {#if member.email}
                                            <a href={`mailto:${member.email}`}>
                                                {member.email}
                                            </a>
                                        {:else}
                                            <span class="member-role">Email not listed</span>
                                        {/if}
                                    {/if}
                                </li>
                            {/each}
                        </ul>
                    {:else}
                        <p class="empty-state">No member records are available.</p>
                    {/if}
                </section>

                <section class="panel old-programs-panel">
                    <div class="section-title">
                        <h2>Past Programs</h2>
                        <span>{detail.oldPrograms.length}</span>
                    </div>
                    {#if detail.oldPrograms.length > 0}
                        <div class="table-scroll">
                            <table>
                                <thead>
                                    <tr>
                                        <th scope="col">Program</th>
                                        {#if isChapter}
                                            <th scope="col">School</th>
                                        {/if}
                                        <th scope="col">Grades</th>
                                        <th scope="col">Date range</th>
                                        <th scope="col">Fee</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each detail.oldPrograms as program (program.id)}
                                        <tr>
                                            <td>
                                                <button
                                                    class="program-link"
                                                    type="button"
                                                    onclick={() => showProgram(program)}
                                                >
                                                    {program.name}
                                                </button>
                                            </td>
                                            {#if isChapter}
                                                <td>{program.school_name}</td>
                                            {/if}
                                            <td>
                                                {#if program.min_grade !== null && program.max_grade !== null}
                                                    {program.min_grade}–{program.max_grade}
                                                {:else}
                                                    Not set
                                                {/if}
                                            </td>
                                            <td>{formatDateRange(program)}</td>
                                            <td>{formatFee(program.fee)}</td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    {:else}
                        <p class="empty-state">No past programs are listed.</p>
                    {/if}
                </section>
            </div>

            <aside class="side-column">
                <section class="panel map-panel">
                    <div class="section-title">
                        <h2>Location</h2>
                    </div>
                    <DirectoryMap locations={detail.schools} />
                    {#if detail.schools.length > 0}
                        <ul class="location-list">
                            {#each detail.schools as school (school.id)}
                                <li>
                                    <strong>{school.name}</strong>
                                    {#if school.address}
                                        <span>{school.address}</span>
                                    {/if}
                                </li>
                            {/each}
                        </ul>
                    {/if}
                </section>

                <section class="panel active-programs-panel">
                    <div class="section-title">
                        <h2>Active Programs</h2>
                        <span>{detail.activePrograms.length}</span>
                    </div>
                    {#if detail.activePrograms.length > 0}
                        <div class="active-program-list">
                            {#each detail.activePrograms as program (program.id)}
                                <button
                                    class="active-program-card"
                                    type="button"
                                    onclick={() => showProgram(program)}
                                >
                                    {#if isChapter}
                                        <span class="program-school">
                                            {program.school_name}
                                        </span>
                                    {/if}
                                    <strong>{program.name}</strong>
                                    <span>
                                        {#if program.min_grade !== null && program.max_grade !== null}
                                            Grades {program.min_grade}–{program.max_grade}
                                        {:else}
                                            Grades not set
                                        {/if}
                                    </span>
                                    <span>{formatDateRange(program)}</span>
                                </button>
                            {/each}
                        </div>
                    {:else}
                        <p class="empty-state">No active programs are listed.</p>
                    {/if}
                </section>
            </aside>
        </div>
    {/if}
</div>

<dialog
    class="program-dialog"
    bind:this={programDialog}
    onclose={() => (selectedProgram = null)}
    aria-labelledby="program-dialog-title"
>
    {#if selectedProgram}
        <div class="dialog-content">
            <button
                class="dialog-close"
                type="button"
                aria-label="Close program details"
                onclick={() => programDialog?.close()}
            >×</button>
            <p class="eyebrow">{selectedProgram.status ?? 'Program'}</p>
            <h2 id="program-dialog-title">{selectedProgram.name}</h2>
            {#if detail?.type === 'chapter'}
                <p class="dialog-school">{selectedProgram.school_name}</p>
            {/if}
            {#if selectedProgram.description}
                <p>{selectedProgram.description}</p>
            {/if}
            <dl class="program-details">
                <div>
                    <dt>Grades</dt>
                    <dd>
                        {#if selectedProgram.min_grade !== null && selectedProgram.max_grade !== null}
                            {selectedProgram.min_grade}–{selectedProgram.max_grade}
                        {:else}
                            Not set
                        {/if}
                    </dd>
                </div>
                <div>
                    <dt>Dates</dt>
                    <dd>{formatDateRange(selectedProgram)}</dd>
                </div>
                <div>
                    <dt>Fee</dt>
                    <dd>{formatFee(selectedProgram.fee)}</dd>
                </div>
                <div>
                    <dt>Students / tutors</dt>
                    <dd>
                        {selectedProgram.student_count ?? 'Not set'} /
                        {selectedProgram.tutor_count ?? 'Not set'}
                    </dd>
                </div>
                {#if selectedProgram.location}
                    <div>
                        <dt>Room</dt>
                        <dd>{selectedProgram.location}</dd>
                    </div>
                {/if}
            </dl>
            {#if selectedProgram.schedules.length > 0}
                <h3>Schedule</h3>
                <ul class="schedule-list">
                    {#each selectedProgram.schedules as schedule, index (index)}
                        <li>
                            {schedule.days.length > 0
                                ? schedule.days.join(', ')
                                : 'Day not set'}
                            · {schedule.startTime}–{schedule.endTime}
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
    {/if}
</dialog>

<style>
    .detail-page {
        width: 100%;
        min-width: 0;
        flex: 1 1 auto;
        align-self: stretch;
        padding-top: var(--space-2xl);
        padding-bottom: var(--space-4xl);
    }

    .hero,
    .panel {
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        background: var(--color-surface);
        box-shadow: var(--shadow-sm);
    }

    .hero {
        position: relative;
        display: grid;
        grid-template-columns: minmax(180px, 0.7fr) minmax(0, 2fr);
        align-items: center;
        gap: var(--space-xl);
        min-height: 220px;
        margin-bottom: var(--space-xl);
        padding: var(--space-xl);
        overflow: hidden;
    }

    .hero-image {
        display: grid;
        min-height: 160px;
        place-items: center;
        overflow: hidden;
        border-radius: var(--radius-md);
        background:
            radial-gradient(
                circle at 70% 20%,
                color-mix(in srgb, var(--brand) 26%, transparent),
                transparent 45%
            ),
            var(--surface-muted);

        img {
            width: 100%;
            height: 100%;
            min-height: 160px;
            object-fit: cover;
        }

        span {
            color: color-mix(in srgb, var(--brand) 78%, white);
            font-size: 5rem;
            font-weight: 750;
        }
    }

    .hero-copy {
        min-width: 0;

        h1 {
            margin: 0 0 var(--space-xs);
            color: var(--text-primary);
            font-size: clamp(1.8rem, 4vw, 2.7rem);
        }

        p {
            margin: var(--space-xs) 0;
            color: var(--text-secondary);
        }
    }

    .eyebrow {
        margin: 0 0 var(--space-xs);
        color: var(--brand);
        font-size: 0.75rem;
        font-weight: 750;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    .chapter-subtitle,
    .school-website,
    .back-link {
        color: var(--brand);
        font-weight: 650;
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }

    .school-website {
        display: inline-block;
        margin-top: var(--space-xs);
    }

    .back-link {
        position: absolute;
        top: var(--space-lg);
        right: var(--space-lg);
        font-size: 0.875rem;
    }

    .detail-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.85fr);
        align-items: start;
        gap: var(--space-lg);
    }

    .main-column,
    .side-column {
        display: grid;
        min-width: 0;
        gap: var(--space-lg);
    }

    .panel {
        min-width: 0;
        padding: var(--space-lg);
    }

    .section-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-sm);
        margin-bottom: var(--space-md);
        padding-bottom: var(--space-sm);
        border-bottom: 1px solid var(--border-subtle);

        h2 {
            margin: 0;
            color: var(--text-primary);
            font-size: 1.25rem;
        }

        > span {
            display: grid;
            min-width: 28px;
            min-height: 28px;
            place-items: center;
            padding: 0 8px;
            border-radius: 999px;
            background: var(--brand-tint);
            color: var(--brand);
            font-size: 0.8rem;
            font-weight: 700;
        }
    }

    .member-list,
    .location-list,
    .schedule-list {
        display: grid;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .member-list {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--space-sm);

        li {
            display: grid;
            align-content: center;
            gap: 4px;
            min-width: 0;
            padding: var(--space-sm) var(--space-md);
            border: 1px solid var(--border-subtle);
            border-radius: var(--radius-md);
            background: var(--surface-subtle);
        }

        .chapter-lead {
            grid-column: 1 / -1;
            border-color: color-mix(in srgb, var(--brand) 60%, var(--border));
            background: color-mix(in srgb, var(--brand-tint) 70%, white);
        }

        a {
            overflow-wrap: anywhere;
            color: var(--brand);
            font-size: 0.875rem;
        }
    }

    .member-info {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;

        strong {
            color: var(--text-primary);
        }
    }

    .lead-badge {
        padding: 3px 8px;
        border-radius: 999px;
        background: var(--brand);
        color: #fff;
        font-size: 0.7rem;
        font-weight: 750;
    }

    .member-role,
    .program-school {
        color: var(--text-tertiary);
        font-size: 0.8rem;
    }

    .table-scroll {
        max-height: 420px;
        overflow: auto;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
    }

    table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.85rem;
        text-align: left;

        th,
        td {
            padding: 10px 12px;
            border-bottom: 1px solid var(--border-subtle);
            white-space: nowrap;
        }

        th {
            position: sticky;
            top: 0;
            z-index: 1;
            background: var(--surface-subtle);
            color: var(--text-secondary);
            font-size: 0.75rem;
        }

        tr:last-child td {
            border-bottom: 0;
        }
    }

    .program-link {
        padding: 0;
        border: 0;
        background: transparent;
        color: var(--brand);
        font: inherit;
        font-weight: 650;
        text-align: left;
        cursor: pointer;

        &:hover {
            text-decoration: underline;
        }
    }

    .location-list {
        gap: var(--space-sm);
        margin-top: var(--space-md);

        li {
            display: grid;
            gap: 3px;
            color: var(--text-primary);
            font-size: 0.875rem;
        }

        span {
            color: var(--text-tertiary);
            font-size: 0.8rem;
        }
    }

    .active-program-list {
        display: grid;
        gap: var(--space-sm);
    }

    .active-program-card {
        display: grid;
        justify-items: start;
        gap: 6px;
        width: 100%;
        padding: var(--space-md);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--surface-subtle);
        color: var(--text-secondary);
        font: inherit;
        font-size: 0.8rem;
        text-align: left;
        cursor: pointer;
        transition:
            border-color 150ms ease,
            transform 150ms ease;

        strong {
            color: var(--text-primary);
            font-size: 1rem;
        }

        &:hover {
            transform: translateY(-2px);
            border-color: var(--brand);
        }
    }

    .empty-state {
        margin: 0;
        color: var(--text-tertiary);
        font-size: 0.9rem;
    }

    .status-message {
        margin: var(--space-3xl) auto;
        padding: var(--space-xl);
        color: var(--text-secondary);
        text-align: center;
    }

    .error-message {
        max-width: 640px;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        background: var(--color-surface);

        a {
            color: var(--brand);
        }
    }

    .program-dialog {
        width: min(620px, calc(100% - 32px));
        max-height: min(85vh, 760px);
        padding: 0;
        overflow: auto;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        background: var(--color-surface);
        color: var(--text-primary);
        box-shadow: var(--shadow-lg);

        &::backdrop {
            background: rgb(12 20 30 / 68%);
            backdrop-filter: blur(3px);
        }
    }

    .dialog-content {
        position: relative;
        padding: var(--space-xl);

        h2 {
            margin: 0 40px var(--space-sm) 0;
        }

        h3 {
            margin: var(--space-lg) 0 var(--space-sm);
        }
    }

    .dialog-close {
        position: absolute;
        top: var(--space-md);
        right: var(--space-md);
        display: grid;
        width: 38px;
        height: 38px;
        place-items: center;
        border: 1px solid var(--border-subtle);
        border-radius: 50%;
        background: var(--surface-subtle);
        color: var(--text-primary);
        font-size: 1.5rem;
        cursor: pointer;
    }

    .dialog-school {
        color: var(--brand);
        font-weight: 650;
    }

    .program-details {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--space-sm);
        margin: var(--space-lg) 0 0;

        div {
            padding: var(--space-sm);
            border-radius: var(--radius-sm);
            background: var(--surface-subtle);
        }

        dt {
            color: var(--text-tertiary);
            font-size: 0.75rem;
        }

        dd {
            margin: 4px 0 0;
            font-weight: 650;
        }
    }

    .schedule-list {
        gap: 6px;
        color: var(--text-secondary);
    }

    @media (max-width: 850px) {
        .detail-grid {
            grid-template-columns: minmax(0, 1fr);
        }
    }

    @media (max-width: 600px) {
        .hero {
            grid-template-columns: 1fr;
            gap: var(--space-md);
            padding: var(--space-md);
        }

        .hero-image {
            min-height: 130px;
        }

        .back-link {
            position: static;
            grid-row: 1;
            justify-self: start;
        }

        .member-list {
            grid-template-columns: 1fr;

            .chapter-lead {
                grid-column: auto;
            }
        }

        .panel {
            padding: var(--space-md);
        }

        .program-details {
            grid-template-columns: 1fr;
        }
    }
</style>
