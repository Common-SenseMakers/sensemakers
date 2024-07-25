import { CSSProperties, ReactNode } from 'react';

export const EmailRow = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) => {
  const defaultStyle: CSSProperties = {
    margin: '16px',
    textAlign: 'center',
  };

  const combinedStyle = { ...defaultStyle, ...style };

  return (
    <table
      role="presentation"
      width="100%"
      style={{ borderCollapse: 'collapse' }}>
      <tr>
        <td style={combinedStyle}>
          <table role="presentation" style={{ margin: '0 auto' }}>
            <tr>
              <td>{children}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  );
};
