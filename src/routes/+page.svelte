<script lang="ts">
    import Carousel from '$lib/components/Carousel.svelte';
    import TestimonialCarousel from '$lib/components/TestimonialCarousel.svelte';
    import StatCard from '$lib/components/StatCard.svelte';
    import { homeImpactStats } from '$lib/data/statistics';
</script>

<svelte:head>
    <title>SPARK - Home | STEM Path Activities & Resources for Kids</title>
    <meta
        name="description"
        content="SPARK is a fully student-run volunteering organization bringing hands-on STEM education and afterschool clubs to local elementary schools."
    />
</svelte:head>

<div class="container home-page">
    <!-- Hero Section -->
    <section class="hero-section" aria-label="Hero section">
        <div class="hero-details">
            <div class="kicker">Student-Led Volunteer Organization</div>
            <h1 class="hero-title">SPARK</h1>
            <h2 class="hero-subtitle">
                STEM Path Activities & Resources for Kids
            </h2>
            <p class="hero-description">
                A passionate group of high school mentors dedicated to bringing
                fun, accessible, and hands-on STEM teaching to local elementary
                classrooms.
            </p>
            <div class="hero-actions">
                <a href="/aboutUs/mission" class="btn btn-lg">Our Mission</a>
                <a href="/aboutUs/locations" class="btn btn-secondary btn-lg"
                    >Our Locations</a
                >
            </div>
        </div>

        <div class="hero-carousel-wrapper">
            <Carousel />
        </div>
    </section>

    <!-- Impact Section -->
    <section class="impact-section" aria-labelledby="stats-heading">
        <div class="impact-header-block">
            <h2 id="stats-heading" class="impact-title">
                We believe that <span class="text-accent">everyone</span> deserves
                the chance of STEM education.
            </h2>
            <div class="section-intro">
                <p class="divider-accent intro-text">
                    In an era where technology shapes our everyday lives, SPARK
                    believes that all children deserve the chance to explore
                    STEM, regardless of economic or social background. We
                    provide accessible resources, projects, and lessons so every
                    student gets an equal opportunity to build and discover.
                </p>
                <a
                    href="/aboutUs/statistics"
                    class="btn btn-secondary btn-lg impact-cta"
                >
                    Explore Our Impact &rarr;
                </a>
            </div>
        </div>

        <div class="stats-grid">
            {#each homeImpactStats as stat}
                <StatCard {stat} />
            {/each}
        </div>
    </section>

    <!-- Testimonials Section -->
    <section
        class="testimonials-section"
        aria-labelledby="testimonials-heading"
    >
        <div class="section-heading-centered">
            <div class="kicker">Community Feedback</div>
            <h2 id="testimonials-heading" class="testimonials-title">
                What <span class="text-accent">others</span> say about us
            </h2>
        </div>
        <TestimonialCarousel />
    </section>
</div>

<style>
    .home-page {
        padding-top: var(--space-2xl);
        padding-bottom: var(--space-4xl);
    }

    /* Hero */
    .hero-section {
        display: grid;
        grid-template-columns: 1fr 1.4fr;
        gap: var(--space-xl);
        align-items: stretch;
        margin-bottom: var(--space-4xl);
    }

    .hero-details {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: var(--space-2xl);
        background: linear-gradient(
            145deg,
            #ffffff 0%,
            var(--surface-subtle) 100%
        );
        border: 1px solid var(--color-border);
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-sm);
    }

    .kicker {
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--brand);
        margin-bottom: var(--space-xs);
    }

    .hero-title {
        font-size: clamp(2.8rem, 5vw, 4rem);
        letter-spacing: -0.04em;
        margin-bottom: 2px;
        background: linear-gradient(135deg, var(--brand) 0%, #0d4a41 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        line-height: 1.05;
    }

    .hero-subtitle {
        font-size: clamp(1.1rem, 2vw, 1.35rem);
        font-weight: 600;
        color: var(--text-secondary);
        margin-bottom: var(--space-md);
        line-height: 1.4;
    }

    .hero-description {
        font-size: 1.05rem;
        line-height: 1.7;
        margin-bottom: var(--space-xl);
        color: var(--text-secondary);
    }

    .hero-actions {
        display: flex;
        gap: var(--space-md);
        flex-wrap: wrap;

        .btn {
            flex: 1;
            min-width: 140px;
        }
    }

    .hero-carousel-wrapper {
        min-height: 380px;
    }

    /* Impact */
    .impact-section {
        margin-bottom: var(--space-4xl);
        padding-top: var(--space-2xl);
    }

    .impact-title {
        font-size: clamp(1.75rem, 3.5vw, 2.4rem);
        line-height: 1.3;
        max-width: 860px;
        margin-bottom: var(--space-lg);
    }

    .section-intro {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--space-xl);
        margin-bottom: var(--space-2xl);
    }

    .intro-text {
        flex: 1;
        min-width: 300px;
        font-size: 1.05rem;
        line-height: 1.7;
    }

    .impact-cta {
        white-space: nowrap;
        align-self: flex-start;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--space-lg);
    }

    /* Testimonials */
    .testimonials-section {
        padding-top: var(--space-xl);
    }

    .section-heading-centered {
        text-align: center;
        margin-bottom: var(--space-2xl);
    }

    .testimonials-title {
        font-size: clamp(1.75rem, 3vw, 2.25rem);
        margin-top: 4px;
    }

    @media (max-width: 768px) {
        .hero-section {
            grid-template-columns: 1fr;
        }

        .stats-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (max-width: 640px) {
        .stats-grid {
            grid-template-columns: 1fr;
        }

        .hero-actions {
            flex-direction: column;

            .btn {
                width: 100%;
            }
        }
    }
</style>
