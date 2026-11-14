import { formatTime } from 'src/utils/time.js';

import { axisStyle, baseChartOption, dataZoomPair } from './chartTheme.js';
import { defaultZoomWindow, parseSolveDate, rollingOfficialAverageSeconds } from './statsUtils.js';

function formatAxisTime(value) {
  return formatTime(value * 1000) || Number(value).toFixed(2);
}

export function buildProgressionOption({ solves, showAo5, showAo12, theme }) {
  const zoom = defaultZoomWindow(solves.length);
  const times = solves.map(solve => Number(solve.solveTimeSeconds.toFixed(3)));
  const ao5 = showAo5 ? rollingOfficialAverageSeconds(solves, 5) : [];
  const ao12 = showAo12 ? rollingOfficialAverageSeconds(solves, 12) : [];
  const xValues = solves.map((_, index) => index + 1);
  const seriesData = (values) => values.map((value, index) => [xValues[index], value]);

  return {
    ...baseChartOption(theme),
    legend: {
      top: 0,
      textStyle: { color: theme.text },
    },
    tooltip: {
      ...baseChartOption(theme).tooltip,
      formatter: (params) => {
        const items = Array.isArray(params) ? params : [params];
        const first = items[0];
        const solveIndex = first.dataIndex;
        const solve = solves[solveIndex];
        const date = parseSolveDate(solve);
        const title = `Solve #${solveIndex + 1}`;
        const lines = items
          .filter(item => item.data?.[1] != null)
          .map(item => `${item.marker}${item.seriesName}: ${formatAxisTime(item.data[1])}`);
        return [title, date ? date.toLocaleString() : null, ...lines].filter(Boolean).join('<br/>');
      },
    },
    dataZoom: dataZoomPair(theme, { ...zoom, coarsePointer: theme.coarsePointer }),
    xAxis: {
      type: 'value',
      name: 'Solve #',
      min: 1,
      max: solves.length,
      minInterval: 1,
      ...axisStyle(theme),
    },
    yAxis: {
      type: 'value',
      name: 'Time (s)',
      scale: true,
      ...axisStyle(theme),
      axisLabel: {
        ...axisStyle(theme).axisLabel,
        formatter: (value) => Number(value).toFixed(1),
      },
    },
    series: [
      {
        name: 'Single',
        type: 'line',
        showSymbol: solves.length <= 60,
        symbolSize: 6,
        sampling: 'lttb',
        data: seriesData(times),
        color: theme.series.time,
        areaStyle: { color: `${theme.series.time}22` },
        lineStyle: { width: 2 },
        markPoint: {
          data: [{ type: 'min', name: 'Best' }],
          label: { formatter: ({ value }) => formatAxisTime(value) },
        },
      },
      showAo5 && solves.length >= 5 ? {
        name: 'Ao5',
        type: 'line',
        showSymbol: false,
        connectNulls: false,
        data: seriesData(ao5),
        color: theme.series.ao5,
        lineStyle: { width: 2 },
      } : null,
      showAo12 && solves.length >= 12 ? {
        name: 'Ao12',
        type: 'line',
        showSymbol: false,
        connectNulls: false,
        data: seriesData(ao12),
        color: theme.series.ao12,
        lineStyle: { width: 2 },
      } : null,
    ].filter(Boolean),
  };
}

export function buildBarOption({ labels, counts, theme, color, yName = 'Solves' }) {
  return {
    ...baseChartOption(theme),
    grid: {
      ...baseChartOption(theme).grid,
      bottom: labels.length > 8 ? 88 : 64,
    },
    tooltip: {
      ...baseChartOption(theme).tooltip,
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    dataZoom: labels.length > 18 ? dataZoomPair(theme, { coarsePointer: theme.coarsePointer }) : undefined,
    xAxis: {
      type: 'category',
      data: labels,
      ...axisStyle(theme),
      axisLabel: {
        ...axisStyle(theme).axisLabel,
        rotate: labels.length > 6 ? 35 : 0,
      },
    },
    yAxis: {
      type: 'value',
      name: yName,
      minInterval: 1,
      ...axisStyle(theme),
    },
    series: [{
      type: 'bar',
      data: counts,
      color,
      barMaxWidth: 36,
      itemStyle: { borderRadius: [6, 6, 0, 0] },
    }],
  };
}

export function buildMethodPieOption({ data, theme }) {
  return {
    ...baseChartOption(theme),
    grid: undefined,
    tooltip: {
      trigger: 'item',
      backgroundColor: theme.tooltipBg,
      borderColor: theme.line,
      textStyle: { color: theme.text },
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 8,
      top: 'middle',
      textStyle: { color: theme.text },
    },
    series: [{
      type: 'pie',
      radius: ['38%', '68%'],
      center: ['38%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: theme.tooltipBg, borderWidth: 2 },
      label: { color: theme.text, formatter: '{d}%' },
      data,
    }],
  };
}

export function buildScatterOption({ points, theme }) {
  const zoom = defaultZoomWindow(points.length, 120);
  return {
    ...baseChartOption(theme),
    tooltip: {
      trigger: 'item',
      backgroundColor: theme.tooltipBg,
      borderColor: theme.line,
      textStyle: { color: theme.text },
      formatter: (param) => `Time: ${formatAxisTime(param.value[0])}<br/>TPS: ${param.value[1].toFixed(2)}`,
    },
    dataZoom: dataZoomPair(theme, { ...zoom, coarsePointer: theme.coarsePointer }),
    xAxis: {
      type: 'value',
      name: 'Solve time (s)',
      scale: true,
      ...axisStyle(theme),
      axisLabel: {
        ...axisStyle(theme).axisLabel,
        formatter: (value) => Number(value).toFixed(1),
      },
    },
    yAxis: {
      type: 'value',
      name: 'TPS',
      scale: true,
      ...axisStyle(theme),
    },
    series: [{
      type: 'scatter',
      data: points,
      symbolSize: points.length > 250 ? 6 : 8,
      color: theme.series.scatter,
      emphasis: { scale: 1.4 },
    }],
  };
}

export function buildStepMovesOption({ steps, theme }) {
  const dataset = [...steps].sort((a, b) => b.avgMoves - a.avgMoves).slice(0, 16);
  return {
    ...baseChartOption(theme),
    grid: {
      left: 8,
      right: 24,
      top: 16,
      bottom: 24,
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: theme.tooltipBg,
      borderColor: theme.line,
      textStyle: { color: theme.text },
      axisPointer: { type: 'shadow' },
    },
    xAxis: {
      type: 'value',
      name: 'Avg moves',
      ...axisStyle(theme),
    },
    yAxis: {
      type: 'category',
      data: dataset.map(step => step.name),
      inverse: true,
      ...axisStyle(theme),
    },
    series: [{
      type: 'bar',
      data: dataset.map(step => Number(step.avgMoves.toFixed(1))),
      color: '#8b5cf6',
      barMaxWidth: 22,
      itemStyle: { borderRadius: [0, 6, 6, 0] },
    }],
  };
}
