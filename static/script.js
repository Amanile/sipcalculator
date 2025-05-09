document.addEventListener('DOMContentLoaded', function() {
    const sipForm = document.getElementById('sipForm');
    const inflationToggle = document.getElementById('inflationToggle');
    const inflationRateDiv = document.querySelector('.inflation-rate');
    let pieChart = null;

    // Toggle inflation rate input visibility
    inflationToggle.addEventListener('change', function() {
        inflationRateDiv.style.display = this.checked ? 'block' : 'none';
    });

    sipForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const monthlyInvestment = parseFloat(document.getElementById('monthlyInvestment').value);
        const years = parseInt(document.getElementById('years').value);
        const expectedReturn = parseFloat(document.getElementById('expectedReturn').value);
        const adjustInflation = inflationToggle.checked;
        const inflationRate = adjustInflation ? parseFloat(document.getElementById('inflationRate').value) : 0;

        // Calculate real rate of return if inflation is enabled
        const realRateOfReturn = adjustInflation ? 
            ((1 + expectedReturn/100) / (1 + inflationRate/100) - 1) * 100 : 
            expectedReturn;

        fetch('/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                monthly_investment: monthlyInvestment,
                years: years,
                expected_return: realRateOfReturn
            })
        })
        .then(response => response.json())
        .then(data => {
            // Format numbers with Indian currency format
            const formatter = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
            });

            document.getElementById('futureValue').textContent = formatter.format(data.future_value);
            document.getElementById('totalInvestment').textContent = formatter.format(data.total_investment);
            document.getElementById('wealthGained').textContent = formatter.format(data.wealth_gained);

            // Update pie chart
            updatePieChart(data.total_investment, data.wealth_gained);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while calculating. Please try again.');
        });
    });

    function updatePieChart(totalInvestment, wealthGained) {
        const ctx = document.getElementById('pieChart').getContext('2d');
        
        if (pieChart) {
            pieChart.destroy();
        }

        pieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Total Investment', 'Wealth Gained'],
                datasets: [{
                    data: [totalInvestment, wealthGained],
                    backgroundColor: ['#0d6efd', '#198754'],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ₹${value.toLocaleString('en-IN')} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
}); 