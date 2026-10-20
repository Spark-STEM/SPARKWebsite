<script lang="ts">
    import ChapterDirectory from '$lib/components/ChapterDirectory.svelte';
</script>

<svelte:head>
    <title>SPARK - Chapters | Elementary School STEM Clubs</title>
    <meta
        name="description"
        content="Explore the active SPARK elementary school chapters where student volunteers lead weekly STEM and coding clubs."
    />
</svelte:head>

<div class="container chapters-page">
    <header class="page-header">
        <div class="kicker">Locations & Schools</div>
        <h1 class="title">Our Chapters</h1>
        <p class="description">
            These are the local schools where SPARK student volunteers run
            weekly afterschool clubs and hands-on STEM sessions.
        </p>
    </header>

    <ChapterDirectory />
</div>

<style>
    .chapters-page {
        width: 100%;
        min-width: 0;
        flex: 1 1 auto;
        align-self: stretch;
        padding-top: var(--space-2xl);
        padding-bottom: var(--space-4xl);
    }

    :global(.chapters-page .page-header) {
        max-width: none;
        margin-bottom: 0;
        padding: var(--space-lg) var(--space-lg) var(--space-md);
        background: var(--surface-subtle);
        border: 1px solid var(--border-subtle);
    }

    .kicker {
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--brand);
        margin-bottom: var(--space-xs);
    }
</style>
