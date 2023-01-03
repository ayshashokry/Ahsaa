import { notification } from 'antd'

export const notificationMessage = (message, duration=3) => {
    const args = {
      description: message,
      duration: duration,
    };
    notification.open(args);
  };