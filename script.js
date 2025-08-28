/* Structură generală */
body {
    font - family: Arial, sans - serif;
    background - color: #f0f4f8;
    padding: 20px;
    max - width: 700px;
    margin: auto;
}

h1 {
    text - align: center;
    color: #333;
    margin - bottom: 30px;
}

section {
    margin - bottom: 40px;
}

h2 {
    margin - top: 30px;
    color: #444;
    text - align: center;
    font - size: 22px;
}

/* Container pentru fiecare bară */
.bar - container {
    margin - bottom: 20px;
    padding: 10px 0;
    border - bottom: 1px solid #ddd;
}

/* Etichete */
label {
    display: block;
    margin - bottom: 5px;
    font - weight: bold;
    color: #333;
}

/* Bare de progres */
progress {
    width: 100 %;
    height: 20px;
    appearance: none;
    border - radius: 5px;
    overflow: hidden;
}

progress:: -webkit - progress - bar {
    background - color: #e0e0e0;
    border - radius: 5px;
}

progress:: -webkit - progress - value {
    background - color: #0077cc;
    border - radius: 5px;
}

/* Inputuri și selectoare */
input[type = "number"],
    select {
    margin - top: 5px;
    padding: 6px;
    width: 120px;
    font - size: 14px;
    border: 1px solid #ccc;
    border - radius: 4px;
}

input::placeholder {
    color: #999;
    font - style: italic;
}

/* Buton principal */
button {
    display: block;
    width: 100 %;
    padding: 12px;
    background - color: #0077cc;
    color: white;
    border: none;
    border - radius: 6px;
    font - size: 16px;
    margin - top: 30px;
    transition: background - color 0.2s ease, transform 0.1s ease;
}

button:hover {
    background - color: #006bbd;
    cursor: pointer;
}

button:active {
    transform: scale(0.98);
    background - color: #005fa3;
}

/* Procentaj lângă bare */
.percent {
    margin - left: 10px;
    font - weight: bold;
    font - size: 14px;
}

.percent.red {
    color: #d32f2f;
}

.percent.yellow {
    color: #fbc02d;
}

.percent.blue {
    color: #1976d2;
}

/* Sugestii */
.suggestions {
    margin - top: 20px;
    padding: 12px;
    background - color: #e0f7fa;
    border - radius: 6px;
    text - align: center;
    font - style: italic;
    color: #0077cc;
    font - size: 15px;
}

/* Feedback (opțional) */
.feedback {
    margin - top: 10px;
    padding: 10px;
    background - color: #fff3cd;
    border - left: 5px solid #ffecb5;
    font - size: 14px;
    color: #856404;
    border - radius: 5px;
}

/* Grafic */
canvas {
    width: 100 % !important;
    height: auto!important;
    margin - top: 20px;
}

/* Responsive */
@media screen and(max - width: 500px) {
    input[type = "number"],
        select {
        width: 100 %;
    }

  button {
        font - size: 15px;
    }

  .percent {
        display: block;
        margin - top: 5px;
    }
}
