const bars = ['nevoi', 'relatii', 'cariera'];

function loadProgress() {
    bars.forEach(bar => {
        const saved = localStorage.getItem(bar);
        if (saved !== null) {
            document.getElementById(bar).value = parseInt(saved);
        }
    });
}

function updateBars() {
    bars.forEach(bar => {
        const input = document.getElementById(bar + 'Input');
        const progress = document.getElementById(bar);
        const change = parseInt(input.value);
        if (!isNaN(change)) {
            let newValue = Math.min(100, Math.max(0, progress.value + change));
            progress.value = newValue;
            localStorage.setItem(bar, newValue);
            input.value = '';
        }
    });
}

loadProgress();
