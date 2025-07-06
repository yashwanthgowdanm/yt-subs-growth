let growthChartInstance = null;

const initialSubsEl = document.getElementById('initialSubs');
const growthRateEl = document.getElementById('growthRate');
const timeDurationEl = document.getElementById('timeDuration');
const durationValueEl = document.getElementById('durationValue');
const durationDisplayEl = document.getElementById('durationDisplay');
const projectedSubsEl = document.getElementById('projectedSubs');
const analysisResultEl = document.querySelector('#analysisResult p');

const previousSubsEl = document.getElementById('previousSubs');
const daysBetweenEl = document.getElementById('daysBetween');
const calculateRateBtn = document.getElementById('calculateRateBtn');
const rateErrorMessageEl = document.getElementById('rateErrorMessage');

function calculateSubs(initial, rate, time) {
    return initial * Math.pow((1 + rate / 100), time);
}

function getAnalysis(rate) {
    if (rate <= 0) return "Growth has stalled. Reevaluate your strategy.";
    if (rate < 0.2) return "Steady growth. Stay consistent and improve gradually.";
    if (rate < 0.8) return "Solid growth! Explore what’s working and amplify it.";
    if (rate < 2) return "High growth! Keep optimizing and scaling your content.";
    return "Viral growth! Capitalize on this momentum strategically.";
}

function updateDashboard() {
    const initialSubs = parseFloat(initialSubsEl.value) || 0;
    const growthRate = parseFloat(growthRateEl.value) || 0;
    const timeDuration = parseInt(timeDurationEl.value, 10);

    durationValueEl.textContent = timeDuration;
    durationDisplayEl.textContent = timeDuration;

    const finalSubs = calculateSubs(initialSubs, growthRate, timeDuration);
    projectedSubsEl.textContent = Math.round(finalSubs).toLocaleString();

    analysisResultEl.textContent = getAnalysis(growthRate);

    renderChart(initialSubs, growthRate, timeDuration);
}

function renderChart(initial, rate, duration) {
    const ctx = document.getElementById('growthChart').getContext('2d');
    const labels = [];
    const dataPoints = [];

    for (let i = 0; i <= duration; i++) {
        labels.push(`Day ${i}`);
        dataPoints.push(Math.round(calculateSubs(initial, rate, i)));
    }

    if (growthChartInstance) growthChartInstance.destroy();

    growthChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Projected Subscribers',
                data: dataPoints,
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                tension: 0.1,
                pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                pointRadius: 0,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: (value) => value.toLocaleString()
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 0,
                        minRotation: 0,
                        callback: (val, idx) => duration <= 30 || idx % Math.ceil(duration / 10) === 0 ? labels[idx] : ''
                    }
                }
            },
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            }
        }
    });
}

function handleRateCalculation() {
    rateErrorMessageEl.classList.add('hidden');
    const previousSubs = parseFloat(previousSubsEl.value);
    const currentSubs = parseFloat(initialSubsEl.value);
    const daysBetween = parseInt(daysBetweenEl.value, 10);

    if (isNaN(previousSubs) || previousSubs <= 0 || isNaN(currentSubs) || isNaN(daysBetween) || daysBetween <= 0) {
        rateErrorMessageEl.textContent = 'Please enter valid, positive numbers.';
        rateErrorMessageEl.classList.remove('hidden');
        return;
    }

    if (currentSubs < previousSubs) {
        rateErrorMessageEl.textContent = 'Current subscribers must be higher than previous.';
        rateErrorMessageEl.classList.remove('hidden');
        return;
    }

    const dailyRate = (Math.pow(currentSubs / previousSubs, 1 / daysBetween) - 1) * 100;

    if (!isFinite(dailyRate)) {
        rateErrorMessageEl.textContent = 'Invalid growth rate. Check inputs.';
        rateErrorMessageEl.classList.remove('hidden');
        return;
    }

    growthRateEl.value = dailyRate.toFixed(4);
    updateDashboard();
}

[initialSubsEl, growthRateEl, timeDurationEl].forEach(el =>
    el.addEventListener('input', updateDashboard)
);

calculateRateBtn.addEventListener('click', handleRateCalculation);

document.addEventListener('DOMContentLoaded', updateDashboard);
