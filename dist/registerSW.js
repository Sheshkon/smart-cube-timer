if('serviceWorker' in navigator) {window.addEventListener('load', () => {navigator.serviceWorker.register('/smart-cube-timer/sw.js', { scope: '/smart-cube-timer/' })})}