<script lang="ts">
    import SplitCard from '$lib/components/SplitCard.svelte';
</script>

<svelte:head>
    <title>SPARK - Mission | About Our Student-Led Organization</title>
    <meta
        name="description"
        content="Learn about SPARK's mission, values, and student-led approach to making STEM education accessible to every child."
    />
</svelte:head>

<div class="container mission-page">
    <!-- Cover Banner -->
    <section class="mission-cover" aria-label="About SPARK cover">
        <div class="cover-image-wrapper">
            <img
                src="/assets/classroom_images/1.png"
                alt="Elementary students working collaboratively on a STEM activity"
            />
            <div class="cover-overlay"></div>
        </div>
        <div class="cover-content">
            <span class="hero-kicker">About SPARK</span>
            <h1 class="page-title">About Us</h1>
            <p class="page-lead">
                We are a student-run volunteering organization dedicated to
                providing hands-on STEM education in local elementary schools
                through afterschool clubs, interactive projects, and high school
                mentorship.
            </p>
        </div>
    </section>

    <!-- Mission Connected Cards -->
    <SplitCard
        kicker="Purpose & Vision"
        title="Our Mission"
        imageSrc="/assets/classroom_images/2.png"
        imageAlt="Elementary students engaged in a coding challenge"
        actionHref="/aboutUs/statistics"
        actionText="Explore Our Statistics →"
        actionVariant="primary"
    >
        <p>
            SPARK introduces STEM through fun, engaging lessons and hands-on
            projects. We want every student to see themselves as an
            imaginative creator and consumer of technology.
        </p>
        <p>
            Our high school volunteers tailor lessons to each classroom, so
            every kid can experiment and ask questions to explore
            technology and its interactions with the world around them.
        </p>
    </SplitCard>

    <SplitCard
        reverse={true}
        kicker="Our Leadership"
        title="Fully Ran by Students"
        imageSrc="/assets/classroom_images/3.png"
        imageAlt="High school volunteer mentor working with small student group"
        actionHref="/aboutUs/locations"
        actionText="View Our Locations →"
        actionVariant="secondary"
    >
        <p>
            We design curriculums and mentor students
            ourselves. Every session is built by high school volunteers who
            care sincerely about educational equity and opportunity.
        </p>
        <p>
            High school volunteers plan activitie and
            continually improve each session so elementary kids stay
            thrilled to explore various aspects of STEM.
        </p>
    </SplitCard>
</div>

<style>
    .mission-page {
        padding-top: var(--space-2xl);
        padding-bottom: var(--space-4xl);
    }

    /* Cover */
    .mission-cover {
        position: relative;
        border-radius: var(--radius-xl);
        overflow: hidden;
        margin-bottom: var(--space-3xl);
        border: 1px solid var(--color-border);
        box-shadow: var(--shadow-md);
        min-height: 380px;
        display: flex;
        align-items: flex-end;
    }

    .cover-image-wrapper {
        position: absolute;
        inset: 0;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    .cover-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(
            180deg,
            rgba(15, 23, 42, 0.2) 0%,
            rgba(15, 23, 42, 0.85) 100%
        );
    }

    .cover-content {
        position: relative;
        z-index: 2;
        padding: var(--space-2xl);
        color: #ffffff;
        max-width: 720px;
    }

    .hero-kicker {
        display: inline-block;
        font-size: 13px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #6ee7b7;
        margin-bottom: var(--space-xs);
    }

    .page-title {
        font-size: clamp(2.4rem, 4.5vw, 3.5rem);
        color: #ffffff;
        margin-bottom: var(--space-sm);
        line-height: 1.1;
    }

    .page-lead {
        font-size: 1.125rem;
        line-height: 1.7;
        color: #e2e8f0;
        margin: 0;
    }

    @media (max-width: 840px) {
        .cover-content {
            padding: var(--space-lg);
        }
    }
</style>
