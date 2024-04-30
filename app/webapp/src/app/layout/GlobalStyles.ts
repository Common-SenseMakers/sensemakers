import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    font-family: 'DM Sans', sans-serif;
    font-family: 'M PLUS Rounded 1c', sans-serif;
    scrollbar-color: transparent;
  }

  body {
    margin: 0;
  }

  ::-webkit-scrollbar {
    width: 5px; /* Mostly for vertical scrollbars */
    height: 5px; /* Mostly for horizontal scrollbars */
  }
  ::-webkit-scrollbar-thumb { /* Foreground */
    border-radius: 10px;  
    background: #3333337d;
    
  }
  ::-webkit-scrollbar-track { /* Background */
    background: #ffffff00;
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0px 0px;
  }
`;
