import React from 'react';
import ReactDOM from 'react-dom';
import { Helmet } from 'react-helmet';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/core/styles';
import App from './App';
import theme from './theme';

const TITLE = 'Laser Protocol Designer'

ReactDOM.render(
  <ThemeProvider theme={theme}>
    {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
    <CssBaseline />
    <Helmet>
      <title>{ TITLE }</title>
    </Helmet>
    <App />
  </ThemeProvider>,
  document.querySelector('#root'),
);
