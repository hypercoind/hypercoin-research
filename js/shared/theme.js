// Shared Theme Management Module
// Common utilities for theme switching, localStorage, and UI interactions

// Secure localStorage utility
const SecureStorage = {
    // Allowed keys and their validation functions
    allowedKeys: {
        'theme': (value) => ['light', 'dark'].includes(value)
    },

    // Secure get with validation
    get(key) {
        if (!this.allowedKeys.hasOwnProperty(key)) {
            console.warn(`Attempt to access unauthorized storage key: ${key}`);
            return null;
        }

        try {
            const value = localStorage.getItem(key);
            if (value === null) return null;

            // Validate the stored value
            if (!this.allowedKeys[key](value)) {
                console.warn(`Invalid stored value for key ${key}, removing`);
                this.remove(key);
                return null;
            }

            return value;
        } catch (error) {
            console.error(`Error reading from localStorage: ${error.message}`);
            return null;
        }
    },

    // Secure set with validation
    set(key, value) {
        if (!this.allowedKeys.hasOwnProperty(key)) {
            console.warn(`Attempt to set unauthorized storage key: ${key}`);
            return false;
        }

        if (!this.allowedKeys[key](value)) {
            console.warn(`Invalid value for key ${key}: ${value}`);
            return false;
        }

        try {
            localStorage.setItem(key, value);
            return true;
        } catch (error) {
            console.error(`Error writing to localStorage: ${error.message}`);
            return false;
        }
    },

    // Secure remove
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing from localStorage: ${error.message}`);
            return false;
        }
    }
};

// Theme toggle text management
function setThemeToggleText(theme) {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    // Clear existing content safely
    themeToggle.textContent = '';

    // Check if mobile device (768px or less)
    const isMobile = window.innerWidth <= 768;

    // Create text node for safe content insertion
    const textContent = isMobile ?
        (theme === 'light' ? '🌙' : '☀️') :
        (theme === 'light' ? '🌙 Dark' : '☀️ Light');
    themeToggle.appendChild(document.createTextNode(textContent));
}

// Apply theme to body
function applyTheme(theme) {
    const body = document.body;
    body.setAttribute('data-theme', theme);
    setThemeToggleText(theme);
}

// Initialize theme from localStorage or default to dark
function initializeTheme() {
    const savedTheme = SecureStorage.get('theme');
    if (savedTheme === 'light') {
        applyTheme('light');
    } else {
        applyTheme('dark');
    }
}

// Toggle theme and save preference
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');

    if (currentTheme === 'light') {
        applyTheme('dark');
        SecureStorage.set('theme', 'dark');
    } else {
        applyTheme('light');
        SecureStorage.set('theme', 'light');
    }

    // Trigger scroll event to update header colors
    window.dispatchEvent(new Event('scroll'));

    return body.getAttribute('data-theme');
}

// Set up theme toggle event listener
function setupThemeToggle(onThemeChange) {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    themeToggle.addEventListener('click', function() {
        const newTheme = toggleTheme();
        if (typeof onThemeChange === 'function') {
            onThemeChange(newTheme);
        }
    });

    // Update button text on window resize
    window.addEventListener('resize', function() {
        const currentTheme = document.body.getAttribute('data-theme') || 'dark';
        setThemeToggleText(currentTheme);
    });
}

// Mobile tap-to-scroll-to-top feature
function addMobileScrollToTop() {
    const siteHeader = document.querySelector('.site-header');
    if (!siteHeader) return;

    function handleHeaderTap(e) {
        // Only on mobile devices (768px or less)
        if (window.innerWidth <= 768) {
            // Don't trigger if tapping the theme toggle button
            if (e.target.closest('.theme-toggle')) return;

            // Scroll to top smoothly
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }

    siteHeader.addEventListener('click', handleHeaderTap);
    siteHeader.addEventListener('touchend', handleHeaderTap);
}

// Throttle utility for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Debounce utility for resize events
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Add scroll effect to site header (navigation bar)
function setupHeaderScrollEffect() {
    const siteHeader = document.querySelector('.site-header');
    if (!siteHeader) return;

    window.addEventListener("scroll", throttle(() => {
        const body = document.body;
        const currentTheme = body.getAttribute('data-theme');

        if (window.scrollY > 100) {
            if (currentTheme === 'light') {
                siteHeader.style.background = "rgba(255, 255, 255, 0.95)";
            } else {
                siteHeader.style.background = "rgba(13, 17, 23, 0.95)";
            }
            siteHeader.style.backdropFilter = "blur(10px)";
        } else {
            siteHeader.style.background = "transparent";
            siteHeader.style.backdropFilter = "blur(10px)";
        }
    }, 100));
}

// Intersection Observer for animations
function setupIntersectionAnimations(selectors) {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll(selectors).forEach((element, index) => {
        element.style.opacity = "0";
        element.style.transform = "translateY(30px)";
        element.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(element);
    });
}

// Export for use in other modules
window.ThemeUtils = {
    SecureStorage,
    setThemeToggleText,
    applyTheme,
    initializeTheme,
    toggleTheme,
    setupThemeToggle,
    addMobileScrollToTop,
    throttle,
    debounce,
    setupHeaderScrollEffect,
    setupIntersectionAnimations
};
