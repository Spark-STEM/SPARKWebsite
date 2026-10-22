<footer id="site-footer">
    <div class="footer-container">
        <div class="footer-col">
            <h3>Quick Links</h3>
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/aboutUs/mission">Mission</a></li>
                <li><a href="/aboutUs/locations">Locations</a></li>
                <li><a href="/aboutUs/statistics">Our Statistics</a></li>
                <li><a href="/volunteer">Volunteer</a></li>
                <li><a href="/contactUs">Contact Us</a></li>
                <li>
                    <a
                        href="https://github.com/StormBlackthorn/SPARKWebsite"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        GitHub Repo ↗
                    </a>
                </li>
            </ul>
        </div>

        <div class="footer-col">
            <h3>Connect</h3>
            <ul class="social-links">
                <li>
                    <a
                        href="https://www.instagram.com/spark.stem/"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="social-link"
                    >
                        <img
                            src="/assets/icons/instagram.png"
                            alt=""
                            class="social-icon"
                        />
                        Instagram
                    </a>
                </li>
                <li>
                    <a
                        href="https://github.com/StormBlackthorn/SPARKWebsite"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="social-link"
                    >
                        <img
                            src="/assets/icons/github.png"
                            alt=""
                            class="social-icon"
                        />
                        GitHub
                    </a>
                </li>
            </ul>
        </div>

        <div class="footer-col about-col">
            <h3>About SPARK</h3>
            <p>
                Inspiring STEM creativity through hands-on projects, innovation,
                and mentorship. Empowering the next generation of problem
                solvers, creators, and leaders.
            </p>
        </div>
    </div>

    <div class="footer-bottom">
        <div class="copyright">
            <strong>© {new Date().getFullYear()} SPARK STEM Club</strong> · All Rights
            Reserved
        </div>
        <div class="credits">
            Website designed & built by Yo-cheng Liao and Videep Mannava
        </div>
    </div>
</footer>

<style>
    #site-footer {
        background: #ffffff;
        border-top: 1px solid var(--color-border);
        padding: 56px 24px 36px;
        color: var(--text-secondary);
        margin-top: auto;
    }

    .footer-container {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 40px;
        max-width: var(--container-max, 1280px);
        margin: 0 auto;
    }

    .footer-col h3 {
        margin: 0 0 18px 0;
        font-size: 0.8125rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-primary);
    }

    .footer-col p {
        margin: 0;
        font-size: 0.9375rem;
        line-height: 1.7;
        color: var(--text-secondary);
    }

    .footer-col ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .footer-col li {
        margin-bottom: 10px;
    }

    .footer-col a {
        color: var(--text-secondary);
        text-decoration: none;
        font-size: 0.9375rem;
        transition: color 150ms ease;

        &:hover {
            color: var(--brand);
        }
    }

    .social-links {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .social-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }

    .social-icon {
        width: 18px;
        height: 18px;
        object-fit: contain;
        opacity: 0.85;
        transition: opacity 150ms ease;

        .social-link:hover & {
            opacity: 1;
        }
    }

    .footer-bottom {
        text-align: center;
        max-width: var(--container-max, 1280px);
        margin: 48px auto 0;
        padding-top: 24px;
        border-top: 1px solid var(--border-subtle);
        font-size: 0.875rem;
        color: var(--text-tertiary);
    }

    .copyright strong {
        color: var(--text-primary);
        font-weight: 600;
    }

    .credits {
        margin-top: 6px;
        font-size: 0.8125rem;
        color: var(--text-tertiary);
    }

    @media (max-width: 768px) {
        .footer-container {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 32px;
        }

        .social-links {
            align-items: center;
        }
    }
</style>
