const subNevoi = [
    { id: "food", target: 3 },
    { id: "water", target: 2 },
    { id: "sleep", target: 8 },
    { id: "sport", target: 60 },
    { id: "steps", target: 10000 }
];

const carieraSub = [
    { id: "video", target: 60 },
    { id: "munca", target: 120 },
    { id: "citit", target: 60 }
];

const relatiiSub = [
    { id: "mama", impact: 10 },
    { id: "tata", impact: 10 },
    { id: "prieteni", impact: 5 },
    { id: "extinsa", impact: 2 }
];

const bars = ["nevoi", "cariera", "relatii"];

function updateBars() {
    let totalNevoi = 0;
    subNevoi.forEach(nevoie => {
        const input = document.getElementById(nevoie.id + "Input");
        const bar = document.getElementById(nevoie.id);
        const val = parseFloat(input.value);
        if (!isNaN(val)) {
            const percent = Math.min(100, Math.round((val / nevoie.target) * 100));
            bar.value = percent;
            updatePercent(nevoie.id, percent);
            localStorage.setItem(nevoie.id, percent);
            saveHistory(nevoie.id, percent);
            input.value = "";
        }
        totalNevoi += parseInt(bar.value);
    });

    const scorNevoi = Math.round(totalNevoi / subNevoi.length);
    document.getElementById("nevoi").value = scorNevoi;
    updatePercent("nevoi", scorNevoi);
    localStorage.setItem("nevoi", scorNevoi);
    saveHistory("nevoi", scorNevoi);

    let totalCariera = 0;
    carieraSub.forEach(act => {
        const input = document.getElementById(act.id + "Input");
        const bar = document.getElementById(act.id);
        const val = parseFloat(input.value);
        if (!isNaN(val)) {
            const percent = Math.min(100, Math.round((val / act.target) * 100));
            bar.value = percent;
            updatePercent(act.id, percent);
            localStorage.setItem(act.id, percent);
            saveHistory(act.id, percent);
            input.value = "";
        }
        totalCariera += parseInt(bar.value);
    });

    const scorCariera = Math.round(totalCariera / carieraSub.length);
    document.getElementById("cariera").value = scorCariera;
    updatePercent("cariera", scorCariera);
    localStorage.setItem("cariera", scorCariera);
    saveHistory("cariera", scorCariera);

    let totalRelatii = 0;
    relatiiSub.forEach(pers => {
        const input = document.getElementById(pers.id + "Input");
        const tip = document.getElementById(pers.id + "Tip");
        const bar = document.getElementById(pers.id);
        const val = parseInt(input.value);
        const impact = parseInt(tip.value);
        if (!isNaN(val) && val > 0) {
            let newValue = Math.min(100, bar.value + val * impact);
            bar.value = newValue;
            updatePercent(pers.id, newValue);
            localStorage.setItem(pers.id, newValue);
            saveHistory(pers.id, newValue);
            input.value = "";
        }
        totalRelatii += parseInt(bar.value);
    });

    const scorRelatii = Math.round(totalRelatii / relatiiSub.length);
    document.getElementById("relatii").value = scorRelatii;
    updatePercent("relatii", scorRelatii);
    localStorage.setItem("relatii", scorRelatii);
    saveHistory("relatii", scorRelatii);

    localStorage.setItem("lastUpdate", new Date().toISOString().split("T")[0]);
    showSuggestions();
    document.getElementById("progressChart").remove();
    const newCanvas = document.createElement("canvas");
    newCanvas.id = "progressChart";
    newCanvas.style.marginTop = "20px";
    document.body.appendChild(newCanvas);
    updateChart();
}

function updatePercent(id, value) {
    const span = document.getElementById(id + "Percent");
    if (!span) return;
    span.textContent = value + "%";
    span.className = "percent";
    if (value >= 80) span.classList.add("green");
    else if (value >= 50) span.classList.add("yellow");
    else span.classList.add("red");
}

function certConflict(id) {
    const bar = document.getElementById(id);
    let newValue = Math.max(0, bar.value - 30);
    bar.value = newValue;
    updatePercent(id, newValue);
    localStorage.setItem(id, newValue);
    saveHistory(id, newValue);
    const feedback = document.getElementById("feedback");
    const nume = id === "mama" ? "Mama" : id === "tata" ? "Tata" : id;
    feedback.innerHTML += `<div style="color:#c62828; font-weight:bold;">💔 Ai marcat o ceartă cu ${nume}. Relația a scăzut cu 30%. Încearcă o conversație sinceră pentru reconciliere.</div>`;
}

function loadProgress() {
    [...subNevoi.map(n => n.id), ...carieraSub.map(c => c.id), ...relatiiSub.map(r => r.id), ...bars].forEach(bar => {
        const saved = localStorage.getItem(bar);
        if (saved !== null) {
            document.getElementById(bar).value = parseInt(saved);
            updatePercent(bar, parseInt(saved));
        }
    });
    checkDailyDecay();
    updateChart();
    showSuggestions();
}

function checkDailyDecay() {
    const today = new Date().toISOString().split("T")[0];
    const lastUpdate = localStorage.getItem("lastUpdate") || today;
    if (lastUpdate !== today) {
        [...subNevoi.map(n => n.id), ...carieraSub.map(c => c.id), ...bars].forEach(bar => {
            const progress = document.getElementById(bar);
            let newValue = Math.max(0, progress.value - 10);
            progress.value = newValue;
            updatePercent(bar, newValue);
            localStorage.setItem(bar, newValue);
            saveHistory(bar, newValue);
        });
        relatiiSub.forEach(pers => {
            const bar = document.getElementById(pers.id);
            let newValue = Math.max(0, bar.value - 5);
            bar.value = newValue;
            updatePercent(pers.id, newValue);
            localStorage.setItem(pers.id, newValue);
            saveHistory(pers.id, newValue);
        });
        localStorage.setItem("lastUpdate", today);
    }
}

function saveHistory(bar, value) {
    const today = new Date().toISOString().split("T")[0];
    let history = JSON.parse(localStorage.getItem(bar + "_history") || "{}");
    history[today] = value;
    localStorage.setItem(bar + "_history", JSON.stringify(history));
}

function updateChart() {
    const ctx = document.getElementById("progressChart").getContext("2d");
    const dates = [];
    const data = {};
    [...subNevoi.map(n => n.id), ...carieraSub.map(c => c.id), ...relatiiSub.map(r => r.id), ...bars].forEach(bar => data[bar] = []);
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split("T")[0]);
    }
    [...subNevoi.map(n => n.id), ...carieraSub.map(c => c.id), ...relatiiSub.map(r => r.id), ...bars].forEach(bar => {
        const history = JSON.parse(localStorage.getItem(bar + "_history") || "{}");
        dates.forEach(date => {
            data[bar].push(history[date] || 0);
        });
    });
    new Chart(ctx, {
        type: "line",
        data: {
            labels: dates,
            datasets: Object.keys(data).map(bar => ({
                label: bar.charAt(0).toUpperCase() + bar.slice(1),
                data: data[bar],
                borderColor: randomColor(),
                backgroundColor: "rgba(0,0,0,0.1)",
                fill: true
            }))
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100