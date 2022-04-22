import LocalGroceryStoreRoundedIcon from '@mui/icons-material/LocalGroceryStoreRounded';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import SettingsApplicationsRoundedIcon from '@mui/icons-material/SettingsApplicationsRounded';
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import DesktopWindowsRoundedIcon from '@mui/icons-material/DesktopWindowsRounded';
import DesktopAccessDisabledRoundedIcon from '@mui/icons-material/DesktopAccessDisabledRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import SportsEsportsRoundedIcon from '@mui/icons-material/SportsEsportsRounded';
import { useCallback } from 'react';
import {
  Divider,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { generateUuid } from 'common/electron-common/base/uuid';
import React from 'react';
import { PlayRuntimeConfiguration } from 'common/electron-common/wallpaperPlayer';

export interface MenuItem {
  accelerator?: string;
  type?: 'divider' | 'item';
  icon?: JSX.Element;
  tooltip?: string;
  click?: () => void;
  text?: string;
  submenu?: MenuItem[];
  disabled?: boolean;
}

export type Menu = MenuItem[];

export function hookMenuItemClick(menu: Menu, handler: () => void) {
  return menu.map((item) => {
    if (item.submenu) {
      item.submenu = hookMenuItemClick(item.submenu, handler);
    } else {
      const click = item.click;
      if (click) {
        item.click = () => {
          handler();
          click();
        };
      }
    }

    return item;
  });
}

function handleUpdate(
  prev: Readonly<
    React.PropsWithChildren<Props & { children?: React.ReactNode }>
  >,
  next: Readonly<
    React.PropsWithChildren<Props & { children?: React.ReactNode }>
  >
) {
  const pConfiguration = prev.configuration;
  const nConfiguration = next.configuration;

  return (
    pConfiguration.status === nConfiguration.status &&
    pConfiguration.mute === nConfiguration.mute &&
    pConfiguration.disabled === nConfiguration.disabled
  );
}

interface Props {
  configuration: PlayRuntimeConfiguration;
}

const TrayMenu: React.FC<Props> = React.memo(({ configuration }) => {
  const renderMenuConfiguration = useCallback(() => {
    const trayMenu: Menu = [
      {
        text: '显示商店界面',
        icon: <LocalGroceryStoreRoundedIcon />,
        click: () => {
          livemoe.windowsService.toggleWindow('main');
        },
      },
      {
        text: '显示设置界面',
        icon: <SettingsApplicationsRoundedIcon />,
        click: () => {
          livemoe.windowsService.toggleWindow('setting');
        },
      },
      {
        text: 'MiniPlayer',
        icon: <SportsEsportsRoundedIcon />,
        click: () => {
          livemoe.windowsService.toggleWindow('player');
        },
      },
      {
        type: 'divider',
      },
      {
        text: configuration.status === 'playing' ? '暂停' : '播放',
        icon:
          configuration.status === 'playing' ? (
            <PauseRoundedIcon />
          ) : (
            <PlayArrowRoundedIcon />
          ),
        click: () => {
          if (configuration.status === 'playing') {
            livemoe.wallpaperPlayerService.pause();
          } else {
            livemoe.wallpaperPlayerService.play();
          }
        },
        disabled: configuration.disabled,
      },
      {
        text: '播放上一张壁纸',
        icon: <SkipPreviousRoundedIcon />,
        click: () => {
          livemoe.wallpaperPlayerService.prev();
        },
        disabled: configuration.disabled,
      },
      {
        text: '播放下一张壁纸',
        icon: <SkipNextRoundedIcon />,
        click: () => {
          livemoe.wallpaperPlayerService.next();
        },
        disabled: configuration.disabled,
      },
      {
        text: configuration.mute ? '开启声音' : '关闭声音',
        icon: configuration.mute ? (
          <VolumeUpRoundedIcon />
        ) : (
          <VolumeOffRoundedIcon />
        ),
        click: () => {
          if (configuration.mute) {
            livemoe.wallpaperPlayerService.sound();
          } else {
            livemoe.wallpaperPlayerService.mute();
          }
        },
        disabled: configuration.disabled,
      },
      {
        text: configuration.disabled ? '开启桌面壁纸' : '关闭桌面壁纸',
        icon: configuration.disabled ? (
          <DesktopWindowsRoundedIcon />
        ) : (
          <DesktopAccessDisabledRoundedIcon />
        ),
        click: () => {
          if (configuration.disabled) {
            livemoe.wallpaperPlayerService.enable();
          } else {
            livemoe.wallpaperPlayerService.disable();
          }
        },
      },
      {
        type: 'divider',
      },
      {
        text: '退出',
        icon: <ExitToAppRoundedIcon />,
        click: () => {
          livemoe.applicationService.quit();
        },
      },
    ];

    return hookMenuItemClick(trayMenu, () => {
      livemoe.trayService.hide();
    });
  }, [configuration]);

  const renderMenu = useCallback((menu: Menu) => {
    return menu.map((item) => {
      return item.type === 'divider' ? (
        <Divider key={generateUuid()} />
      ) : (
        <Tooltip key={generateUuid()} title={item.tooltip ?? ''}>
          <MenuItem
            onClick={() => {
              item.click?.();
            }}
            disabled={item.disabled}
          >
            {item.icon ? <ListItemIcon>{item.icon}</ListItemIcon> : ''}
            <ListItemText>{item.text}</ListItemText>
            <Typography variant="body2" color="text.secondary">
              {item.accelerator}
            </Typography>
          </MenuItem>
        </Tooltip>
      );
    });
  }, []);

  return <>{renderMenu(renderMenuConfiguration())}</>;
}, handleUpdate);

export default TrayMenu;
