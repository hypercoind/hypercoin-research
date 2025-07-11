// Markdown Article System for Hypercoin Research
// This system allows you to write articles in Markdown and display them with integrated charts

class MarkdownArticle {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.charts = [];
    }

    // Load and render a markdown article
    async loadMarkdown(markdownContent, metadata = {}) {
        try {
            // Parse the markdown content
            const htmlContent = marked.parse(markdownContent);
            
            // Create the article HTML structure
            const articleHTML = this.createArticleHTML(htmlContent, metadata);
            
            // Insert into container
            this.container.innerHTML = articleHTML;
            
            // Process any chart placeholders
            this.processChartPlaceholders();
            
            return true;
        } catch (error) {
            console.error('Error loading markdown article:', error);
            return false;
        }
    }

    // Create the complete article HTML structure
    createArticleHTML(content, metadata) {
        const title = metadata.title || 'Untitled Article';
        const date = metadata.date || new Date().toLocaleDateString();
        const author = metadata.author || 'Hypercoin Research';
        
        return `
            <div class="article-container">
                <div class="article-header">
                    <h1 class="article-title">${title}</h1>
                    <div class="article-meta">
                        Published: ${date} | Author: ${author}
                    </div>
                </div>
                
                <div class="article-content">
                    ${content}
                </div>
                
                <a href="index.html" class="back-link">← Back to Home</a>
            </div>
        `;
    }

    // Process chart placeholders in the content
    processChartPlaceholders() {
        // Look for chart placeholders in the format: [CHART:chartType:chartId]
        const chartPlaceholders = this.container.querySelectorAll('[data-chart]');
        
        chartPlaceholders.forEach(placeholder => {
            const chartType = placeholder.getAttribute('data-chart');
            const chartId = placeholder.getAttribute('data-chart-id') || 'chart-' + Date.now();
            
            // Create chart container
            const chartContainer = this.createChartContainer(chartId, chartType);
            placeholder.parentNode.replaceChild(chartContainer, placeholder);
            
            // Initialize the chart
            this.initializeChart(chartType, chartId);
        });
    }

    // Create a chart container element
    createChartContainer(chartId, chartType) {
        const container = document.createElement('div');
        container.className = 'chart-container';
        container.innerHTML = `
            <div class="chart-title">${chartType}</div>
            <div class="chart-wrapper">
                <canvas id="${chartId}"></canvas>
            </div>
            <div class="chart-caption">
                Interactive chart showing ${chartType.toLowerCase()} data.
            </div>
        `;
        return container;
    }

    // Initialize a chart based on type
    initializeChart(chartType, chartId) {
        setTimeout(() => {
            switch (chartType.toLowerCase()) {
                case 'bitcoin-price':
                    if (window.BitcoinCharts) {
                        const chart = BitcoinCharts.createBitcoinPriceChart(chartId);
                        this.charts.push(chart);
                    }
                    break;
                case 'on-chain-metrics':
                    if (window.BitcoinCharts) {
                        const sampleData = {
                            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                            values: [100, 150, 120, 180]
                        };
                        const chart = BitcoinCharts.createOnChainChart(chartId, 'Network Activity', sampleData);
                        this.charts.push(chart);
                    }
                    break;
                default:
                    console.warn('Unknown chart type:', chartType);
            }
        }, 100);
    }

    // Destroy all charts (useful for cleanup)
    destroyCharts() {
        this.charts.forEach(chart => {
            if (chart && chart.destroy) {
                chart.destroy();
            }
        });
        this.charts = [];
    }
}

// Helper function to create chart placeholders in markdown
function createChartPlaceholder(chartType, chartId) {
    return `<div data-chart="${chartType}" data-chart-id="${chartId}"></div>`;
}

// Sample markdown content with chart placeholders
const sampleMarkdownArticle = `# Bitcoin Market Analysis: Weekly Review

This week's analysis covers key developments in the Bitcoin market, including price movements, on-chain metrics, and market sentiment indicators.

## Price Performance

Bitcoin demonstrated resilience this week despite broader market volatility. The price action suggests continued institutional interest and strong holder behavior.

<div data-chart="Bitcoin-Price" data-chart-id="weekly-price-chart"></div>

## On-Chain Analysis

Network activity metrics show healthy growth patterns, with transaction volume and active addresses maintaining upward trends.

<div data-chart="On-Chain-Metrics" data-chart-id="network-activity-chart"></div>

## Key Takeaways

- **Institutional Demand**: Continued evidence of institutional accumulation
- **Network Health**: Strong on-chain metrics indicate network growth
- **Market Structure**: Improved market structure with reduced volatility

## Outlook

The data suggests Bitcoin continues to mature as an asset class, with improving market infrastructure and growing institutional adoption supporting long-term price stability.

*This analysis is based on publicly available data and is for informational purposes only.*`;

// Export for use in other scripts
window.MarkdownArticle = MarkdownArticle;
window.createChartPlaceholder = createChartPlaceholder;
window.sampleMarkdownArticle = sampleMarkdownArticle;