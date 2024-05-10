import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    font-family: "Libre Franklin", sans-serif;
    font-optical-sizing: auto;
    font-weight: <weight>;
    font-style: normal;
    box-sizing: border-box;
    scrollbar-color: transparent;
  }

  body {
    margin: 0;
  }

  b {
    font-weight: 600;
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
