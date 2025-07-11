// Bitcoin Charts - Helper functions for creating financial charts
// This file contains reusable chart configurations for Bitcoin research

// Sample Bitcoin price data (you'll replace this with real data)
const sampleBitcoinPriceData = {
    labels: ['Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024', 'Jul 2024'],
    datasets: [{
        label: 'Bitcoin Price (USD)',
        data: [42000, 45000, 67000, 64000, 62000, 60000, 58000],
        borderColor: '#009688',
        backgroundColor: 'rgba(0, 150, 136, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1
    }]
};

// Default chart configuration for Bitcoin price charts
const defaultChartConfig = {
    type: 'line',
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: false,
                ticks: {
                    callback: function(value) {
                        return '$' + value.toLocaleString();
                    }
                }
            }
        },
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return context.dataset.label + ': $' + context.parsed.y.toLocaleString();
                    }
                }
            }
        }
    }
};

// Function to create a Bitcoin price chart
function createBitcoinPriceChart(canvasId, data = sampleBitcoinPriceData) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    const config = {
        ...defaultChartConfig,
        data: data
    };
    
    return new Chart(ctx, config);
}

// Function to create a simple on-chain metrics chart
function createOnChainChart(canvasId, title, data, color = '#006b5f') {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    const config = {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: title,
                data: data.values,
                borderColor: color,
                backgroundColor: color + '20',
                borderWidth: 2,
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: title
                }
            }
        }
    };
    
    return new Chart(ctx, config);
}

// Export functions for use in articles
window.BitcoinCharts = {
    createBitcoinPriceChart,
    createOnChainChart,
    sampleBitcoinPriceData
};