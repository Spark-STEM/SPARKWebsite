<script lang="ts">
    import LocationDirectory from '$lib/components/LocationDirectory.svelte';
</script>

<svelte:head>
    <title>SPARK - Locations | Elementary School STEM Clubs</title>
    <meta
        name="description"
        content="Explore SPARK chapters and partner schools where student volunteers lead weekly STEM and coding clubs."
    />
</svelte:head>

<div class="container locations-page">
    <header class="page-header">
        <div class="kicker">Locations & Schools</div>
        <h1 class="title">Our Locations</h1>
        <p class="description">
            These are the local schools where SPARK student volunteers run
            weekly afterschool clubs and hands-on STEM sessions.
        </p>
    </header>

    <LocationDirectory />
</div>

<style>
    .locations-page {
        width: 100%;
        min-width: 0;
        flex: 1 1 auto;
        align-self: stretch;
        padding-top: var(--space-2xl);
        padding-bottom: var(--space-4xl);
    }

    :global(.locations-page .page-header) {
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
