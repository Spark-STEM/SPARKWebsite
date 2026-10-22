<script lang="ts">
    import Carousel from '$lib/components/Carousel.svelte';
    import VolunteerTabs from '$lib/components/VolunteerTabs.svelte';
</script>

<svelte:head>
    <title>SPARK - Volunteer | Join Our High School Mentorship Team</title>
    <meta
        name="description"
        content="Join SPARK as a high school volunteer mentor or parent chaperone. Help inspire elementary students with hands-on STEM education."
    />
</svelte:head>

<div class="container volunteer-page">
    <!-- Hero Section -->
    <section class="volunteer-hero" aria-label="Volunteer Hero">
        <div class="volunteer-hero-content">
            <span class="hero-kicker">Get Involved</span>
            <h1 class="page-title">Volunteer With SPARK</h1>
            <p class="page-lead">
                Help us run engaging STEM clubs for kids in local elementary
                schools. Whether you are a high school student looking to teach
                and mentor, or a parent chaperone supporting classrooms, there
                is a meaningful place for you.
            </p>
            <div class="hero-actions">
                <a href="/contactUs" class="btn btn-lg">Contact Us</a>
                <a href="/aboutUs/locations" class="btn btn-secondary btn-lg"
                    >View Locations</a
                >
            </div>
        </div>
        <div class="volunteer-hero-media">
            <Carousel />
        </div>
    </section>

    <!-- Callout Section -->
    <section class="volunteer-callout" aria-label="Volunteer Pathways">
        <div class="callout-card">
            <h2>We want you to join us</h2>
            <p>
                Everyone can make a difference, and our community needs
                dedicated volunteers to expand our reach. Choose a path below to
                see how you can participate and make an impact.
            </p>
            <p class="disclaimer">
                *High school student status is required to lead student clubs.
            </p>
        </div>
    </section>

    <!-- Interactive Pathways -->
    <VolunteerTabs />
</div>

<style>
    .volunteer-page {
        padding-top: var(--space-2xl);
        padding-bottom: var(--space-4xl);
    }

    .volunteer-hero {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: var(--space-lg);
        align-items: center;
        margin-bottom: var(--space-3xl);
    }

    .hero-kicker {
        font-size: 13px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--brand);
        display: block;
        margin-bottom: var(--space-xs);
    }

    .page-title {
        font-size: clamp(2.4rem, 4vw, 3.2rem);
        margin-bottom: var(--space-sm);
        line-height: 1.15;
    }

    .page-lead {
        font-size: 1.125rem;
        line-height: 1.7;
        color: var(--text-secondary);
        margin-bottom: var(--space-lg);
    }

    .hero-actions {
        display: flex;
        gap: var(--space-md);
        flex-wrap: wrap;
    }

    .volunteer-hero-media {
        min-height: 380px;
        height: 100%;
        width: 100%;
    }

    .volunteer-callout {
        margin-bottom: var(--space-lg);
        width: 100%;
    }

    .callout-card {
        background: var(--surface-subtle);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-xl);
        padding: var(--space-xl) var(--space-2xl);
        text-align: center;
        width: 100%;
        margin: 0;

        h2 {
            font-size: clamp(1.5rem, 2.5vw, 1.9rem);
            margin-bottom: var(--space-xs);
        }

        p {
            max-width: 720px;
            margin: 0 auto var(--space-xs);
            font-size: 1.05rem;
        }

        .disclaimer {
            font-size: 0.875rem;
            color: var(--text-tertiary);
            font-style: italic;
            margin-top: var(--space-sm);
        }
    }

    @media (max-width: 860px) {
        .volunteer-hero {
            grid-template-columns: 1fr;
            gap: var(--space-lg);
        }

        .volunteer-hero-media {
            min-height: 300px;
        }
    }
</style>
