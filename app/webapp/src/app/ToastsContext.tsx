import { Notification, NotificationProps } from 'grommet';
import { ReactNode, createContext, useContext, useState } from 'react';

export type NotificationDetails = Pick<
  NotificationProps,
  'title' | 'message' | 'status' | 'time'
>;

export type ToastsContextType = {
  show: (details: NotificationDetails) => void;
};

export interface ToastsContextProps {
  children: ReactNode;
}

const ToastsContextValue = createContext<ToastsContextType | undefined>(
  undefined
);

export const ToastsContext = ({ children }: ToastsContextProps) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [notification, setNotification] = useState<NotificationDetails>();

  const show = (value: NotificationDetails) => {
    setVisible(true);
    setNotification(value);
  };

  const clear = () => {
    setTimeout(() => {
      setVisible(false);
      setNotification(undefined);
    }, 500);
  };

  return (
    <ToastsContextValue.Provider value={{ show }}>
      {children}
      {visible && (
        <Notification
          toast
          onClose={clear}
          title={notification?.title}
          message={notification?.message}
          time={notification?.time || 2500}
          status={notification?.status}
        />
      )}
    </ToastsContextValue.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastsContextValue);
  if (!context) throw Error('loading context not found');
  return context;
};
