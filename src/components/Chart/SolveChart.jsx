import { BarChart } from '@mui/x-charts/BarChart';
import { useSettings } from 'src/hooks/useSettings.js';

export const SolveReconstructionChart = ({ reconstruction }) => {
  const { settings } = useSettings();

  if (!reconstruction || !reconstruction.steps) return null;

  const { method, steps } = reconstruction;

  const stepNames = Object.keys(steps).filter(step => steps[step].found);
  const durations = stepNames.map(step => steps[step].duration / 1000); // Convert to seconds

  const textColor = settings['theme'] === 'dark' ? 'white' : 'black';

  const chartSetting = {
    legend:
      {
        labelStyle: {
          fill: textColor,
        },
      },
    xAxis: [
      {
        label: `Solve Steps (${method})`,
        scaleType: 'band',
        data: stepNames,
        labelStyle: {
          fill: textColor,
        },
        tickLabelStyle: {
          fill: textColor,
        },
        colorMap: {
          type: 'ordinal',
          colors: ['#2266ff', '#44ee00', '#ff8000', '#ff0000', '#f4f400']
        }
      },
    ],
    yAxis: [
      {
        label: 'Duration (seconds)',
        labelStyle: {
          fill: textColor,
        },
        tickLabelStyle: {
          fill: textColor,
        },
      },
    ],
    series: [
      {
        data: durations,
        // label: 'Time (s)',
        labelStyle: {
          fill: textColor,
        },
        color: '#dc2626',
      },
    ],
    height: 300,
    borderRadius: 10
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg mt-3">
      <BarChart

        {...chartSetting}
      />
    </div>
  );
};
