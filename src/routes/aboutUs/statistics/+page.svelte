<script lang="ts">
    import StatCard from '$lib/components/StatCard.svelte';
    import {
        totalServiceStats,
        teamStats,
        reachStats,
        ratingStats,
    } from '$lib/data/statistics';

    let showSeasonalNotice = $state(false);
</script>

<svelte:head>
    <title>SPARK - Statistics | Our Impact & Community Feedback</title>
    <meta
        name="description"
        content="Discover SPARK's verified community impact statistics — students taught, hours contributed, schools reached, and kid ratings."
    />
</svelte:head>

<div class="container stats-page">
    <header class="page-header statistics-header">
        <div class="kicker">Measurable Impact</div>
        <h1 class="title">Our Service Statistics</h1>
        <div class="page-header-row">
            <p class="description">
                SPARK is dedicated to providing STEM education to all children,
                regardless of their background. Here is a breakdown of our
                verified numbers and student ratings:
            </p>
            <button
                type="button"
                class="btn btn-secondary"
                onclick={() => (showSeasonalNotice = !showSeasonalNotice)}
            >
                Seasonal Statistics
            </button>
        </div>

        {#if showSeasonalNotice}
            <div class="seasonal-banner" role="status">
                <p>
                   <strong>Coming Soon:</strong> Detailed season-by-season reporting
                    and demographic growth metrics are currently being compiled.
                </p>
            </div>
        {/if}
    </header>

    <div class="statistics-flow">
        <!-- Total Service Overview -->
        <section class="stat-group">
            <h2 class="group-title">Total Service Overview</h2>
            <div class="stats-grid three-col">
                {#each totalServiceStats as stat}
                    <StatCard {stat} />
                {/each}
            </div>
        </section>

        <!-- Made Possible By -->
        <section class="stat-group">
            <h2 class="group-title">Made Possible By...</h2>
            <div class="stats-grid two-col">
                {#each teamStats as stat}
                    <StatCard {stat} />
                {/each}
            </div>
        </section>

        <!-- Reach -->
        <section class="stat-group">
            <h2 class="group-title">Across Communities & Regions</h2>
            <div class="stats-grid two-col">
                {#each reachStats as stat}
                    <StatCard {stat} />
                {/each}
            </div>
        </section>

        <!-- Student Ratings -->
        <section class="stat-group">
            <div class="ratings-header">
                <h2 class="group-title">With an Average Rating of...</h2>
                <p class="ratings-note">
                    *Ratings are on a 10-point scale, surveyed directly from
                    participating elementary students.
                </p>
            </div>
            <div class="stats-grid three-col">
                {#each ratingStats as stat}
                    <StatCard {stat} />
                {/each}
            </div>
        </section>
    </div>
</div>

<style>
    .stats-page {
        padding-top: var(--space-2xl);
        padding-bottom: var(--space-4xl);
    }

    .kicker {
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--brand);
        margin-bottom: var(--space-xs);
    }

    .seasonal-banner {
        margin-top: var(--space-md);
        background: var(--brand-tint);
        border: 1px solid var(--brand-muted);
        border-radius: var(--radius-md);
        padding: 12px 16px;
        font-size: 14px;
        color: var(--brand-hover);
        animation: fadeIn 200ms ease;

        p {
            margin: 0;
        }
    }

    .statistics-flow {
        display: flex;
        flex-direction: column;
        gap: var(--space-3xl);
    }

    .stat-group {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
    }

    .group-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-primary);
        border-bottom: 2px solid var(--border);
        padding-bottom: var(--space-xs);
        margin-bottom: var(--space-sm);
    }

    .ratings-header {
        margin-bottom: var(--space-sm);
    }

    .ratings-note {
        font-size: 0.875rem;
        color: var(--text-tertiary);
        font-style: italic;
        margin: 0;
    }

    .stats-grid {
        display: grid;
        gap: var(--space-lg);

        &.three-col {
            grid-template-columns: repeat(3, 1fr);
        }

        &.two-col {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (max-width: 860px) {
        .stats-grid.three-col,
        .stats-grid.two-col {
            grid-template-columns: 1fr;
        }
    }
</style>
