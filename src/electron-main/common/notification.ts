import { once } from 'common/electron-common/base/functional';
import { Notification } from 'electron';

export namespace ApplicationNotification {
  export const isSupported = () => Notification.isSupported();

  export function info(body: string, title = 'LiveMoe') {
    let notification: Notification | null = null;

    return once(() => {
      if (isSupported()) {
        notification = new Notification({
          body,
          title,
        });

        notification.show();

        setTimeout(() => notification?.close(), 2000);
      }

      return notification;
    })();
  }
}
