<script lang="ts">
    import { onMount } from 'svelte';
    import { fade, fly, slide } from 'svelte/transition';
    import { fetchDirectoryApi } from '$lib/data/directoryApi';

    interface DirectoryItem {
        id: number;
        title: string;
        subtitle: string;
        country: string;
        region: string;
        url: string;
        image: string | null;
        images?: string[];
        chapterUrl: string | null;
    }

    interface DirectoryResponse {
        chapters: DirectoryItem[];
        schools: DirectoryItem[];
    }

    let directoryData = $state<DirectoryResponse | null>(null);
    let isLoading = $state(true);
    let loadError = $state('');
    let viewMode = $state<'chapters' | 'schools'>('chapters');

    let searchTerm = $state('');
    let isFilterOpen = $state(false);
    let selectedLocations = $state<string[]>([]);
    let collapsedCountries = $state<string[]>([]);
    let collapsedRegions = $state<string[]>([]);

    const directoryItems = $derived(
        viewMode === 'chapters'
            ? (directoryData?.chapters ?? [])
            : (directoryData?.schools ?? [])
    );

    const availableLocations = $derived(
        Array.from(
            new Map(
                directoryItems
                    .flatMap((item) => [item.country, item.region])
                    .filter(Boolean)
                    .map((location) => [location.toLowerCase(), location])
            )
        ).map(([value, label]) => ({ label, value }))
    );

    function toggleLocation(value: string) {
        if (selectedLocations.includes(value)) {
            selectedLocations = selectedLocations.filter((v) => v !== value);
        } else {
            selectedLocations = [...selectedLocations, value];
        }
    }

    function toggleFilter(e: MouseEvent) {
        e.stopPropagation();
        isFilterOpen = !isFilterOpen;
    }

    function toggleCountry(country: string) {
        collapsedCountries = collapsedCountries.includes(country)
            ? collapsedCountries.filter((value) => value !== country)
            : [...collapsedCountries, country];
    }

    function toggleRegion(country: string, region: string) {
        const key = `${country}:${region}`;
        collapsedRegions = collapsedRegions.includes(key)
            ? collapsedRegions.filter((value) => value !== key)
            : [...collapsedRegions, key];
    }

    onMount(() => {
        function handleClickOutside(e: MouseEvent) {
            const target = e.target as HTMLElement | null;
            if (target && !target.closest('.filter-container')) {
                isFilterOpen = false;
            }
        }
        document.addEventListener('click', handleClickOutside);

        async function loadDirectory() {
            try {
                const response = await fetchDirectoryApi();
                if (!response.ok) {
                    throw new Error(
                        `Directory request failed (${response.status}).`
                    );
                }
                directoryData = (await response.json()) as DirectoryResponse;
            } catch (error) {
                loadError =
                    error instanceof Error
                        ? error.message
                        : 'Unable to load the locations directory.';
            } finally {
                isLoading = false;
            }
        }

        void loadDirectory();
        return () => document.removeEventListener('click', handleClickOutside);
    });

    const filteredItems = $derived(
        directoryItems.filter((item) => {
            const term = searchTerm.toLowerCase().trim();
            const matchesSearch =
                !term ||
                item.title.toLowerCase().includes(term) ||
                item.subtitle.toLowerCase().includes(term) ||
                item.country.toLowerCase().includes(term) ||
                item.region.toLowerCase().includes(term);

            const matchesLocation =
                selectedLocations.length === 0 ||
                selectedLocations.some(
                    (loc) =>
                        item.country.toLowerCase().includes(loc) ||
                        item.region.toLowerCase().includes(loc)
                );

            return matchesSearch && matchesLocation;
        })
    );

    const groupedItems = $derived(
        filteredItems.reduce(
            (countries, item) => {
                const country = countries.find(
                    (group) => group.name === item.country
                );

                if (country) {
                    const region = country.regions.find(
                        (group) => group.name === item.region
                    );
                    if (region) {
                        region.items.push(item);
                    } else {
                        country.regions.push({
                            name: item.region,
                            items: [item],
                        });
                    }
                } else {
                    countries.push({
                        name: item.country,
                        regions: [
                            { name: item.region, items: [item] },
                        ],
                    });
                }

                return countries;
            },
            [] as {
                name: string;
                regions: { name: string; items: typeof filteredItems }[];
            }[]
        )
    );
</script>

<div class="directory-section">
    <div class="search-bar">
        <div class="input-wrapper">
            <input
                type="search"
                placeholder={`Search for a ${viewMode === 'chapters' ? 'chapter' : 'school'}...`}
                aria-label={`Search ${viewMode} by name or location`}
                bind:value={searchTerm}
            />
        </div>

        <div class="filter-container">
            <button
                type="button"
                class="filter-button"
                class:active={selectedLocations.length > 0 || isFilterOpen}
                onclick={toggleFilter}
                aria-label={`Filter ${viewMode} by location`}
                aria-expanded={isFilterOpen}
            >
                <img
                    src="/assets/icons/filter.png"
                    alt=""
                    class="filter-icon"
                />
                {#if selectedLocations.length > 0}
                    <span class="filter-badge">{selectedLocations.length}</span>
                {/if}
            </button>

            {#if isFilterOpen}
                <div
                    class="filter-popover"
                    role="dialog"
                    aria-label="Location filter options"
                >
                    <h3>Filter by Location</h3>
                    {#each availableLocations as loc}
                        <label class="filter-option">
                            <input
                                type="checkbox"
                                checked={selectedLocations.includes(loc.value)}
                                onchange={() => toggleLocation(loc.value)}
                            />
                            <span>{loc.label}</span>
                        </label>
                    {/each}

                    {#if selectedLocations.length > 0}
                        <button
                            type="button"
                            class="clear-btn"
                            onclick={() => (selectedLocations = [])}
                        >
                            Clear filters
                        </button>
                    {/if}
                </div>
            {/if}
        </div>

        <button
            type="button"
            class="view-toggle"
            onclick={() =>
                (viewMode = viewMode === 'chapters' ? 'schools' : 'chapters')}
        >
            Show {viewMode === 'chapters' ? 'Schools' : 'Chapters'}
        </button>
    </div>

    {#if isLoading}
        <div class="directory-groups empty-results" aria-live="polite">
            <p class="empty-state">Loading {viewMode}...</p>
        </div>
    {:else if loadError}
        <div class="directory-groups empty-results" role="alert">
            <p class="empty-state">{loadError}</p>
        </div>
    {:else if filteredItems.length === 0}
        <div class="directory-groups empty-results" aria-live="polite">
            <p class="empty-state">
                No {viewMode} match your search. Try clearing your filters.
            </p>
        </div>
    {:else}
        <div
            class="directory-groups"
            aria-label={`SPARK ${viewMode} directory`}
        >
            {#each groupedItems as country (country.name)}
                <section class="country-group" in:fade={{ duration: 180 }} out:fade={{ duration: 120 }}>
                    <button
                        type="button"
                        class="section-heading country-heading"
                        onclick={() => toggleCountry(country.name)}
                        aria-expanded={!collapsedCountries.includes(country.name)}
                    >
                        <span>{country.name}</span>
                        <span class="heading-line" aria-hidden="true"></span>
                        <span
                            class="chevron"
                            class:collapsed={collapsedCountries.includes(
                                country.name
                            )}
                            aria-hidden="true"></span>
                    </button>

                    {#if !collapsedCountries.includes(country.name)}
                        <div transition:slide={{ duration: 260 }} class="collapsible-content">
                        {#each country.regions as region (region.name)}
                            {@const regionKey = `${country.name}:${region.name}`}
                            <div class="region-group" in:fade={{ duration: 180 }} out:fade={{ duration: 120 }}>
                                <button
                                    type="button"
                                    class="section-heading region-heading"
                                    onclick={() =>
                                        toggleRegion(country.name, region.name)}
                                    aria-expanded={!collapsedRegions.includes(
                                        regionKey
                                    )}
                                >
                                    <span>{region.name}</span>
                                    <span
                                        class="heading-line"
                                        aria-hidden="true"></span>
                                    <span
                                        class="chevron"
                                        class:collapsed={collapsedRegions.includes(
                                            regionKey
                                        )}
                                        aria-hidden="true"></span>
                                </button>

                                {#if !collapsedRegions.includes(regionKey)}
                                    <div transition:slide={{ duration: 240 }} class="collapsible-content">
                                    <div class="location-grid">
                                        {#each region.items as item (item.id)}
                                            <article
                                                class="location-card"
                                                in:fly={{ y: 12, duration: 220 }}
                                                out:fade={{ duration: 140 }}
                                            >
                                                <a
                                                    href={item.url}
                                                    class="card-hitbox"
                                                    aria-label={`View ${viewMode === 'chapters' ? 'chapter' : 'school'} details for ${item.title}`}
                                                ></a>
                                                <div
                                                    class="location-image"
                                                    class:placeholder={!item.image && !item.images?.length}
                                                    class:slanted-collage={item.images && item.images.length > 1}
                                                >
                                                    {#if item.images && item.images.length > 0}
                                                        {#each item.images as image, index (image)}
                                                            {@const left = (index / item.images.length) * 100}
                                                            {@const right = ((index + 1) / item.images.length) * 100}
                                                            {@const leftTop = index === 0 ? '0%' : `calc(${left}% + 18px)`}
                                                            {@const rightTop = index === item.images.length - 1
                                                                ? '100%'
                                                                : `calc(${right}% + 18px)`}
                                                            <img
                                                                src={image}
                                                                alt=""
                                                                style:clip-path={item.images.length > 1
                                                                    ? `polygon(${leftTop} 0, ${rightTop} 0, ${right}% 100%, ${left}% 100%)`
                                                                    : undefined}
                                                            />
                                                        {/each}
                                                    {:else if item.image}
                                                        <img
                                                            src={item.image}
                                                            alt=""
                                                        />
                                                    {:else}
                                                        <span aria-hidden="true">
                                                            {item.title.slice(0, 1)}
                                                        </span>
                                                    {/if}
                                                </div>
                                                <div class="location-details">
                                                    <h3>{item.title}</h3>
                                                    <p>
                                                        {#if item.chapterUrl}
                                                            <a
                                                                href={item.chapterUrl}
                                                                class="chapter-link"
                                                            >{item.subtitle}</a
                                                            >
                                                        {:else}
                                                            {item.subtitle}
                                                        {/if}
                                                    </p>
                                                </div>
                                            </article>
                                        {/each}
                                    </div>
                                    </div>
                                {/if}

                            </div>
                        {/each}
                        </div>
                    {/if}
                </section>
            {/each}
        </div>
    {/if}

</div>

<style>
    .directory-section {
        display: block;
        width: 100%;
        min-width: 0;
        align-self: stretch;
        margin-top: var(--space-xl);
    }

    .search-bar {
        position: sticky;
        top: var(--nav-height);
        z-index: 20;
        display: flex;
        align-items: center;
        gap: var(--space-md);
        margin: 0 calc(var(--space-lg) * -1) var(--space-xl);
        padding: var(--space-sm) var(--space-lg);
        background: color-mix(in srgb, var(--surface-page) 88%, transparent);
        border-bottom: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
        backdrop-filter: blur(14px);
    }

    .input-wrapper {
        flex: 1;
        max-width: 480px;
        position: relative;
        min-width: 0;
    }

    .input-wrapper input {
        padding-left: 42px;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%2364748d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.3-4.3'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: 14px center;
    }

    .filter-container {
        position: relative;
    }

    .view-toggle {
        flex-shrink: 0;
        margin-left: auto;
        padding: 0 16px;
        min-height: 44px;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        background: var(--color-surface);
        color: var(--text-primary);
        font-weight: 650;
        white-space: nowrap;
        box-shadow: var(--shadow-xs);
        transition:
            background 150ms ease,
            border-color 150ms ease,
            color 150ms ease;

        &:hover {
            background: var(--brand-tint);
            border-color: var(--brand);
            color: var(--brand);
        }

        &:focus-visible {
            outline: 2px solid var(--brand);
            outline-offset: 3px;
        }
    }

    .filter-button {
        width: 44px;
        height: 44px;
        padding: 0;
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border);
        background: var(--color-surface);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        cursor: pointer;
        box-shadow: var(--shadow-xs);
        transition:
            background 150ms ease,
            border-color 150ms ease,
            transform 150ms ease;

        &:hover,
        &.active {
            background: var(--brand-tint);
            border-color: var(--brand);
        }
    }

    .filter-icon {
        width: 20px;
        height: 20px;
        object-fit: contain;
    }

    .filter-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background: var(--brand);
        color: #ffffff;
        font-size: 11px;
        font-weight: 700;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .filter-popover {
        position: absolute;
        right: 0;
        top: calc(100% + 8px);
        z-index: 100;
        width: 240px;
        padding: var(--space-md);
        background: var(--color-surface);
        border-radius: var(--radius-lg);
        border: 1px solid var(--color-border);
        box-shadow: var(--shadow-lg);
        animation: popIn 160ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes popIn {
        from {
            opacity: 0;
            transform: translateY(-6px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .filter-popover h3 {
        margin: 0 0 var(--space-sm) 0;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--text-tertiary);
        border-bottom: 1px solid var(--border-subtle);
        padding-bottom: var(--space-xs);
    }

    .filter-option {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: var(--space-xs);
        font-weight: 500;
        font-size: 14px;
        cursor: pointer;
        text-transform: none;
        letter-spacing: 0;
        color: var(--text-primary);

        &:hover {
            color: var(--brand);
        }

        input {
            width: auto;
            margin: 0;
            cursor: pointer;
        }
    }

    .clear-btn {
        margin-top: var(--space-sm);
        padding: 6px 12px;
        font-size: 12px;
        width: 100%;
        background: var(--surface-subtle);
        color: var(--text-secondary);
        border: 1px solid var(--border-subtle);
        box-shadow: none;

        &:hover {
            background: var(--surface-muted);
            color: var(--text-primary);
        }
    }

    .directory-groups {
        display: block;
        width: 100%;
    }

    .empty-results {
        display: block;
        width: 100%;
        min-width: 0;
    }

    .country-group,
    .region-group {
        display: grid;
        gap: var(--space-sm);
    }

    .section-heading {
        display: flex;
        align-items: center;
        width: 100%;
        gap: 10px;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: var(--text-primary);
        box-shadow: none;
        text-align: left;
        cursor: pointer;
        transition: color var(--duration-fast) ease;

        &:hover {
            color: var(--brand);
            background: transparent;
            box-shadow: none;
            transform: none;
        }
    }

    .country-heading {
        position: relative;
        padding: 10px 12px;
        font-size: clamp(1.3rem, 2.4vw, 1.65rem);
        font-weight: 700;
        letter-spacing: -0.01em;
    }

    .region-heading {
        position: relative;
        padding: 8px 12px;
        font-size: 1.15rem;
        font-weight: 650;
    }

    .heading-line {
        height: 1px;
        flex: 1;
        background: var(--border);
    }

    .chevron {
        width: 11px;
        height: 11px;
        margin-right: 4px;
        border-right: 2px solid currentColor;
        border-bottom: 2px solid currentColor;
        transform: rotate(45deg) translateY(-3px);
        transition: transform var(--duration-normal) var(--ease-out);

        &.collapsed {
            transform: rotate(-45deg) translate(-2px, 2px);
        }
    }

    .location-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: var(--space-md);
        padding: var(--space-sm) var(--space-xs) var(--space-sm);
    }

    .location-card {
        position: relative;
        overflow: hidden;
        border: 1px solid #b9afa2;
        border-radius: 12px 12px 5px 5px;
        background: var(--color-surface);
        box-shadow: var(--shadow-sm);
        color: var(--text-primary);
        isolation: isolate;
        transition:
            transform var(--duration-fast) ease,
            box-shadow var(--duration-fast) ease,
            border-color var(--duration-fast) ease;

        &:hover {
            box-shadow: var(--shadow-sm);
            transform: translateY(-2px);
            border-color: var(--brand);
        }
    }

    .location-image {
        position: relative;
        z-index: 1;
        aspect-ratio: 1.65;
        overflow: hidden;
        background: var(--surface-muted);

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        &.slanted-collage {
            display: block;

            img {
                position: absolute;
                inset: 0;
            }
        }

        &.placeholder {
            display: grid;
            place-items: center;
            background:
                radial-gradient(
                    circle at 70% 20%,
                    color-mix(in srgb, var(--brand) 26%, transparent),
                    transparent 45%
                ),
                var(--surface-muted);

            span {
                color: color-mix(in srgb, var(--brand) 78%, white);
                font-size: clamp(3rem, 8vw, 5rem);
                font-weight: 750;
                line-height: 1;
            }
        }
    }

    .card-hitbox {
        position: absolute;
        z-index: 2;
        inset: 0;

        &:focus-visible {
            outline: 3px solid var(--brand);
            outline-offset: -3px;
        }
    }

    .location-details {
        position: relative;
        z-index: 1;
        padding: var(--space-sm) var(--space-md) var(--space-md);

        h3 {
            margin-bottom: 3px;
            color: var(--brand);
            font-size: 1rem;
            line-height: 1.25;
        }

        .chapter-link {
            position: relative;
            z-index: 3;
            color: inherit;
            text-decoration: none;

            &:hover {
                color: var(--brand);
                text-decoration: underline;
            }
        }

        p {
            margin: 0;
            color: var(--text-tertiary);
            font-size: 12px;
        }
    }

    .empty-state {
        width: 100%;
        margin: var(--space-xl) 0;
        text-align: center;
        padding: 40px 20px;
        color: var(--text-tertiary);
        font-style: italic;
    }

    @media (max-width: 640px) {
        .search-bar {
            gap: var(--space-xs);
            margin-right: calc(var(--space-md) * -1);
            margin-left: calc(var(--space-md) * -1);
            padding-right: var(--space-md);
            padding-left: var(--space-md);
        }

        .view-toggle {
            padding-right: 10px;
            padding-left: 10px;
            font-size: 12px;
        }

        .location-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
