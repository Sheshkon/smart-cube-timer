const startBtn = document.querySelector('#start-btn');
const stopBtn = document.querySelector('#stop-btn');
const resetBtn = document.querySelector('#reset-btn');
const timerDisplay = document.querySelector('#timer');

let interval;
let startTime;
let elapsedTime = 0;
const TIMOUT = 60;

const toDisplayTime = (ms) => {
    const minutes = Math.floor(ms / 60000).toString().padStart(2, '0');
    const seconds = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
    const milliseconds = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
    return `${minutes > 0 ? minutes + ":" : ""}${seconds}:${milliseconds}`;
}

startBtn.addEventListener('click', () => {
    if (!interval) {
        startTime = Date.now() - elapsedTime;
        interval = setInterval(() => {
            elapsedTime = Date.now() - startTime;
            timerDisplay.textContent = toDisplayTime(elapsedTime);
        }, TIMOUT);
    }
});

stopBtn.addEventListener('click', () => {
    clearInterval(interval);
    interval = null;
});

resetBtn.addEventListener('click', () => {
    clearInterval(interval);
    interval = null;
    elapsedTime = 0;
    timerDisplay.textContent = toDisplayTime(elapsedTime);
});

timerDisplay.textContent = toDisplayTime(0);