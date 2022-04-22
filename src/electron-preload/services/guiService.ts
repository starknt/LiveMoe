import { IChannel } from 'common/electron-common';
import { shell } from 'electron';
import { LiveMoe } from 'livemoe';

export default function createGuiService(
  channel: IChannel
): LiveMoe.GuiService {
  return {
    openFolder: async (path: string) => {
      try {
        // await stat(path);
        await shell.openPath(path);
        return true;
      } catch {
        return false;
      }
    },
  };
}
