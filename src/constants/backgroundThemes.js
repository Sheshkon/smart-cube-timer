export const DEFAULT_ACCENT_COLOR = '#2563eb';

export const ACCENT_PALETTE = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#0ea5e9',
  '#2563eb',
  '#7c3aed',
  '#d946ef',
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function hexToRgb(hex) {
  const value = String(hex).replace('#', '');
  if (value.length !== 6) {
    return null;
  }

  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function rgbToHex(r, g, b) {
  const toHex = (channel) =>
    Math.round(clamp(channel, 0, 255)).toString(16).padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function accentFromSpectrum(position) {
  const stops = ACCENT_PALETTE;
  const t = clamp(position, 0, 1) * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.floor(t));
  const local = t - index;
  const from = hexToRgb(stops[index]);
  const to = hexToRgb(stops[index + 1]);

  return rgbToHex(
    from.r + (to.r - from.r) * local,
    from.g + (to.g - from.g) * local,
    from.b + (to.b - from.b) * local
  );
}

export function spectrumFromAccent(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return spectrumFromAccent(DEFAULT_ACCENT_COLOR);
  }

  let bestPosition = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  const steps = 240;

  for (let step = 0; step <= steps; step += 1) {
    const position = step / steps;
    const sample = hexToRgb(accentFromSpectrum(position));
    const distance =
      (sample.r - rgb.r) ** 2 + (sample.g - rgb.g) ** 2 + (sample.b - rgb.b) ** 2;

    if (distance < bestDistance) {
      bestDistance = distance;
      bestPosition = position;
    }
  }

  return bestPosition;
}

function mix(accent, percent, base) {
  return `color-mix(in srgb, ${accent} ${percent}%, ${base})`;
}

function isLightHex(hex) {
  const value = String(hex).replace('#', '');
  if (value.length !== 6) {
    return false;
  }

  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 155;
}

function textOnAccent(accent) {
  return isLightHex(accent) ? '#111827' : '#ffffff';
}

export function buildAccentDesign(id, accent = DEFAULT_ACCENT_COLOR) {
  const onAccent = textOnAccent(accent);

  if (id === 'solid') {
    return {
      id: 'solid',
      label: 'Solid',
      usesAccent: true,
      accent,
      bar: '0px',
      rail: '0px',
      light: {
        page: accent,
        pageText: onAccent,
        card: '#ffffff',
        cardText: '#111827',
        line: mix(accent, 22, '#ffffff'),
        handle: mix(accent, 16, '#ffffff'),
        handleText: '#1e293b',
      },
      dark: {
        page: mix(accent, 70, '#020617'),
        pageText: '#f8fafc',
        card: '#0f172a',
        cardText: '#f8fafc',
        line: mix(accent, 38, '#020617'),
        handle: mix(accent, 48, '#020617'),
        handleText: '#f9fafb',
      },
    };
  }

  if (id === 'stripe') {
    return {
      id: 'stripe',
      label: 'Accent stripe',
      usesAccent: true,
      accent,
      bar: '0px',
      rail: '6px',
      light: {
        page: mix(accent, 12, '#f8fafc'),
        pageText: '#0f172a',
        card: '#ffffff',
        cardText: '#111827',
        line: mix(accent, 26, '#ffffff'),
        handle: accent,
        handleText: onAccent,
      },
      dark: {
        page: mix(accent, 16, '#0b1220'),
        pageText: '#f8fafc',
        card: '#1e293b',
        cardText: '#f8fafc',
        line: mix(accent, 34, '#0b1220'),
        handle: mix(accent, 78, '#ffffff'),
        handleText: '#111827',
      },
    };
  }

  return {
    id: 'ink',
    label: 'Ink cards',
    usesAccent: true,
    accent,
    bar: '0px',
    rail: '0px',
    light: {
      page: mix(accent, 10, '#f1f5f9'),
      pageText: '#0f172a',
      card: mix(accent, 26, '#ffffff'),
      cardText: '#111827',
      line: mix(accent, 36, '#ffffff'),
      handle: mix(accent, 26, '#ffffff'),
      handleText: '#111827',
    },
    dark: {
      page: mix(accent, 12, '#020617'),
      pageText: '#f8fafc',
      card: accent,
      cardText: onAccent,
      line: mix(accent, 40, '#020617'),
      handle: mix(accent, 55, '#020617'),
      handleText: onAccent,
    },
  };
}

export const STATIC_THEMES = [
  {
    id: 'default',
    label: 'Default',
    usesAccent: false,
    accent: '#64748b',
    bar: '0px',
    rail: '0px',
    light: {
      page: '#f3f4f6',
      pageText: '#111827',
      card: '#ffffff',
      cardText: '#111827',
      line: '#e5e7eb',
      handle: '#e5e7eb',
      handleText: '#111827',
    },
    dark: {
      page: '#111827',
      pageText: '#f9fafb',
      card: '#1f2937',
      cardText: '#f9fafb',
      line: '#374151',
      handle: '#374151',
      handleText: '#f9fafb',
    },
  },
  {
    id: 'paper',
    label: 'Soft paper',
    usesAccent: false,
    accent: '#b45309',
    bar: '0px',
    rail: '0px',
    light: {
      page: '#f3ead6',
      pageText: '#111827',
      card: '#fbf6ea',
      cardText: '#111827',
      line: '#e4d3a8',
      handle: '#e4d3a8',
      handleText: '#111827',
    },
    dark: {
      page: '#231e12',
      pageText: '#f9fafb',
      card: '#332c1a',
      cardText: '#f9fafb',
      line: '#5a4c2a',
      handle: '#5a4c2a',
      handleText: '#f9fafb',
    },
  },
];

export const ACCENT_THEME_IDS = ['solid', 'stripe', 'ink'];

export const ACCENT_THEMES = ACCENT_THEME_IDS.map((id) => buildAccentDesign(id));

export const BACKGROUND_THEMES = [...STATIC_THEMES, ...ACCENT_THEMES];

const LEGACY_TO_DESIGN = {
  none: 'default',
  default: 'default',
  sky: 'solid',
  ocean: 'solid',
  sunset: 'paper',
  ruby: 'paper',
  violet: 'paper',
  forest: 'paper',
  sand: 'paper',
};

export const DEFAULT_BACKGROUND_THEME_ID = 'default';

export function resolveBackgroundTheme(value, accentColor = DEFAULT_ACCENT_COLOR) {
  if (!value || value === 'none') {
    return STATIC_THEMES[0];
  }

  if (ACCENT_THEME_IDS.includes(value)) {
    return buildAccentDesign(value, accentColor);
  }

  const staticTheme = STATIC_THEMES.find((theme) => theme.id === value);
  if (staticTheme) {
    return staticTheme;
  }

  const migratedId = LEGACY_TO_DESIGN[String(value).toLowerCase()];
  if (migratedId) {
    return resolveBackgroundTheme(migratedId, accentColor);
  }

  return STATIC_THEMES[0];
}

export function applyBackgroundTheme(value, themeMode, accentColor = DEFAULT_ACCENT_COLOR) {
  const theme = resolveBackgroundTheme(value, accentColor);
  const colors = themeMode === 'dark' ? theme.dark : theme.light;
  const root = document.documentElement;

  root.style.setProperty('--app-page-bg', colors.page);
  root.style.setProperty('--app-page-text', colors.pageText);
  root.style.setProperty('--app-card-bg', colors.card);
  root.style.setProperty('--app-card-line', colors.line);
  root.style.setProperty('--app-card-bar', theme.bar);
  root.style.setProperty('--app-card-rail', theme.rail || '0px');
  root.style.setProperty('--handle-bg', colors.handle);
  root.style.setProperty('--handle-text', colors.handleText);
  root.style.setProperty('--app-card-text', colors.cardText);
  root.style.setProperty('--app-accent', theme.accent);
  root.style.setProperty('--app-on-accent', textOnAccent(theme.accent));
  root.dataset.design = theme.id;
}
