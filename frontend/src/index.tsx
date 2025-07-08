import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import { deepPurple, teal, grey } from '@mui/material/colors';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: deepPurple[600],
    },
    secondary: {
      main: teal[400],
    },
    background: {
      default: grey[50],
      paper: '#fff',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    fontSize: 17,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontSize: '2.8rem',
      fontWeight: 700,
      lineHeight: 1.15,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2.2rem',
      fontWeight: 700,
      lineHeight: 1.18,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.7rem',
      fontWeight: 700,
      lineHeight: 1.22,
    },
    h4: {
      fontSize: '1.35rem',
      fontWeight: 700,
      lineHeight: 1.25,
    },
    h5: {
      fontSize: '1.15rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.35,
    },
    button: {
      fontWeight: 600,
      fontSize: '1rem',
      letterSpacing: 0,
      textTransform: 'none',
    },
    body1: {
      fontSize: '1.06rem',
      lineHeight: 1.7,
    },
    body2: {
      fontSize: '0.98rem',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 24px 0 rgba(80,80,120,0.08)',
          borderRadius: 18,
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

if (process.env.NODE_ENV === 'development') {
  const { worker } = require('./mocks/browser');
  worker.start().then(() => {
    root.render(
      <React.StrictMode>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ThemeProvider>
        </I18nextProvider>
      </React.StrictMode>
    );
  });
} else {
  root.render(
    <React.StrictMode>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </I18nextProvider>
    </React.StrictMode>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
