import { DarkTheme } from '@react-navigation/native';

const MainTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#BB86FC',
    background: '#121212',
    card: '#7c4e9c',
    text: '#FFFFFF',
    border: '#272727',
    notification: '#CF6679',
  },
};

export default MainTheme;
