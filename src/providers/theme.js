import { createTheme } from '@mui/material/styles';

const chartOverrides = {
  components: {
    MuiChartsSurface: {
      styleOverrides: {
        root: {
          '&&': {
            touchAction: 'pan-x pan-y pinch-zoom', // Enable both pan and zoom
          },
        },
      },
    },
    MuiCharts: {
      styleOverrides: {
        root: {
          overflow: 'visible',
        },
      },
      defaultProps: {
        slotProps: {
          chart: {
            interaction: {
              axis: 'xy', // Enable both x and y axis interaction
              mode: ['pan', 'zoom'], // Enable both pan and zoom
            },
          },
          xAxis: {
            disableLine: false,
            disableTicks: false,
          },
          yAxis: {
            disableLine: false,
            disableTicks: false,
          },
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    chart: {
      line: '#1976d2',
      area: 'rgba(25, 118, 210, 0.1)',
      bar: '#1976d2',
      zoomBand: 'rgba(25, 118, 210, 0.3)', // Zoom selection color
    },
  },
  ...chartOverrides,
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#ce93d8',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    chart: {
      line: '#90caf9',
      area: 'rgba(144, 202, 249, 0.1)',
      bar: '#90caf9',
      zoomBand: 'rgba(144, 202, 249, 0.3)', // Zoom selection color
    },
  },
  ...chartOverrides,
});