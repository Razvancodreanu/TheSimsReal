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
    labels: {
        food: 'Mese pe zi',
        water: 'Litri azi',
        sleep: 'Ore dormite',
        sport: 'Ore activitate',
        steps: 'Pași',
        nevoi: 'Nevoi generale',
        relatii: 'Relații',
        cariera: 'Carieră'
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
    if (!element) console.error(`Element with ID ${id} not found`);
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

        const val = parseFloat(input.value) || 0;
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

        const change = parseInt(input.value) || 0;
        let newValue = Math.min(100, Math.max(0, parseInt(progress.value) + change));
        progress.value = newValue;
        setStoredData(bar, newValue);
        saveHistory(bar, newValue);
        input.value = '';
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

    if (lastUpdate !== today