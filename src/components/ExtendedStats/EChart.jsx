import { useEffect, useRef } from 'react';

import echarts from 'src/components/ExtendedStats/echartsSetup.js';

const EChart = ({ option, height = 320, className = '' }) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const chart = echarts.init(container, null, { renderer: 'canvas' });
    chartRef.current = chart;
    const applyTouchPan = () => {
      container.style.touchAction = 'pan-y';
      if (chart.getZr()?.dom) {
        chart.getZr().dom.style.touchAction = 'pan-y';
      }
      container.querySelectorAll('canvas').forEach((surface) => {
        surface.style.touchAction = 'pan-y';
      });
    };
    applyTouchPan();

    const resize = () => chart.resize();
    window.addEventListener('resize', resize);
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => {
      window.removeEventListener('resize', resize);
      observer.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current || !option) return;
    chartRef.current.setOption(option, { notMerge: true, lazyUpdate: true });
  }, [option]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height, touchAction: 'pan-y' }}
    />
  );
};

export default EChart;
