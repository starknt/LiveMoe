import {
  Box,
  Button,
  createTheme,
  PaletteMode,
  Paper,
  styled,
} from '@mui/material';
import { ThemeProvider } from '@mui/system';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import useLocalStorageState from 'electron-web/hooks/useLocalStorageState';
import SettingWidget from './SettingWidget';
import { useCallback, useEffect } from 'react';
import { useAppDispatch } from 'electron-web/store/store';
import {
  initalizeApplicationState,
  updateConfigurationAll,
} from 'electron-web/features/applicationSlice';
import {
  initalizePlayerState,
  updateConfigurationAll as updatePlayerConfigurationAll,
} from 'electron-web/features/playerSlice';
import useAsyncEffect from 'electron-web/hooks/useAsyncEffect';

const SettingPaper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '8px',
  backgroundImage:
    theme.palette.mode === 'light'
      ? 'linear-gradient(to bottom, #f5f5f5, #f5f5f5)'
      : 'linear-gradient(to bottom, #303030, #303030)',
}));

export default function Setting() {
  const dispatch = useAppDispatch();
  const [themeValue, setThemeValue] = useLocalStorageState<PaletteMode>(
    'theme',
    'light',
    true
  );

  const theme = createTheme({
    palette: {
      mode: themeValue ?? 'light',
    },
  });

  useEffect(() => {
    dispatch(initalizeApplicationState());
    dispatch(initalizePlayerState());
  }, []);

  useAsyncEffect(async () => {
    if (!window.livemoe) return;

    const onApplicationConfigChange =
      await window.livemoe.applicationService.onConfigChange();

    const onPlayerConfigChange =
      await window.livemoe.wallpaperPlayerService.onConfigChange();

    onApplicationConfigChange((config) => {
      dispatch(updateConfigurationAll(config));
    });

    onPlayerConfigChange((config) => {
      console.log('onPlayerConfigChange', config);

      dispatch(updatePlayerConfigurationAll(config));
    });
  }, [window.livemoe]);

  const mainIconColor = theme.palette.mode === 'dark' ? '#fff' : '#000';
  const lightIconColor =
    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

  const handleThemeModeChange = useCallback(() => {
    if (themeValue === 'light') {
      setThemeValue('dark');
    } else {
      setThemeValue('light');
    }
  }, [themeValue]);

  const handleCloseWindow = useCallback(() => {
    window.livemoe.windowsService.toggleWindow('setting');
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <SettingPaper style={{ height: '100%' }}>
        <SettingWidget />
        <Box sx={{ position: 'absolute', top: '3px', right: '28px' }}>
          <Button
            onClick={handleThemeModeChange}
            className="non-draggable"
            disableFocusRipple
            disableRipple
            disableElevation
            sx={{
              minWidth: '24px',
              padding: 0,
              color: lightIconColor,
              ':hover': {
                color: mainIconColor,
                backgroundColor: 'transparent',
              },
              zIndex: 9999,
            }}
          >
            {themeValue === 'light' ? (
              <DarkModeOutlinedIcon viewBox="0 0 28 28" />
            ) : (
              <LightModeOutlinedIcon viewBox="0 0 28 28" />
            )}
          </Button>
        </Box>
        <Box sx={{ position: 'absolute', top: '0px', right: '4px' }}>
          <Button
            onClick={handleCloseWindow}
            className="non-draggable"
            disableFocusRipple
            disableRipple
            sx={{
              minWidth: '24px',
              color: lightIconColor,
              padding: 0,
              ':hover': {
                color: mainIconColor,
                backgroundColor: 'transparent',
              },
              zIndex: 9999,
            }}
          >
            <CloseOutlinedIcon />
          </Button>
        </Box>
      </SettingPaper>
    </ThemeProvider>
  );
}
