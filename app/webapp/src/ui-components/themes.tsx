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
    textLight: string;
    header: string;
    shade: string;
    links: string;
    text: string;
    textOnPrimary: string;
    border: string;
  };
}

export interface ExtendedThemeType extends ThemeType {
  constants: StyleConstants;
}

const constants: StyleConstants = {
  headingFontSizes: {
    1: '28px',
    2: '24px',
    3: '20px',
    4: '18px',
  },
  textFontSizes: {
    large: '24px',
    medium: '18px',
    normal: '16px',
    small: '18px',
    xsmall: '14px',
  },
  colors: {
    primary: '#111827',
    textLight: '#4B5563',
    header: '#F9FAFB',
    shade: '#D1D5DB',
    text: '#111827',
    links: '#3182CE',
    textOnPrimary: '#ffffff',
    border: '#D1D5DB',
  },
};

const extension: ExtendedThemeType = {
  constants,
  global: {
    colors: {
      brand: constants.colors.primary,
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
    extend: css`
      font-style: normal;
      font-weight: 600;
      letter-spacing: -0.4px;
    `,
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
          font-size: 14px;
          font-style: normal;
          font-weight: 500;
          line-height: 16px; /* 114.286% */
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
      color: constants.colors.primary,
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
  paragraph: {
    medium: {
      size: constants.textFontSizes.normal,
    },
    extend: css`
      margin: 0px 0px 24px 0px;
      line-height: 24px; /* 150% */
    `,
  },
};

export const lightTheme = deepMerge(grommet, extension);
export const darkTheme = deepMerge(dark, extension);
