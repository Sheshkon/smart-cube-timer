export function readChartTheme() {
  const styles = getComputedStyle(document.documentElement);
  const isDark = document.documentElement.classList.contains('dark');
  const text = styles.getPropertyValue('--app-page-text').trim() || (isDark ? '#f9fafb' : '#111827');
  const muted = isDark ? '#9ca3af' : '#6b7280';
  const line = styles.getPropertyValue('--app-card-line').trim() || (isDark ? '#374151' : '#e5e7eb');
  const accent = styles.getPropertyValue('--app-accent').trim() || '#64748b';
  const handle = styles.getPropertyValue('--handle-bg').trim() || (isDark ? '#374151' : '#e5e7eb');

  return {
    isDark,
    coarsePointer: false,
    text,
    muted,
    line,
    accent,
    handle,
    tooltipBg: isDark ? '#1f2937' : '#ffffff',
    series: {
      time: '#10b981',
      ao5: '#3b82f6',
      ao12: '#f59e0b',
      bars: '#3b82f6',
      tps: '#ef4444',
      scatter: '#f97316',
    },
  };
}

export function baseChartOption(theme) {
  return {
    backgroundColor: 'transparent',
    textStyle: {
      color: theme.text,
      fontFamily: 'inherit',
    },
    animationDuration: 280,
    tooltip: {
      trigger: 'axis',
      backgroundColor: theme.tooltipBg,
      borderColor: theme.line,
      textStyle: { color: theme.text },
    },
    grid: {
      left: 12,
      right: 16,
      top: 36,
      bottom: theme.coarsePointer ? 84 : 72,
      containLabel: true,
    },
  };
}

export function axisStyle(theme) {
  return {
    axisLine: { lineStyle: { color: theme.line } },
    axisTick: { lineStyle: { color: theme.line } },
    axisLabel: { color: theme.muted, hideOverlap: true },
    splitLine: { lineStyle: { color: theme.line, opacity: 0.55 } },
    nameTextStyle: { color: theme.muted },
  };
}

export function dataZoomPair(theme, {
  start = 0,
  end = 100,
  filterMode = 'filter',
  coarsePointer = false,
} = {}) {
  const slider = {
      type: 'slider',
      xAxisIndex: 0,
      filterMode,
      height: coarsePointer ? 32 : 22,
      bottom: 8,
      brushSelect: false,
      realtime: true,
      start,
      end,
      borderColor: theme.line,
      fillerColor: `${theme.accent}33`,
      handleStyle: { color: theme.accent, borderColor: theme.accent },
      moveHandleStyle: { color: theme.accent },
      textStyle: { color: theme.muted },
      dataBackground: {
        lineStyle: { color: theme.muted },
        areaStyle: { color: `${theme.accent}22` },
      },
      selectedDataBackground: {
        lineStyle: { color: theme.accent },
        areaStyle: { color: `${theme.accent}44` },
      },
      handleSize: coarsePointer ? 28 : '120%',
      moveHandleSize: coarsePointer ? 10 : 7,
    };

  if (coarsePointer) {
    return [slider];
  }

  return [
    {
      type: 'inside',
      xAxisIndex: 0,
      filterMode,
      zoomOnMouseWheel: true,
      moveOnMouseMove: false,
      moveOnMouseWheel: false,
      preventDefaultMouseMove: false,
    },
    slider,
  ];
}
