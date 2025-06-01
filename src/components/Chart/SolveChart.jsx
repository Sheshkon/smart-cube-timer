import { BarChart } from '@mui/x-charts/BarChart';
import { useSettings } from 'src/hooks/useSettings.js';

export const SolveReconstructionChart = ({ reconstruction }) => {
  const { settings } = useSettings();

  if (!reconstruction || !reconstruction.steps) return null;

  const { method, steps } = reconstruction;

  const stepNames = Object.keys(steps).filter(step => steps[step].found);
  const durations = stepNames.map(step => (steps[step]?.endTime - steps[step]?.startTime) / 1000); // Convert to seconds


  const chartSetting = {
    xAxis: [
      {
        label: `Solve Steps (${method})`,
        scaleType: 'band',
        data: stepNames,
        labelStyle: {
          fontSize: 12,
        },
        tickLabelStyle: {
          angle: 45,
          textAnchor: 'start',
          fontSize: 9,
        },
        colorMap: {
          type: 'ordinal',
          colors: ['#2266ff', '#44ee00', '#ff8000', '#ff0000', '#f4f400'],
        },
        height: 100
      },
    ],
    yAxis: [
      {
        label: 'Duration (seconds)',
        labelStyle: {
          fontSize: 12,
        },
      },
    ],
    series: [
      {
        data: durations,
        label: 'Time (s)',
        color: 'transparent',
      },
    ],
    height: 350,
    borderRadius: 10,
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg mt-3">
      <BarChart
        {...chartSetting}
      />
    </div>
  );
};
