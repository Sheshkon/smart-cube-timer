import { useEffect, useRef } from 'react';

import { fitCanvas, readHighScore, writeHighScore } from '../../fitCanvas';

const PLAYER_W = 28;
const PLAYER_H = 28;
const PLAT_W = 56;
const PLAT_H = 10;

const DoodleJumpGame = ({ width, height, playing, dark, steerRef, storageKey, onGameOver }) => {
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

    const platforms = [];
    for (let i = 0; i < 8; i += 1) {
      platforms.push({
        x: 16 + Math.random() * (width - 16 - PLAT_W),
        y: height - 20 - i * 48,
      });
    }
    platforms[0].x = width / 2 - PLAT_W / 2;
    platforms[0].y = height - 40;

    const state = {
      x: width / 2,
      y: height - 80,
      vx: 0,
      vy: -320,
      cam: 0,
      maxH: 0,
      hi: readHighScore(storageKey),
      over: false,
      score: 0,
    };

    let last = performance.now();
    let raf = 0;

    const finish = () => {
      if (state.over) return;
      state.over = true;
      state.score = Math.floor(state.maxH / 10);
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

        const targetVx = steer * 380;
        state.vx += (targetVx - state.vx) * (1 - Math.exp(-16 * dt));
        state.x += state.vx * dt;
        if (state.x < 0) state.x += width;
        if (state.x > width) state.x -= width;

        state.vy += 780 * dt;
        state.y += state.vy * dt;

        const feet = state.y + PLAYER_H / 2;
        if (state.vy > 0) {
          for (const p of platforms) {
            const top = p.y;
            if (
              feet >= top &&
              feet <= top + PLAT_H + 8 &&
              state.x + PLAYER_W / 2 > p.x &&
              state.x - PLAYER_W / 2 < p.x + PLAT_W
            ) {
              state.vy = -420;
              state.y = top - PLAYER_H / 2;
            }
          }
        }

        const viewY = state.y - state.cam;
        if (viewY < height * 0.38) state.cam = state.y - height * 0.38;

        const climbed = Math.max(0, height - 80 - state.y);
        state.maxH = Math.max(state.maxH, climbed);

        let guard = 0;
        while (guard < 8 && Math.min(...platforms.map((p) => p.y)) > state.cam - 40) {
          platforms.push({
            x: 16 + Math.random() * (width - 16 - PLAT_W),
            y: Math.min(...platforms.map((p) => p.y)) - (40 + Math.random() * 28),
          });
          guard += 1;
        }
        for (let i = platforms.length - 1; i >= 0; i -= 1) {
          if (platforms[i].y > state.cam + height + 40) platforms.splice(i, 1);
        }

        if (state.y - state.cam > height + 20) finish();
      }

      ctx.fillStyle = dark ? '#0c4a6e' : '#e0f2fe';
      ctx.fillRect(0, 0, width, height);

      for (const p of platforms) {
        const y = p.y - state.cam;
        if (y < -20 || y > height + 20) continue;
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(p.x, y, PLAT_W, PLAT_H);
      }

      const py = state.y - state.cam;
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(state.x, py, PLAYER_W / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(state.x - 5, py - 4, 3, 0, Math.PI * 2);
      ctx.arc(state.x + 5, py - 4, 3, 0, Math.PI * 2);
      ctx.fill();

      const score = Math.floor(state.maxH / 10);
      ctx.fillStyle = dark ? '#e2e8f0' : '#0f172a';
      ctx.font = '12px sans-serif';
      ctx.fillText(`Score ${score}   Best ${state.hi}`, 10, 18);

      if (state.over) {
        ctx.fillStyle = 'rgba(15,23,42,0.55)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Fell!', width / 2, height / 2 - 8);
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

export default DoodleJumpGame;
