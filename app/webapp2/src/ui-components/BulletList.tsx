import { ReactNode } from 'react';

export const BulletList = (props: { elements: ReactNode[] }) => {
  const liStyle: React.CSSProperties = { marginBottom: '12px' };

  return (
    <ul>
      {props.elements.map((e, ix) => {
        return (
          <li style={liStyle} key={ix}>
            {e}
          </li>
        );
      })}
    </ul>
  );
};
