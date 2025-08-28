const relatiiIndiv = [
    {
        id: "mama",
        impact: {
            emotionala: 100,
            practica: 50,
            superficiala: 25,
            cearta: "scade"
        }
    },
    {
        id: "tata",
        impact: {
            emotionala: 100,
            practica: 50,
            superficiala: 25,
            cearta: "scade"
        }
    },
    {
        id: "prieteni",
        impact: {
            emotionala: 100,
            practica: 50,
            superficiala: 25,
            cearta: "scade"
        }
    },
    {
        id: "extinsa",
        impact: {
            emotionala: 100,
            practica: 50,
            superficiala: 25,
            cearta: "scade"
        }
    }
];

function updateBars() {
    relatiiIndiv.forEach(pers => {
        const input = document.getElementById(pers.id + "Input");
        const tip = document.getElementById(pers.id + "Tip");
        const bar = document.getElementById(pers.id);
        const val = parseInt(input.value);
        const tipVal = tip.value;
        const impact = pers.impact[tipVal];

        if (!isNaN(val) && val > 0) {
            let current = parseInt(bar.value);
            let newValue;

            if (impact === "scade") {
                newValue = Math.max(-100, Math.round(current * 0.5));
            } else {
                const totalImpact = Math.min(impact * val, 100);
                newValue = Math.min(100, current + totalImpact);
            }

            bar.value = newValue;
            updatePercent(pers.id, newValue);
            localStorage.setItem(pers.id, newValue);
            input.value = "";
        }
    });
}

function updatePercent(id, value) {
    const span = document.getElementById(id + "Percent");
    if (!span) return;
    span.textContent = value + "%";
    span.className = "percent";

    if (value < 30) {
        span.classList.add("red");
    } else if (value < 60) {
        span.classList.add("yellow");
    } else {
        span.classList.add("blue");
    }
}

window.onload = () => {
    relatiiIndiv.forEach(pers => {
        const saved = localStorage.getItem(pers.id);
        if (saved !== null)