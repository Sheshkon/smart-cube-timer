import { useEffect, useRef } from 'react';

import { fitCanvas, readHighScore, writeHighScore } from '../../fitCanvas';

const SIZES = {
  3: { r: 32, score: 20, speed: 90 },
  2: { r: 20, score: 50, speed: 130 },
  1: { r: 11, score: 100, speed: 170 },
};

function rockShape(size) {
  const { r } = SIZES[size];
  const n = 9 + (size % 3);
  const pts = [];
  for (let i = 0; i < n; i += 1) {
    const a = (i / n) * Math.PI * 2;
    const jagged = 0.68 + ((Math.sin(i * 2.7 + size * 5) + 1) / 2) * 0.42;
    pts.push([Math.cos(a) * r * jagged, Math.sin(a) * r * jagged]);
  }
  return pts;
}

function spawnRock(width, size, x) {
  const cfg = SIZES[size];
  const fall = cfg.speed * (0.75 + Math.random() * 0.5);
  return {
    x: x ?? 24 + Math.random() * (width - 48),
    y: -cfg.r - 8,
    size,
    r: cfg.r,
    vx: (Math.random() - 0.5) * 40,
    vy: fall,
    rot: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 2,
    shape: rockShape(size),
  };
}

function drawPoly(ctx, pts) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i += 1) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.stroke();
}

const SpaceShipGame = ({
  width,
  height,
  playing,
  actionQueueRef,
  sensitivityRef,
  storageKey,
  onGameOver,
}) => {
  const canvasRef = useRef(null);
  const playingRef = useRef(playing);
  const onGameOverRef = useRef(onGameOver);
  const keysRef = useRef({ left: false, right: false, up: false, fire: false });
  playingRef.current = playing;
  onGameOverRef.current = onGameOver;

  useEffect(() => {
    const onDown = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keysRef.current.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keysRef.current.right = true;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') keysRef.current.up = true;
      if (e.code === 'Space') {
        keysRef.current.fire = true;
        e.preventDefault();
      }
    };
    const onUp = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keysRef.current.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keysRef.current.right = false;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') keysRef.current.up = false;
      if (e.code === 'Space') keysRef.current.fire = false;
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
    const stars = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      s: 0.6 + Math.random() * 1.6,
    }));

    const restY = height - 52;
    const state = {
      x: width / 2,
      y: restY,
      boost: 0,
      rocks: [],
      shots: [],
      fireCd: 0,
      pendingFire: 0,
      spawn: 0.4,
      score: 0,
      lives: 3,
      invuln: 1.5,
      scroll: 0,
      hi: readHighScore(storageKey),
      over: false,
    };

    let last = performance.now();
    let raf = 0;

    const finish = () => {
      if (state.over) return;
      state.over = true;
      state.hi = writeHighScore(storageKey, state.score) ?? state.hi;
      onGameOverRef.current?.(state.score);
    };

    const emitShots = () => {
      const shotY = state.y - 16;
      const sideOffset = 10;
      const shot = (x) => ({ x, y: shotY, vx: 0, vy: -420, life: 0.9 });
      state.shots.push(shot(state.x - sideOffset), shot(state.x + sideOffset));
    };

    const fireNow = () => {
      if (state.fireCd > 0 || state.lives <= 0) return false;
      state.fireCd = 0.2;
      emitShots();
      return true;
    };

    /** Cube queue / double moves (e.g. F2): extra shots wait for cooldown. */
    const queueFire = () => {
      if (state.lives <= 0) return;
      if (!fireNow()) state.pendingFire += 1;
    };

    const hitShip = () => {
      if (state.invuln > 0 || state.lives <= 0) return;
      state.lives -= 1;
      state.invuln = 2;
      if (state.lives <= 0) finish();
    };

    const loop = (now) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;

      if (playingRef.current && !state.over) {
        const queue = actionQueueRef?.current;
        if (queue?.length) {
          const sens = sensitivityRef?.current ?? 1;
          for (const action of queue) {
            if (action === 'moveLeft') state.x -= 64 * sens;
            else if (action === 'moveRight') state.x += 64 * sens;
            else if (action === 'thrust') state.boost = Math.max(state.boost, sens);
            else if (action === 'fire') queueFire();
          }
          queue.length = 0;
        }

        if (keysRef.current.left) state.x -= 320 * dt;
        if (keysRef.current.right) state.x += 320 * dt;
        if (keysRef.current.up) state.boost = 1;
        if (keysRef.current.fire) fireNow();

        state.fireCd = Math.max(0, state.fireCd - dt);
        if (state.pendingFire > 0 && state.fireCd <= 0) {
          if (fireNow()) state.pendingFire -= 1;
        }

        const minX = 18;
        const maxX = width - 18;
        state.x = Math.max(minX, Math.min(maxX, state.x));

        const minY = 64;
        const targetY = restY - Math.max(0, Math.min(1, state.boost)) * (restY - minY);
        state.y += (targetY - state.y) * (1 - Math.exp(-14 * dt));
        state.boost *= Math.exp(-3.5 * dt);
        if (state.boost < 0.04) state.boost = 0;

        state.scroll += 140 * dt;
        state.invuln = Math.max(0, state.invuln - dt);

        state.spawn -= dt;
        if (state.spawn <= 0) {
          const wave = 1 + Math.min(3, (state.score / 200) | 0);
          state.spawn = Math.max(0.35, 1.1 - wave * 0.12);
          const size = Math.random() < 0.55 ? 3 : Math.random() < 0.7 ? 2 : 1;
          state.rocks.push(spawnRock(width, size));
        }

        for (const star of stars) {
          star.y += (40 + star.s * 50) * dt;
          if (star.y > height) {
            star.y = 0;
            star.x = Math.random() * width;
          }
        }

        for (const s of state.shots) {
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          s.life -= dt;
        }
        state.shots = state.shots.filter((s) => s.life > 0 && s.y > -10);

        for (const r of state.rocks) {
          r.x += r.vx * dt;
          r.y += r.vy * dt;
          r.rot += r.spin * dt;
          if (r.x < r.r) {
            r.x = r.r;
            r.vx *= -1;
          }
          if (r.x > width - r.r) {
            r.x = width - r.r;
            r.vx *= -1;
          }
          const dx = r.x - state.x;
          const dy = r.y - state.y;
          if (dx * dx + dy * dy < (r.r + 10) * (r.r + 10)) hitShip();
        }
        state.rocks = state.rocks.filter((r) => r.y < height + 50);

        for (let i = state.shots.length - 1; i >= 0; i -= 1) {
          const s = state.shots[i];
          for (let j = state.rocks.length - 1; j >= 0; j -= 1) {
            const r = state.rocks[j];
            const dx = r.x - s.x;
            const dy = r.y - s.y;
            if (dx * dx + dy * dy >= r.r * r.r) continue;
            state.shots.splice(i, 1);
            state.rocks.splice(j, 1);
            state.score += SIZES[r.size].score;
            if (r.size > 1) {
              state.rocks.push(spawnRock(width, r.size - 1, r.x - 8));
              state.rocks.push(spawnRock(width, r.size - 1, r.x + 8));
              state.rocks[state.rocks.length - 1].y = r.y;
              state.rocks[state.rocks.length - 2].y = r.y;
            }
            break;
          }
        }
      }

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#fff';
      for (const star of stars) {
        ctx.fillRect(star.x, star.y, star.s, star.s);
      }

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.lineJoin = 'round';
      for (const r of state.rocks) {
        ctx.save();
        ctx.translate(r.x, r.y);
        ctx.rotate(r.rot);
        drawPoly(ctx, r.shape);
        ctx.restore();
      }

      for (const s of state.shots) {
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x, s.y + 10);
        ctx.stroke();
      }

      const blink = state.invuln > 0 && Math.floor(state.invuln * 10) % 2 === 0;
      if (state.lives > 0 && !blink) {
        ctx.save();
        ctx.translate(state.x, state.y);
        ctx.rotate(-Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(14, 0);
        ctx.lineTo(-12, 9);
        ctx.lineTo(-7, 0);
        ctx.lineTo(-12, -9);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-7, 0);
        ctx.lineTo(-16 - Math.sin(state.scroll * 0.2) * 3, 4);
        ctx.lineTo(-11, 0);
        ctx.lineTo(-16 - Math.sin(state.scroll * 0.2) * 3, -4);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }

      ctx.font = '14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(String(state.score), 12, 20);
      ctx.fillText(`BEST ${state.hi}`, 12, 38);
      for (let i = 0; i < state.lives; i += 1) {
        ctx.save();
        ctx.translate(width - 18 - i * 16, 18);
        ctx.rotate(-Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(-6, 5);
        ctx.lineTo(-4, 0);
        ctx.lineTo(-6, -5);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }

      if (state.over) {
        ctx.textAlign = 'center';
        ctx.font = 'bold 22px monospace';
        ctx.fillText('GAME OVER', width / 2, height / 2 - 6);
        ctx.font = '13px monospace';
        ctx.fillText(`SCORE ${state.score}`, width / 2, height / 2 + 16);
        ctx.textAlign = 'left';
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [width, height, actionQueueRef, storageKey]);

  return <canvas ref={canvasRef} className='rounded-lg border border-gray-200 dark:border-gray-600 bg-black' />;
};

export default SpaceShipGame;
