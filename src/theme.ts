import { Fira_Sans } from '@next/font/google';
import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

export const firaSans = Fira_Sans({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  fallback: ['Helvetica', 'Arial', 'sans-serif'],
});

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: '#rgba(0, 0, 0, 0.6)',
    },
    secondary: {
      main: '#F1F6F7',
    },
    error: {
      main: red.A400,
    },
  },
  typography: {
    fontFamily: firaSans.style.fontFamily,
  },
});

export default theme;
