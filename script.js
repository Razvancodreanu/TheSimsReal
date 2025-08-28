const CONFIG = {
    colors: {
        food: { border: '#ff6384', background: 'rgba(255, 99, 132, 0.2)' },
        water: { border: '#36a2eb', background: 'rgba(54, 162, 235, 0.2)' },
        sleep: { border: '#4bc0c0', background: 'rgba(75, 192, 192, 0.2)' },
        sport: { border: '#9966ff', background: 'rgba(153, 102, 255, 0.2)' },
        steps: { border: '#ff9f40', background: 'rgba(255, 159, 64, 0.2)' },
        nevoi: { border: '#ff6384', background: 'rgba(255, 99, 132, 0.2)' },
        relatii: { border: '#36a2eb', background: 'rgba(54, 162, 235, 0.2)' },
        cariera: { border: '#4bc0c0', background: 'rgba(75, 192, 192, 0.2)' }
    },
    suggestions: {
        food: '🍽️ Mănâncă o masă sănătoasă!',
        water: '💧 Bea mai multă apă!',
        sleep: '😴 Dormi mai mult!',
        sport: '🏃 Fă puțină mișcare!',
        steps: '👣 Ieși la o plimbare!',
        relatii: '💬 Relații jos: sună un prieten!',
        cariera: '💼 Carieră jos: fă un pas mic azi!'
    }
};

const subNevoi = [
    { id: 'food', target: 3 },
    { id: 'water', target: 2 },
    { id: 'sleep', target: 8 },
    { id: 'sport', target: 1 },
    { id: 'steps', target: 10000 }
];

const bars = ['nevoi', 'relatii', 'cariera'];
const DOM = { inputs: {}, bars: {}, suggestions: null, canvas: null };
let chartInstance = null;

function getElement(id, type = 'input') {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Element with ID ${id} not found`);
        return null;
    }
    return element;
}

function getStoredData(key, defaultValue = {}) {
    try {
        return JSON.parse(localStorage.getItem(key)) || defaultValue;
    } catch (e) {
        console.error(`Error parsing ${key} from localStorage:`, e);
        return defaultValue;
    }
}

function setStoredData(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error(`Error saving ${key} to localStorage:`, e);
    }
}

function saveHistory(bar, value) {
    const today = new Date().toISOString().split('T')[0];
    const history = getStoredData(bar + '_history');
    history[today] = value;
    setStoredData(bar + '_history', history);
}

function updateBars() {
    let total = 0;

    subNevoi.forEach(nevoie => {
        const input = DOM.inputs[nevoie.id];
        const bar = DOM.bars[nevoie.id];
        if (!input || !bar) return;

        const val = parseFloat(input.value);
        if (isNaN(val) || val < 0 || val > nevoie.target) {
            alert(`Introdu o valoare între 0 și ${nevoie.target} pentru ${nevoie.id}`);
            return;
        }

        const percent = Math.min(100, Math.round((val / nevoie.target) * 100));
        bar.value = percent;
        setStoredData(nevoie.id, percent);
        saveHistory(nevoie.id, percent);
        input.value = '';
        total += percent;
    });

    const scorGeneral = Math.round(total / subNevoi.length);
    DOM.bars.nevoi.value = scorGeneral;
    setStoredData('nevoi', scorGeneral);
    saveHistory('nevoi', scorGeneral);

    ['relatii', 'cariera'].forEach(bar => {
        const input = DOM.inputs[bar];
        const progress = DOM.bars[bar];
        if (!input || !progress) return;

        const change = parseInt(input.value);
        if (!isNaN(change)) {
            let newValue = Math.min(100, Math.max(0, parseInt(progress.value) + change));
            progress.value = newValue;
            setStoredData(bar, newValue);
            saveHistory(bar, newValue);
            input.value = '';
        }
    });

    setStoredData('lastUpdate', new Date().toISOString().split('T')[0]);
    showSuggestions();
    updateChart();
}

function loadProgress() {
    [...subNevoi.map(n => n.id), ...bars].forEach(bar => {
        const saved = getStoredData(bar);
        if (saved !== null && DOM.bars[bar]) {
            DOM.bars[bar].value = parseInt(saved);
        }
    });
    checkDailyDecay();
    updateChart();
    showSuggestions();
}

function checkDailyDecay() {
    const today = new Date().toISOString().split('T')[0];
    const lastUpdate = getStoredData('lastUpdate', today);

    if (lastUpdate !== today) {
        [...subNevoi.map(n => n.id), ...bars].forEach(bar => {
            const progress = DOM.bars[bar];
            if (!progress) return;
            let newValue = Math.max(0, parseInt(progress.value) - 10);
            progress.value = newValue;
            setStoredData(bar, newValue);
            saveHistory(bar, newValue);
        });
        setStoredData('lastUpdate', today);
    }
}

function showSuggestions() {
    const suggestions = [];

    subNevoi.forEach(n => {
        const val = parseInt(DOM.bars[n.id]?.value || 0);
        if (val < 50) suggestions.push(CONFIG.suggestions[n.id]);
    });

    ['relatii', 'cariera'].forEach(bar => {
        const val = parseInt(DOM.bars[bar]?.value || 0);
        if (val < 50) suggestions.push(CONFIG.suggestions[bar]);
    });

    if (suggestions.length > 0) {
        DOM.suggestions.innerHTML = `
      <ul>
        ${suggestions.slice(0, 3).map(s => `<li>${s}</li>`).join('')}
      </ul>
    `;
    } else {
        DOM.suggestions.textContent = 'Totul e echilibrat!';
    }
}

function updateChart() {
    const ctx = DOM.canvas?.getContext('2d');
    if (!ctx) return;

    const dates = [];
    const data = {};

    [...subNevoi.map(n => n.id), ...bars].forEach(bar => data[bar] = []);

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }

    [...subNevoi.map(n => n.id), ...bars].forEach(bar => {
        const history = getStoredData(bar + '_history');
        dates.forEach(date => data[bar].push(history[date] || 0));
    });

    const chartData = {
        labels: dates,
        datasets: [...subNevoi.map(n => ({
            label: n.id.charAt(0).toUpperCase() + n.id.slice(1),
            data: data[n.id],
            borderColor: CONFIG.colors[n.id].border,
            backgroundColor: CONFIG.colors[n.id].background,
            fill: true
        })), ...bars.map(bar => ({
            label: bar.charAt(0).toUpperCase() + bar.slice(1),
            data: data[bar],
            borderColor: CONFIG.colors[bar].border,
            backgroundColor: CONFIG.colors[bar].background,
            fill: true
        }))]
    };

    if (chartInstance) {
        chartInstance.data = chartData;
        chartInstance.update();
    } else {
        chartInstance = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: context => `${context.dataset.label}: ${context.raw}%`
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: true, max: 100 }
                }
            }
        });
    }
}

function exportData() {
    const data = {
        progress: {},
        history: {}
    };
    [...subNevoi.map(n => n.id), ...bars].forEach(bar => {
        data.progress[bar] = getStoredData(bar);
        data.history[bar] = getStoredData(bar + '_history');
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'progress_data.json';
    a.click();
    URL.revokeObjectURL(url);
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

window.onload = () => {
    DOM.suggestions = getElement('suggestions');
    DOM.canvas = getElement('progressChart', 'canvas');
    subNevoi.forEach(n => {
        DOM.inputs[n.id] = getElement(n.id + 'Input');
        DOM.bars[n.id] = getElement(n.id, 'progress');
    });
    bars.forEach(bar => {
        DOM.inputs[bar] = getElement(bar + 'Input');
        DOM.bars[bar] = getElement(bar, 'progress');
    });

    const debouncedUpdateBars = debounce(updateBars, 300);
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', debouncedUpdateBars);
    });

    loadProgress();
};