// Bitcoin Monte Carlo Simulator JavaScript

(function() {
    'use strict';

    let chart = null;

    // Enhanced secure API fetch with timeout and validation
    async function secureApiFetch(url, timeoutMs = 5000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'HypercoinResearch/1.0'
                },
                mode: 'cors',
                cache: 'no-cache',
                redirect: 'follow',
                referrerPolicy: 'no-referrer'
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Validate content type
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Invalid response content type');
            }

            // Limit response size to prevent memory attacks
            const contentLength = response.headers.get('content-length');
            if (contentLength && parseInt(contentLength) > 10000) { // 10KB limit
                throw new Error('Response too large');
            }

            const data = await response.json();

            // Basic data structure validation
            if (typeof data !== 'object' || data === null) {
                throw new Error('Invalid JSON response structure');
            }

            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }

    // Validate and sanitize price data
    function validatePriceData(price, apiName) {
        if (typeof price !== 'number' || isNaN(price)) {
            throw new Error(`Invalid price type from ${apiName}`);
        }

        if (price <= 0) {
            throw new Error(`Invalid price value from ${apiName}: ${price}`);
        }

        // Reasonable bounds check for Bitcoin price
        if (price < 1000 || price > 10000000) {
            throw new Error(`Price out of reasonable range from ${apiName}: ${price}`);
        }

        return Math.round(price);
    }

    // Fetch current Bitcoin price from multiple APIs with enhanced security
    async function fetchCurrentBitcoinPrice() {
        const apis = [
            {
                name: 'CoinGecko',
                url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
                parser: (data) => {
                    if (!data.bitcoin || typeof data.bitcoin.usd !== 'number') {
                        throw new Error('Invalid CoinGecko response structure');
                    }
                    return data.bitcoin.usd;
                }
            },
            {
                name: 'CoinCap',
                url: 'https://api.coincap.io/v2/assets/bitcoin',
                parser: (data) => {
                    if (!data.data || typeof data.data.priceUsd !== 'string') {
                        throw new Error('Invalid CoinCap response structure');
                    }
                    return parseFloat(data.data.priceUsd);
                }
            },
            {
                name: 'Binance',
                url: 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT',
                parser: (data) => {
                    if (typeof data.price !== 'string') {
                        throw new Error('Invalid Binance response structure');
                    }
                    return parseFloat(data.price);
                }
            }
        ];

        const attempts = [];

        for (const api of apis) {
            try {
                console.log(`Fetching Bitcoin price from ${api.name}...`);
                const data = await secureApiFetch(api.url, 3000);
                const price = api.parser(data);
                const validatedPrice = validatePriceData(price, api.name);

                console.log(`✓ Successfully fetched price from ${api.name}: $${validatedPrice.toLocaleString()}`);
                return validatedPrice;
            } catch (error) {
                console.warn(`⚠ ${api.name} API failed:`, error.message);
                attempts.push({ api: api.name, error: error.message });
                continue;
            }
        }

        // If all APIs fail, log details and return default value
        console.error('❌ All price APIs failed:', attempts);
        console.warn('Using default Bitcoin price of $115,000');
        return 115000;
    }

    // Load current Bitcoin price automatically on page load
    async function loadCurrentPrice() {
        const input = document.getElementById('currentPrice');
        const priceInfo = document.getElementById('priceInfo');
        const priceLoading = document.getElementById('priceLoading');

        // Show loading state
        priceLoading.style.display = 'inline-block';
        try {
            const price = await fetchCurrentBitcoinPrice();

            // Update input value
            input.value = price;

        } catch (error) {
            console.error('Error loading price:', error);

            // Show fallback info
            priceInfo.querySelector('.price-source').textContent = 'Using default price';
            priceInfo.querySelector('.price-timestamp').textContent = 'Failed to fetch live price';
            priceInfo.style.display = 'flex';
        } finally {
            // Hide loading state
            priceLoading.style.display = 'none';
            input.style.paddingRight = '16px';
        }
    }

    // Box-Muller transform for normal distribution
    function randomNormal() {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    // Simulate one price path
    function simulatePricePath(startPrice, years, annualReturn, volatility) {
        const dt = 1 / 252; // Daily time steps
        const numSteps = Math.floor(years * 252);
        let price = startPrice;

        for (let i = 0; i < numSteps; i++) {
            const drift = (annualReturn - 0.5 * volatility * volatility) * dt;
            const diffusion = volatility * Math.sqrt(dt) * randomNormal();
            price = price * Math.exp(drift + diffusion);
        }

        return price;
    }

    // Format price
    function formatPrice(price) {
        if (price >= 1000000) {
            return `$${(price / 1000000).toFixed(2)}M`;
        } else if (price >= 1000) {
            return `$${Math.round(price / 1000).toLocaleString()}K`;
        } else {
            return `$${Math.round(price).toLocaleString()}`;
        }
    }

    // Calculate statistics
    function calculateStats(prices) {
        prices.sort((a, b) => a - b);
        const n = prices.length;

        return {
            median: prices[Math.floor(n * 0.5)],
            percentile_10: prices[Math.floor(n * 0.1)],
            percentile_25: prices[Math.floor(n * 0.25)],
            percentile_75: prices[Math.floor(n * 0.75)],
            percentile_90: prices[Math.floor(n * 0.9)],
            mean: prices.reduce((a, b) => a + b) / n,
            min: prices[0],
            max: prices[n - 1]
        };
    }

    // Input validation functions
    function validateNumericInput(inputId, min, max, defaultValue) {
        const element = document.getElementById(inputId);
        if (!element) return defaultValue;

        let value = parseFloat(element.value);

        // Handle invalid input
        if (isNaN(value) || value === null || value === undefined) {
            value = defaultValue;
            element.value = defaultValue;
            showValidationError(element, `Invalid input, reset to ${defaultValue}`);
        }

        // Clamp to valid range
        if (value < min) {
            value = min;
            element.value = min;
            showValidationError(element, `Minimum value is ${min}`);
        } else if (value > max) {
            value = max;
            element.value = max;
            showValidationError(element, `Maximum value is ${max}`);
        }

        return value;
    }

    function showValidationError(element, message) {
        element.style.borderColor = '#e74c3c';
        element.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';

        // Reset after 2 seconds
        setTimeout(() => {
            element.style.borderColor = '';
            element.style.backgroundColor = '';
        }, 2000);

        console.warn(`Validation: ${message}`);
    }

    // Add input validation to all numeric inputs
    function initializeInputValidation() {
        const inputs = [
            { id: 'currentPrice', min: 1000, max: 10000000 },
            { id: 'volatility', min: 10, max: 200 },
            { id: 'numSims', min: 100, max: 50000 }
        ];

        inputs.forEach(input => {
            const element = document.getElementById(input.id);
            if (element) {
                // Prevent non-numeric input
                element.addEventListener('keydown', (e) => {
                    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                    const isNumberKey = (e.key >= '0' && e.key <= '9');
                    const isDecimalKey = e.key === '.' && !element.value.includes('.') && input.id !== 'numSims';

                    if (!allowedKeys.includes(e.key) && !isNumberKey && !isDecimalKey && !e.ctrlKey) {
                        e.preventDefault();
                    }
                });
            }
        });
    }

    // Run the simulation
    async function runSimulation() {
        const loading = document.getElementById('loading');

        // Always show loading animation
        loading.style.display = 'flex';
        loading.style.opacity = '1';

        // Get and validate parameters
        const currentPrice = validateNumericInput('currentPrice', 1000, 10000000, 115000);
        const volatility = validateNumericInput('volatility', 10, 200, 42) / 100;
        const annualReturn = parseFloat(document.getElementById('scenario').value);
        const numSims = Math.floor(validateNumericInput('numSims', 100, 50000, 5000));

        // Time horizons
        const timeHorizons = [4, 5, 6, 8, 10, 12, 15];

        // Allow UI to update and ensure loading animation is visible for meaningful time
        await new Promise(resolve => setTimeout(resolve, 100));

        // Run simulations and cache results
        const results = {};
        const percentiles = {};
        const simulationCache = {};

        for (const years of timeHorizons) {
            const prices = [];

            for (let i = 0; i < numSims; i++) {
                prices.push(simulatePricePath(currentPrice, years, annualReturn, volatility));
            }

            // Cache a copy before calculateStats modifies via sort
            simulationCache[years] = [...prices];

            results[years] = calculateStats(prices);

            // Store percentiles for chart
            percentiles[years] = {
                p10: results[years].percentile_10,
                p25: results[years].percentile_25,
                p50: results[years].median,
                p75: results[years].percentile_75,
                p90: results[years].percentile_90
            };
        }

        // Update statistics
        updateStats(results);

        // Calculate probabilities from cached results
        const milestones = [100000, 250000, 500000, 1000000, 2000000, 5000000, 10000000, 15000000, 20000000];
        const probabilities = {};
        const probabilityHorizons = [5, 10, 15, 20];

        // Run simulations for time horizons not in the main loop
        for (const years of probabilityHorizons) {
            if (!simulationCache[years]) {
                const prices = [];
                for (let i = 0; i < numSims; i++) {
                    prices.push(simulatePricePath(currentPrice, years, annualReturn, volatility));
                }
                simulationCache[years] = prices;
            }
        }

        for (const milestone of milestones) {
            if (milestone < currentPrice) continue;

            probabilities[milestone] = {};

            for (const years of probabilityHorizons) {
                const cachedPrices = simulationCache[years];
                const count = cachedPrices.filter(price => price >= milestone).length;
                probabilities[milestone][years] = (count / cachedPrices.length) * 100;
            }
        }

        updateProbabilityTable(probabilities);

        // Update chart and wait for it to complete
        const chartPromise = updateChart(timeHorizons, percentiles, currentPrice);

        // Ensure loading animation is visible for minimum duration
        const minLoadingTime = 800;
        await Promise.all([
            new Promise(resolve => setTimeout(resolve, minLoadingTime)),
            chartPromise
        ]);

        // Show results sections
        document.querySelector('.chart-container').style.display = 'block';
        document.getElementById('statsGrid').style.display = 'grid';
        document.querySelector('.probability-table').style.display = 'block';

        // Force Plotly to resize after container becomes visible
        if (chart) {
            setTimeout(() => {
                Plotly.Plots.resize('priceChart');
            }, 100);
        }

        // Smooth fade-out animation
        loading.style.opacity = '0';
        setTimeout(() => {
            loading.style.display = 'none';
            // Clean up URL parameters if coming from homepage
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('fromHomepage') === 'true') {
                const newUrl = window.location.href.split('?')[0];
                window.history.replaceState({}, document.title, newUrl);
            }
            // Smoothly scroll to center the chart view
            const chartContainer = document.querySelector('.chart-container');
            if (chartContainer) {
                setTimeout(() => {
                    chartContainer.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest"
                    });
                });
            }
        }, 300);
    }

    // Update chart
    function updateChart(years, percentiles, currentPrice) {
        if (typeof Plotly === 'undefined') {
            return Promise.resolve();
        }

        if (chart) {
            Plotly.purge('priceChart');
        }

        // Get theme colors with proper light mode detection
        const computedStyle = getComputedStyle(document.body);
        const isLight = document.body.getAttribute('data-theme') === 'light';

        const textColor = computedStyle.getPropertyValue('--text-primary').trim() || (isLight ? '#1a1a1a' : '#f0f6fc');
        const gridColor = computedStyle.getPropertyValue('--border-color').trim() || (isLight ? '#e0e0e0' : '#30363d');
        const bgColor = computedStyle.getPropertyValue('--card-bg').trim() || (isLight ? '#f8f9fa' : '#161b22');

        const traces = [
            {
                x: years.map(y => `${y} Years`),
                y: years.map(y => percentiles[y].p90),
                type: 'scatter',
                mode: 'lines',
                name: '90th Percentile',
                line: { color: '#00ff00', width: 2 }
            },
            {
                x: years.map(y => `${y} Years`),
                y: years.map(y => percentiles[y].p75),
                type: 'scatter',
                mode: 'lines',
                name: '75th Percentile',
                line: { color: '#88ff88', width: 2 }
            },
            {
                x: years.map(y => `${y} Years`),
                y: years.map(y => percentiles[y].p50),
                type: 'scatter',
                mode: 'lines',
                name: 'Median (50th)',
                line: { color: '#f7931a', width: 2 }
            },
            {
                x: years.map(y => `${y} Years`),
                y: years.map(y => percentiles[y].p25),
                type: 'scatter',
                mode: 'lines',
                name: '25th Percentile',
                line: { color: '#ff8888', width: 2 }
            },
            {
                x: years.map(y => `${y} Years`),
                y: years.map(y => percentiles[y].p10),
                type: 'scatter',
                mode: 'lines',
                name: '10th Percentile',
                line: { color: '#ff0000', width: 2 }
            }
        ];

        const layout = {
            title: {
                text: 'Bitcoin Price - Percentile Ranges',
                font: { color: textColor, size: 16 }
            },
            xaxis: {
                title: { text: 'Time Horizon', font: { color: textColor } },
                tickfont: { color: textColor },
                gridcolor: gridColor,
                showline: true,
                mirror: true
            },
            yaxis: {
                type: 'log',
                title: { text: 'Price (USD)', font: { color: textColor }, standoff: 20 },
                tickfont: { color: textColor },
                tick0: 0,
                gridcolor: gridColor,
                tickformat: '$,.0f',
                showline: true,
                mirror: true
            },
            paper_bgcolor: bgColor,
            plot_bgcolor: bgColor,
            margin: { t: 100, b: 60, l: 100, r: 30 },
            legend: {
                font: { color: textColor },
                orientation: 'h',
                yanchor: 'top',
                y: -0.15,
                xanchor: 'center',
                x: 0.5
            },
        };

        const config = {
            responsive: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'autoScale2d']
        };

        return Plotly.newPlot('priceChart', traces, layout, config).then((plotDiv) => {
            chart = plotDiv;
            return plotDiv;
        }).catch((error) => {
            console.error('Failed to create Monte Carlo chart:', error);
            chart = true;
            return null;
        });
    }

    // Secure function to create stat row
    function createStatRow(label, value) {
        const row = document.createElement('div');
        row.className = 'stat-row';

        const labelSpan = document.createElement('span');
        labelSpan.className = 'stat-label';
        labelSpan.textContent = label;

        const valueSpan = document.createElement('span');
        valueSpan.className = 'stat-value';
        valueSpan.textContent = value;

        row.appendChild(labelSpan);
        row.appendChild(valueSpan);

        return row;
    }

    // Update statistics
    function updateStats(results) {
        const statsGrid = document.getElementById('statsGrid');
        // Clear existing content safely
        while (statsGrid.firstChild) {
            statsGrid.removeChild(statsGrid.firstChild);
        }

        const selectedYears = [5, 10, 15];

        for (const years of selectedYears) {
            const stats = results[years];
            const card = document.createElement('div');
            card.className = 'stat-card';

            // Create header
            const header = document.createElement('h3');
            header.textContent = `${years} Year Projection`;
            card.appendChild(header);

            // Create stat rows securely
            card.appendChild(createStatRow('Median', formatPrice(stats.median)));
            card.appendChild(createStatRow('Mean', formatPrice(stats.mean)));
            card.appendChild(createStatRow('10th - 90th Percentile', `${formatPrice(stats.percentile_10)} - ${formatPrice(stats.percentile_90)}`));
            card.appendChild(createStatRow('25th - 75th Percentile', `${formatPrice(stats.percentile_25)} - ${formatPrice(stats.percentile_75)}`));
            card.appendChild(createStatRow('Min - Max', `${formatPrice(stats.min)} - ${formatPrice(stats.max)}`));

            statsGrid.appendChild(card);
        }
    }

    // Secure function to create table cell
    function createTableCell(content, className = '') {
        const cell = document.createElement('td');
        if (className) {
            cell.className = className;
        }
        cell.textContent = content;
        return cell;
    }

    // Update probability table
    function updateProbabilityTable(probabilities) {
        const tbody = document.getElementById('probabilityBody');
        // Clear existing content safely
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }

        for (const [milestone, probs] of Object.entries(probabilities)) {
            const row = document.createElement('tr');

            const getColorClass = (prob) => {
                if (prob >= 70) return 'prob-high';
                if (prob >= 30) return 'prob-medium';
                return 'prob-low';
            };

            // Create cells securely
            row.appendChild(createTableCell(formatPrice(parseFloat(milestone)), 'milestone'));
            row.appendChild(createTableCell(`${probs[5].toFixed(1)}%`, getColorClass(probs[5])));
            row.appendChild(createTableCell(`${probs[10].toFixed(1)}%`, getColorClass(probs[10])));
            row.appendChild(createTableCell(`${probs[15].toFixed(1)}%`, getColorClass(probs[15])));
            row.appendChild(createTableCell(`${probs[20].toFixed(1)}%`, getColorClass(probs[20])));

            tbody.appendChild(row);
        }
    }

    // Function to update chart colors based on theme
    function updateChartColors() {
        if (!chart) return;

        const computedStyle = getComputedStyle(document.body);
        const isLight = document.body.getAttribute('data-theme') === 'light';

        const textColor = computedStyle.getPropertyValue('--text-primary').trim() || (isLight ? '#1a1a1a' : '#f0f6fc');
        const gridColor = computedStyle.getPropertyValue('--border-color').trim() || (isLight ? '#e0e0e0' : '#30363d');
        const bgColor = computedStyle.getPropertyValue('--card-bg').trim() || (isLight ? '#f8f9fa' : '#161b22');

        const update = {
            'title.font.color': textColor,
            'xaxis.title.font.color': textColor,
            'xaxis.tickfont.color': textColor,
            'xaxis.gridcolor': gridColor,
            'yaxis.title.font.color': textColor,
            'yaxis.tickfont.color': textColor,
            'yaxis.gridcolor': gridColor,
            'legend.font.color': textColor,
            'paper_bgcolor': bgColor,
            'plot_bgcolor': bgColor
        };

        Plotly.relayout('priceChart', update);
    }

    // Initialize theme and app
    async function initializeApp() {
        // Initialize theme
        ThemeUtils.initializeTheme();

        // Set up theme toggle with chart color update callback
        ThemeUtils.setupThemeToggle(function(newTheme) {
            if (chart) {
                updateChartColors();
            }
        });

        // Initialize mobile scroll to top
        ThemeUtils.addMobileScrollToTop();

        // Set up header scroll effect
        ThemeUtils.setupHeaderScrollEffect();

        // Force a reflow to ensure CSS variables are applied
        document.body.offsetHeight;

        // Initialize input validation
        initializeInputValidation();

        // Set up run simulation button
        const runBtn = document.getElementById('runSimBtn');
        if (runBtn) {
            runBtn.addEventListener('click', runSimulation);
        }

        // Load current Bitcoin price
        await loadCurrentPrice();
    }

    // Intersection Observer for animations
    ThemeUtils.setupIntersectionAnimations(".stat-card, .chart-container, .controls, .probability-table, .disclaimer-section, .hero p");

    // Add window resize handler for chart (debounced)
    window.addEventListener('resize', ThemeUtils.debounce(() => {
        if (chart) {
            Plotly.Plots.resize('priceChart');
        }
    }, 250));

    // Make runSimulation available globally
    window.runSimulation = runSimulation;

    // Run initialization
    window.onload = function() {
        const initApp = () => {
            if (typeof Plotly !== 'undefined') {
                initializeApp();
            } else {
                setTimeout(initApp, 100);
            }
        };
        initApp();
    };
})();
