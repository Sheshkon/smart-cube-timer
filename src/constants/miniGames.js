export const MiniGameControl = Object.freeze({
  GYRO: 'gyro',
  FACES: 'faces',
});

export const MiniGameId = Object.freeze({
  RACING: 'racing',
  DOODLE: 'doodle',
  SPACESHIP: 'spaceship',
});

export const CUBE_HOME_POSE =
  'Home pose: white on top, green toward you. Reset Gyro in that pose.';

export const CUBE_START_GESTURE = 'To start: turn F then F′ (or F′ then F).';

export const MINI_GAMES_CATALOG = [
  {
    id: MiniGameId.SPACESHIP,
    title: 'Asteroids',
    control: MiniGameControl.FACES,
    supportsSensitivity: false,
    requiresGyro: false,
    description:
      'D′ / D and U / U′ strafe and stay. R / L′ bursts forward, then the ship drifts back. B / B′ or F / F′ fire.',
    hint: 'Left: D′ or U. Right: D or U′. R — forward. Fire: F / F′ or B / B′.',
  },
  {
    id: MiniGameId.RACING,
    title: 'Rally',
    control: MiniGameControl.GYRO,
    supportsSensitivity: true,
    requiresGyro: false,
    description: 'Steer by tilting the cube like F / F′. Without a gyro, turn the F face instead.',
    hint: 'Tilt like F / F′ to steer (white leans left/right). No gyro: turn F and F′.',
  },
  {
    id: MiniGameId.DOODLE,
    title: 'Doodle Jump',
    control: MiniGameControl.GYRO,
    supportsSensitivity: true,
    requiresGyro: false,
    description:
      'Tilt like F / F′ to move sideways. Landing bounces automatically. No gyro: turn F / F′.',
    hint: 'Tilt like F / F′ to move left/right. No gyro: turn F and F′. Landing jumps for you.',
  },
];
