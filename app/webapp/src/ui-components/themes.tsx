import { ThemeType, dark, grommet } from 'grommet/themes';
import { deepMerge } from 'grommet/utils';
import { css } from 'styled-components';

export const theme = {};

interface FontStyle {
  size: string;
  height: string;
}

export interface StyleConstants {
  fontSize: {
    large: FontStyle;
    medium: FontStyle;
    small: FontStyle;
    xsmall: FontStyle;
  };
  colors: {
    primary: string;
    textLight: string;
    shade: string;
    links: string;
    text: string;
    textOnPrimary: string;
    border: string;
    checkboxes: string;
  };
}

export interface ExtendedThemeType extends ThemeType {
  constants: StyleConstants;
}

const constants: StyleConstants = {
  fontSize: {
    large: {
      size: '18px',
      height: '24px',
    },
    medium: {
      size: '16px',
      height: '24px',
    },
    small: {
      size: '14px',
      height: '18px',
    },
    xsmall: {
      size: '12px',
      height: '14px',
    },
  },
  colors: {
    primary: '#111827',
    textLight: '#4B5563',
    shade: '#F9FAFB',
    text: '#111827',
    links: '#3182CE',
    textOnPrimary: '#ffffff',
    border: '#D1D5DB',
    checkboxes: '#337FBD',
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
      size: constants.fontSize.medium.size,
    },
    input: {
      font: {
        size: constants.fontSize.small.size,
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
    edgeSize: {
      large: '40px',
      medium: '16px',
      small: '12px',
      xsmall: '8px',
    },
  },
  heading: {
    level: {
      1: {
        font: {
          weight: '600',
        },
        medium: {
          size: '28px',
          height: '36px',
        },
      },
      2: {
        medium: {
          size: '22px',
          height: '28px',
        },
      },
      3: {
        medium: {
          size: '18px',
          height: '24px',
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
  paragraph: {
    small: {
      size: '14px',
      height: '18px',
      maxWidth: 'auto',
    },
    medium: {
      size: '16px',
      height: '24px',
      maxWidth: 'auto',
    },
  },
  button: {
    padding: { vertical: '15px', horizontal: '30px' },
    border: {
      radius: '8px',
    },
    primary: {
      color: constants.colors.primary,
      extend: css`
        & {
          color: #ffffff;
          font-weight: 500;
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
      size: constants.fontSize.small.size,
      margin: '0px 0px 8px 0px',
    },
    border: false,
  },
  fileInput: {
    message: {
      size: constants.fontSize.small.size,
    },
  },
  select: {
    icons: {
      down: <></>,
    },
    control: {
      extend: css`
        & {
          border-style: none;
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
    color: constants.colors.textOnPrimary,
    size: '18px',
    icon: {
      size: '16px',
    },
    border: {
      width: '0px',
    },
    toggle: {
      color: constants.colors.textOnPrimary,
    },
    check: {
      extend: css`
        background-color: ${constants.colors.checkboxes};
      `,
    },
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
      font-size: ${constants.fontSize.small.size};
    `,
  },
};

export const lightTheme = deepMerge(grommet, extension);
export const darkTheme = deepMerge(dark, extension);
