import { BarChart } from '@mui/x-charts/BarChart';

export const SolveReconstructionChart = ({ reconstruction, className }) => {
  const { method, steps } = reconstruction;

  const stepNames = Object.keys(steps).filter((step) => steps[step].found);
  const durations = stepNames.map((step) => (steps[step]?.endTime - steps[step]?.startTime) / 1000); // Convert to seconds

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
        height: 100,
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
    <div className={`bg-white/50 dark:bg-gray-800/50 rounded-b-lg shadow-md p-4 ${className}`}>
      <h3 className='text-2xl font-medium text-gray-900 dark:text-white'>Solve Step Analysis</h3>
      <div className='bg-gray-50/70 dark:bg-gray-900/70 rounded-b-lg mt-3'>
        <BarChart {...chartSetting} />
      </div>
    </div>
  );
};
