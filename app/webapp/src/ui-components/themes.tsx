import { ThemeType, dark, grommet } from 'grommet/themes';
import { deepMerge } from 'grommet/utils';
import { css } from 'styled-components';

export const theme = {};

export interface StyleConstants {
  headingFontSizes: {
    1: string;
    2: string;
    3: string;
    4: string;
  };
  textFontSizes: {
    large: string;
    medium: string;
    normal: string;
    small: string;
    xsmall: string;
  };
  colors: {
    primary: string;
    primaryLight: string;
    text: string;
    textOnPrimary: string;
    lightTextOnLight: string;
    headings: string;
    backgroundLight: string;
    backgroundLightShade: string;
    backgroundLightDarker: string;
    border: string;
    links: string;
    tagsBackground: string;
    tagsText: string;
  };
}

export interface ExtendedThemeType extends ThemeType {
  constants: StyleConstants;
}

const constants: StyleConstants = {
  headingFontSizes: {
    1: '36px',
    2: '28px',
    3: '22px',
    4: '22px',
  },
  textFontSizes: {
    large: '32px',
    medium: '26px',
    normal: '22px',
    small: '18px',
    xsmall: '14px',
  },
  colors: {
    primary: '#506fa3',
    primaryLight: '#606060',
    text: '#20365f',
    textOnPrimary: '#ffffff',
    lightTextOnLight: '#949494',
    border: '#333333',
    headings: '#1a1a1a',
    backgroundLight: '#f7f7f7',
    backgroundLightShade: '#ececec',
    backgroundLightDarker: '#cacaca',
    links: '#004766',
    tagsBackground: '#88a8de',
    tagsText: '#ffffff',
  },
};

const extension: ExtendedThemeType = {
  constants,
  global: {
    colors: {
      brand: constants.colors.primary,
      brandLight: constants.colors.primaryLight,
      text: constants.colors.text,
    },
    font: {
      size: constants.textFontSizes.normal,
    },
    input: {
      font: {
        size: constants.textFontSizes.small,
      },
    },
    breakpoints: {
      xsmall: {
        value: 700,
      },
      small: {
        value: 900,
      },
      medium: {
        value: 1400,
      },
      large: {},
    },
    focus: {
      border: {
        color: 'transparent', // Makes the border transparent
      },
      shadow: 'none',
    },
  },
  heading: {
    level: {
      1: {
        medium: {
          size: constants.headingFontSizes[1],
        },
      },
      2: {
        medium: {
          size: constants.headingFontSizes[2],
        },
      },
      3: {
        medium: {
          size: constants.headingFontSizes[3],
        },
      },
    },
    responsiveBreakpoint: undefined,
  },
  button: {
    padding: { vertical: '15px', horizontal: '30px' },
    border: {
      radius: '4px',
    },
    primary: {
      color: constants.colors.primary,
      extend: css`
        & {
          color: #ffffff;
          font-weight: 800;
        }
      `,
    },
    secondary: {
      extend: css`
        & {
          font-weight: 500;
        }
      `,
    },
  },
  formField: {
    checkBox: {
      pad: 'small',
    },
    label: {
      weight: 700,
      size: constants.textFontSizes.small,
      margin: '0px 0px 8px 0px',
    },
    border: false,
  },
  fileInput: {
    message: {
      size: constants.textFontSizes.small,
    },
  },
  select: {
    control: {
      extend: css`
        & {
          border-style: none;
        }
      `,
    },
  },
  textArea: {
    extend: () => {
      return css`
        * {
          padding: 14px 36px;
          border-width: 1px;
          border-style: solid;
          border-color: #8b7d7d;
          border-radius: 24px;
        }
      `;
    },
  },
  textInput: {
    container: {
      extend: () => {
        return css`
          * {
            padding: 14px 36px;
            border-width: 1px;
            border-style: solid;
            border-color: #8b7d7d;
            border-radius: 24px;
          }
        `;
      },
    },
  },
  checkBox: {
    color: constants.colors.primary,
  },
  table: {
    header: {
      extend: css`
        & {
          border: none;
        }
      `,
    },
  },
  tip: {
    content: {
      background: '#FFFFFF',
    },
  },
  accordion: {
    icons: {
      color: constants.colors.primaryLight,
    },
    border: false,
    panel: {
      border: false,
    },
  },
  anchor: {
    color: constants.colors.links,
    textDecoration: 'underline',
    extend: css`
      font-size: ${constants.textFontSizes.small};
    `,
  },
};

export const lightTheme = deepMerge(grommet, extension);
export const darkTheme = deepMerge(dark, extension);
