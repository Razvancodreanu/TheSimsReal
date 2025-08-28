const subNevoi = [
    { id: "food", target: 3 },
    { id: "water", target: 2 },
    { id: "sleep", target: 8 },
    { id: "sport", target: 1 },
    { id: "steps", target: 10000 }
];

const bars = ['nevoi', 'relatii', 'cariera'];

function updateBars() {
    let total = 0;

    subNevoi.forEach(nevoie => {
        const input = document.getElementById(nevoie.id + "Input");
        const bar = document.getElementById(nevoie.id);
        const val = parseFloat(input.value);
        if (!isNaN(val)) {
            const percent = Math.min(100, Math.round((val / nevoie.target) * 100));
            bar.value = percent;
            localStorage.setItem(nevoie.id, percent);
            saveHistory(nevoie.id, percent);
            input.value = "";
        }
        total += parseInt(bar.value);
    });

    const scorGeneral = Math.round(total / subNevoi.length);
    document.getElementById("nevoi").value = scorGeneral;
    localStorage.setItem("nevoi", scorGeneral);
    saveHistory("nevoi", scorGeneral);

    ['relatii', 'cariera'].forEach(bar => {
        const input = document.getElementById(bar + 'Input');
        const progress = document.getElementById(bar);
        const change = parseInt(input.value);
        if (!isNaN(change)) {
            let newValue = Math.min(100, Math.max(0, progress.value + change));
            progress.value = newValue;
            localStorage.setItem(bar, newValue);
            saveHistory(bar, newValue);
            input.value = '';
        }
    });

    localStorage.setItem('lastUpdate', new Date().toISOString().split('T')[0]);
    showSuggestions();
    document.getElementById('progressChart').remove();
    const newCanvas = document.createElement('canvas');
    newCanvas.id = 'progressChart';
    newCanvas.style.marginTop = '20px';
    document.body.appendChild(newCanvas);
    updateChart();
}

function loadProgress() {
    [...subNevoi.map(n => n.id), ...bars].forEach(bar => {
        const saved = localStorage.getItem(bar);
        if (saved !== null) {
            document.getElementById(bar).value = parseInt(saved);
        }
    });
    checkDailyDecay();
    updateChart();
    showSuggestions();
}

function checkDailyDecay() {
    const today = new Date().toISOString().split('T')[0];
    const lastUpdate = localStorage.getItem('lastUpdate') || today;

    if (lastUpdate !== today) {
        [...subNevoi.map(n => n.id), ...bars].forEach(bar => {
            const progress = document.getElementById(bar);
            let newValue = Math.max(0, progress.value - 10);
            progress.value = newValue;
            localStorage.setItem(bar, newValue);
            saveHistory(bar, newValue);
        });
        localStorage.setItem('lastUpdate', today);
    }
}

function saveHistory(bar, value) {
    const today = new Date().toISOString().split('T')[0];
    let history = JSON.parse(localStorage.getItem(bar + '_history') || '{}');
    history[today] = value;
    localStorage.setItem(bar + '_history', JSON.stringify(history));
}

function updateChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    const dates = [];
    const data = {};

    [...subNevoi.map(n => n.id), ...bars].forEach(bar => data[bar] = []);

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }

    [...subNevoi.map(n => n.id), ...bars].forEach(bar => {
        const history = JSON.parse(localStorage.getItem(bar + '_history') || '{}');
        dates.forEach(date => {
            data[bar].push(history[date] || 0);
        });
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [...subNevoi.map(n => ({
                label: n.id.charAt(0).toUpperCase() + n.id.slice(1),
                data: data[n.id],
                borderColor: randomColor(),
                backgroundColor: 'rgba(0,0,0,0.1)',
                fill: true
            })), {
                label: 'Nevoi Generale',
                data: data.nevoi,
                borderColor: '#ff6384',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: true
            }, {
                label: 'Relații',
                data: data.relatii,
                borderColor: '#36a2eb',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: true
            }, {
                label: 'Carieră',
                data: data.cariera,
                borderColor: '#4bc0c0',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function randomColor() {
    const colors = ['#ff6384', '#36a2eb', '#4bc0c0', '#9966ff', '#ff9f40'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function showSuggestions() {
    const suggestions = [];

    subNevoi.forEach(n => {
        const val = parseInt(document.getElementById(n.id).value);
        if (val < 50) {
            if (n.id === 'food') suggestions.push('🍽️ Mănâncă o masă sănătoasă!');
            if (n.id === 'water') suggestions.push('💧 Bea mai multă apă!');
            if (n.id === 'sleep') suggestions.push('😴 Dormi mai mult!');
            if (n.id === 'sport') suggestions.push('🏃 Fă puțină mișcare!');
            if (n.id === 'steps') suggestions.push('👣 Ieși la o plimbare!');
        }
    });

    const relatiiVal = parseInt(document.getElementById('relatii').value);
    const carieraVal = parseInt(document.getElementById('cariera').value);

    if (relatiiVal < 50) suggestions.push('💬 Relații jos: sună un prieten!');
    if (carieraVal < 50) suggestions.push('💼 Carieră jos: fă un pas mic azi!');

    const suggestionDiv = document.getElementById('suggestions');
    suggestionDiv.textContent = suggestions.length > 0 ? suggestions.join(' ') : 'Totul e echilibrat!';
}

window.onload = () => {
    loadProgress();
};
