import { useEffect, useRef } from 'react';

import { fitCanvas, readHighScore, writeHighScore } from '../../fitCanvas';

const CAR_W = 22;
const CAR_H = 36;

function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

const RacingGame = ({ width, height, playing, dark, steerRef, storageKey, onGameOver }) => {
  const canvasRef = useRef(null);
  const playingRef = useRef(playing);
  const onGameOverRef = useRef(onGameOver);
  const keysRef = useRef({ left: false, right: false });
  playingRef.current = playing;
  onGameOverRef.current = onGameOver;

  useEffect(() => {
    const onDown = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keysRef.current.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keysRef.current.right = true;
    };
    const onUp = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keysRef.current.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keysRef.current.right = false;
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = fitCanvas(canvas, width, height);

    const roadW = width * 0.62;
    const roadX = (width - roadW) / 2;
    const state = {
      playerX: width / 2,
      scroll: 0,
      speed: 220,
      distance: 0,
      spawn: 0.6,
      cars: [],
      hi: readHighScore(storageKey),
      over: false,
      score: 0,
    };

    let last = performance.now();
    let raf = 0;

    const finish = () => {
      if (state.over) return;
      state.over = true;
      state.score = Math.floor(state.distance / 10);
      state.hi = writeHighScore(storageKey, state.score) ?? state.hi;
      onGameOverRef.current?.(state.score);
    };

    const loop = (now) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;

      if (playingRef.current && !state.over) {
        let steer = steerRef?.current ?? 0;
        if (keysRef.current.left) steer -= 1;
        if (keysRef.current.right) steer += 1;
        steer = Math.max(-1, Math.min(1, steer));

        state.speed = Math.min(420, state.speed + dt * 8);
        state.distance += state.speed * dt;
        state.scroll += state.speed * dt;

        const minX = roadX + 8 + CAR_W / 2;
        const maxX = roadX + roadW - 8 - CAR_W / 2;
        const targetX = (minX + maxX) / 2 + steer * ((maxX - minX) / 2);
        const follow = 1 - Math.exp(-18 * dt);
        state.playerX += (targetX - state.playerX) * follow;
        state.playerX = Math.max(minX, Math.min(maxX, state.playerX));

        state.spawn -= dt;
        if (state.spawn <= 0) {
          state.spawn = 0.55 + Math.random() * 0.55;
          const lane = (Math.random() * 3) | 0;
          const x = roadX + 18 + lane * ((roadW - 36 - CAR_W) / 2);
          state.cars.push({
            x,
            y: -CAR_H - 10,
            w: CAR_W,
            h: CAR_H,
            color: lane === 1 ? '#f59e0b' : '#ef4444',
          });
        }

        const player = { x: state.playerX - CAR_W / 2, y: height - 70, w: CAR_W, h: CAR_H };
        for (const car of state.cars) {
          car.y += state.speed * dt * 0.92;
          if (aabb(player, car)) finish();
        }
        state.cars = state.cars.filter((c) => c.y < height + 40);
      }

      ctx.fillStyle = dark ? '#0f172a' : '#86efac';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = dark ? '#1e293b' : '#64748b';
      ctx.fillRect(roadX - 10, 0, roadW + 20, height);
      ctx.fillStyle = dark ? '#334155' : '#94a3b8';
      ctx.fillRect(roadX, 0, roadW, height);

      ctx.strokeStyle = '#f8fafc';
      ctx.setLineDash([18, 16]);
      ctx.lineWidth = 3;
      ctx.lineDashOffset = -(state.scroll % 34);
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();
      ctx.setLineDash([]);

      for (const car of state.cars) {
        ctx.fillStyle = car.color;
        ctx.fillRect(car.x, car.y, car.w, car.h);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(car.x + 4, car.y + 6, car.w - 8, 10);
      }

      const px = state.playerX - CAR_W / 2;
      const py = height - 70;
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(px, py, CAR_W, CAR_H);
      ctx.fillStyle = '#ecfdf5';
      ctx.fillRect(px + 4, py + 8, CAR_W - 8, 12);

      const score = Math.floor(state.distance / 10);
      ctx.fillStyle = dark ? '#e2e8f0' : '#0f172a';
      ctx.font = '12px sans-serif';
      ctx.fillText(`Score ${score}   Best ${state.hi}`, 10, 18);

      if (state.over) {
        ctx.fillStyle = 'rgba(15,23,42,0.55)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Crash!', width / 2, height / 2 - 8);
        ctx.font = '12px sans-serif';
        ctx.fillText(`Score ${state.score}`, width / 2, height / 2 + 14);
        ctx.textAlign = 'left';
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [width, height, dark, steerRef, storageKey]);

  return <canvas ref={canvasRef} className='rounded-lg border border-gray-200 dark:border-gray-600' />;
};

export default RacingGame;
