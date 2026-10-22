<script lang="ts">
    import { page } from '$app/stores';
</script>

<svelte:head>
    <title>Page Not Found | SPARK</title>
</svelte:head>

<div class="container error-container">
    <div class="error-card">
        <div class="error-code">{$page.status || 404}</div>
        <h1 class="error-title">Page Not Found</h1>
        <p class="error-description">
            {$page.error?.message ||
                "Sorry, we couldn't find the page you were looking for."}
        </p>
        <div class="error-actions">
            <a href="/" class="btn btn-lg">Return to Home</a>
            <a href="/aboutUs/locations" class="btn btn-secondary btn-lg"
                >View Locations</a
            >
        </div>
    </div>
</div>

<style>
    .error-container {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-4xl) var(--space-lg);
        min-height: 60vh;
    }

    .error-card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-xl);
        padding: var(--space-3xl) var(--space-2xl);
        text-align: center;
        max-width: 540px;
        box-shadow: var(--shadow-md);
    }

    .error-code {
        font-size: 5rem;
        font-weight: 800;
        line-height: 1;
        color: var(--brand);
        margin-bottom: var(--space-sm);
        letter-spacing: -0.04em;
    }

    .error-title {
        font-size: 1.75rem;
        margin-bottom: var(--space-sm);
    }

    .error-description {
        font-size: 1.05rem;
        color: var(--text-secondary);
        margin-bottom: var(--space-2xl);
        line-height: 1.6;
    }

    .error-actions {
        display: flex;
        gap: var(--space-md);
        justify-content: center;
        flex-wrap: wrap;
    }
</style>
