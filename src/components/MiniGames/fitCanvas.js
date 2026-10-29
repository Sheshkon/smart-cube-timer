export function fitCanvas(canvas, width, height) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

export function readHighScore(storageKey) {
  if (!storageKey) return 0;
  const raw = Number(localStorage.getItem(storageKey));
  return Number.isFinite(raw) ? raw : 0;
}

export function writeHighScore(storageKey, score) {
  if (!storageKey) return;
  const next = Math.max(readHighScore(storageKey), Math.floor(score));
  localStorage.setItem(storageKey, String(next));
  return next;
}
