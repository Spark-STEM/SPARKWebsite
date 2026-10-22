<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    let isMobileMenuOpen = $state(false);
    let isAboutDropdownOpen = $state(false);

    function toggleMobileMenu() {
        isMobileMenuOpen = !isMobileMenuOpen;
    }

    function toggleAboutDropdown(e: MouseEvent) {
        e.stopPropagation();
        isAboutDropdownOpen = !isAboutDropdownOpen;
    }

    function closeAll() {
        isMobileMenuOpen = false;
        isAboutDropdownOpen = false;
    }

    onMount(() => {
        function handleClickOutside(e: MouseEvent) {
            const target = e.target as HTMLElement | null;
            if (target && !target.closest('#nav-header')) {
                closeAll();
            }
        }

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                closeAll();
            }
        }

        document.addEventListener('click', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    });
</script>

<header id="nav-header">
    <nav id="nav-bar" aria-label="Main navigation">
        <a href="/" id="logo-link" onclick={closeAll}>
            <img src="/assets/sparkTextLogo.png" id="logo" alt="SPARK STEM" />
        </a>

        <button
            id="menu-toggle"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            onclick={toggleMobileMenu}
        >
            <span class="bar" class:open={isMobileMenuOpen}></span>
            <span class="bar" class:open={isMobileMenuOpen}></span>
            <span class="bar" class:open={isMobileMenuOpen}></span>
        </button>

        <div id="nav-links" class:open={isMobileMenuOpen}>
            <div class="dropdown" class:open={isAboutDropdownOpen}>
                <button
                    class="dropdown-title"
                    class:active={$page.url.pathname.startsWith('/aboutUs')}
                    aria-haspopup="true"
                    aria-expanded={isAboutDropdownOpen}
                    onclick={toggleAboutDropdown}
                >
                    About Us
                    <span
                        class="arrow"
                        class:rotated={isAboutDropdownOpen}
                        aria-hidden="true">›</span
                    >
                </button>

                <div
                    class="dropdown-hover-bridge"
                    class:show={isAboutDropdownOpen}
                >
                    <div class="dropdown-content" role="menu">
                        <a
                            href="/aboutUs/mission"
                            class:active={$page.url.pathname ===
                                '/aboutUs/mission'}
                            role="menuitem"
                            onclick={closeAll}
                        >
                            Mission
                        </a>
                        <a
                            href="/aboutUs/locations"
                            class:active={$page.url.pathname.startsWith(
                                '/aboutUs/locations'
                            )}
                            role="menuitem"
                            onclick={closeAll}
                        >
                            Locations
                        </a>
                        <a
                            href="/aboutUs/statistics"
                            class:active={$page.url.pathname ===
                                '/aboutUs/statistics'}
                            role="menuitem"
                            onclick={closeAll}
                        >
                            Statistics
                        </a>
                    </div>
                </div>
            </div>

            <a
                href="/Xcratch"
                class="nav-link"
                rel="external"
                class:active={($page.url.pathname as string).startsWith(
                    '/Xcratch'
                )}
                onclick={closeAll}
            >
                Xcratch
            </a>
            <a
                href="/volunteer"
                class="nav-link"
                class:active={$page.url.pathname === '/volunteer'}
                onclick={closeAll}
            >
                Volunteer
            </a>
            <a
                href="/contactUs"
                class="nav-cta"
                class:active={$page.url.pathname === '/contactUs'}
                onclick={closeAll}
            >
                Contact Us
            </a>
        </div>
    </nav>
</header>

<style>
    #nav-header {
        position: sticky;
        top: 0;
        z-index: 1000;
        width: 100%;
        background: rgba(255, 255, 255, 0.88);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border-bottom: 1px solid var(--color-border);
        transition: background 200ms ease;
    }

    #nav-bar {
        max-width: var(--container-max, 1280px);
        margin: 0 auto;
        padding: 0 var(--space-lg, 24px);
        height: var(--nav-height, 64px);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    #logo-link {
        display: flex;
        align-items: center;
        text-decoration: none;
    }

    #logo {
        height: 38px;
        width: auto;
        display: block;
        transition: transform 150ms ease;

        &:hover {
            transform: scale(1.02);
        }
    }

    #nav-links {
        display: flex;
        gap: 6px;
        align-items: center;
    }

    .nav-link,
    .dropdown-title {
        color: var(--text-secondary);
        text-decoration: none;
        padding: 8px 14px;
        border-radius: var(--radius-sm);
        font-weight: 500;
        font-size: 0.9375rem;
        transition:
            color 150ms ease,
            background 150ms ease;
        border: none;
        background: none;
        cursor: pointer;
        font-family: inherit;

        &:hover,
        &.active {
            color: var(--brand);
            background: var(--brand-tint);
        }
    }

    .dropdown {
        position: relative;
    }

    .dropdown-title {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .dropdown .arrow {
        font-size: 0.85rem;
        font-weight: bold;
        transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
        color: var(--text-tertiary);

        &.rotated {
            transform: rotate(90deg);
        }
    }

    .dropdown:hover .arrow {
        transform: rotate(90deg);
    }

    .dropdown-hover-bridge {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        padding-top: 8px;
        z-index: 100;

        &.show {
            display: block;
        }
    }

    @media (min-width: 769px) {
        .dropdown:hover .dropdown-hover-bridge {
            display: block;
        }
    }

    .dropdown-content {
        background: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        min-width: 200px;
        box-shadow: var(--shadow-lg);
        padding: 6px;
        animation: dropIn 180ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    .dropdown-content a {
        display: block;
        padding: 9px 14px;
        color: var(--text-secondary);
        border-radius: var(--radius-sm);
        font-size: 0.9375rem;
        text-decoration: none;
        transition:
            background 150ms ease,
            color 150ms ease;

        &:hover,
        &.active {
            background: var(--brand-tint);
            color: var(--brand);
        }
    }

    @keyframes dropIn {
        from {
            opacity: 0;
            transform: translateY(-6px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .nav-cta {
        background: var(--brand) !important;
        color: #ffffff !important;
        margin-left: 8px;
        padding: 8px 18px;
        border-radius: var(--radius-md);
        font-weight: 600;
        font-size: 0.9375rem;
        text-decoration: none;
        box-shadow: var(--shadow-xs);
        transition:
            background 150ms ease,
            transform 150ms ease,
            box-shadow 150ms ease;

        &:hover {
            background: var(--brand-hover) !important;
            transform: translateY(-1px);
            box-shadow: var(--shadow-sm);
        }

        &:active {
            transform: translateY(0);
        }
    }

    #menu-toggle {
        display: none;
        background: none;
        border: none;
        padding: 8px;
        cursor: pointer;
        border-radius: var(--radius-sm);

        &:hover {
            background: var(--surface-muted);
        }
    }

    .bar {
        display: block;
        width: 22px;
        height: 2px;
        background: var(--text-primary);
        margin: 5px 0;
        border-radius: 2px;
        transition:
            transform 200ms ease,
            opacity 200ms ease;
    }

    @media (max-width: 768px) {
        #nav-bar {
            padding: 0 var(--space-md, 18px);
        }

        #menu-toggle {
            display: block;
        }

        #nav-links {
            display: none;
            position: absolute;
            top: var(--nav-height, 64px);
            left: 0;
            right: 0;
            flex-direction: column;
            align-items: stretch;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(14px);
            border-bottom: 1px solid var(--color-border);
            padding: 16px 20px 24px;
            gap: 4px;
            box-shadow: var(--shadow-lg);

            &.open {
                display: flex;
            }
        }

        .nav-link,
        .dropdown-title {
            padding: 12px 14px;
            width: 100%;
            text-align: left;
        }

        .dropdown-hover-bridge {
            position: static;
            padding-top: 0;
        }

        .dropdown-content {
            position: static;
            box-shadow: none;
            border: none;
            padding: 0 0 0 16px;
            background: transparent;
            animation: none;
        }

        .nav-cta {
            margin-left: 0;
            margin-top: 10px;
            text-align: center;
            padding: 12px 14px;
        }
    }
</style>
