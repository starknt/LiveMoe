import { initalizeApplicationState } from 'electron-web/features/applicationSlice';
import {
  initalizePlayerState,
  updateConfigurationAll,
} from 'electron-web/features/playerSlice';
import { useAppDispatch } from 'electron-web/store/store';
import Routers from './router';
import { useRoutes } from 'react-router';
import useOnceEffect from 'electron-web/hooks/useOnceEffect';
import { createTheme, PaletteMode, ThemeProvider } from '@mui/material';
import { useMemo } from 'react';
import useLocalStorageState from 'electron-web/hooks/useLocalStorageState';
import './App.css';
import useAsyncEffect from 'electron-web/hooks/useAsyncEffect';

export default function App() {
  const [themeValue] = useLocalStorageState<PaletteMode>(
    'theme',
    'light',
    true
  );
  const dispatch = useAppDispatch();

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeValue ?? 'light',
        },
      }),
    [themeValue]
  );

  const rendererRouter = useRoutes(Routers);

  useOnceEffect(() => {
    dispatch(initalizePlayerState());
    dispatch(initalizeApplicationState());
  });

  useAsyncEffect(async () => {
    if (!window.livemoe) return;

    const onPlayerStateChange =
      await window.livemoe.wallpaperPlayerService.onConfigChange();

    onPlayerStateChange((config) => {
      dispatch(updateConfigurationAll(config));
    });
  }, [window.livemoe]);

  return <ThemeProvider theme={theme}>{rendererRouter}</ThemeProvider>;
}
