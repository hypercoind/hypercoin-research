// Landing Page JavaScript
// Specific functionality for the main index.html page

(function() {
    'use strict';

    // Initialize theme
    ThemeUtils.initializeTheme();

    // Set up theme toggle
    ThemeUtils.setupThemeToggle();

    // Initialize mobile scroll to top
    ThemeUtils.addMobileScrollToTop();

    // Set up header scroll effect
    ThemeUtils.setupHeaderScrollEffect();

    // Site logo scroll to top functionality (homepage only)
    function addLogoScrollToTop() {
        const siteLogo = document.querySelector('.site-logo');
        if (!siteLogo) return;

        // Only add scroll behavior if we're on the homepage (href="#home")
        if (siteLogo.getAttribute('href') === '#home') {
            siteLogo.addEventListener('click', function(e) {
                e.preventDefault();

                // Scroll to top smoothly
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    // Initialize logo scroll to top
    addLogoScrollToTop();

    // Handle theme passing to calculator page
    const reBtcLink = document.getElementById('re-btc-link');
    if (reBtcLink) {
        reBtcLink.addEventListener('click', function(e) {
            e.preventDefault();
            const currentTheme = document.body.getAttribute('data-theme') || 'dark';
            const baseUrl = this.getAttribute('href');
            const newUrl = `${baseUrl}?theme=${currentTheme}`;
            window.location.href = newUrl;
        });
    }

    // Intersection Observer for content card animations
    ThemeUtils.setupIntersectionAnimations('.content-card');

    // Sticky scroll behavior - snap to tools section on first scroll
    let hasScrolledFromTop = false;
    let scrollTimeout;

    function initStickyScroll() {
        window.addEventListener('scroll', function() {
            // Clear any existing timeout
            clearTimeout(scrollTimeout);

            // If we haven't scrolled from top yet and we're scrolling down
            if (!hasScrolledFromTop && window.scrollY > 50) {
                hasScrolledFromTop = true;

                // Small delay to ensure smooth transition
                scrollTimeout = setTimeout(() => {
                    const toolsSection = document.getElementById('research');
                    if (toolsSection) {
                        toolsSection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }, 150);
            }

            // Reset flag if user scrolls back to top
            if (window.scrollY <= 10) {
                hasScrolledFromTop = false;
            }
        });
    }

    // Initialize sticky scroll behavior
    initStickyScroll();

    // Enhanced welcome message
    console.log('🧡 Welcome to Hypercoin Research!');
    console.log('🌙 Professional Bitcoin-themed design with dynamic animations');
    console.log('₿ Now featuring the same modern styling as hypercoin.dev');
})();
