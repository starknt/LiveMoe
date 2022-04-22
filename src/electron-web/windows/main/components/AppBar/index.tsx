import React, { useCallback, useState } from 'react';
import {
  Skeleton,
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Button,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import MinimizeRoundedIcon from '@mui/icons-material/MinimizeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SettingsApplicationsRoundedIcon from '@mui/icons-material/SettingsApplicationsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import { useNavigate } from 'react-router-dom';
import About from '../about';
import './index.css';

const pages = ['主页', '壁纸', '组件'];
const settings = ['个人信息', '消息', '退出登录'];

export default React.forwardRef((_, ref) => {
  const navgation = useNavigate();

  const [aboutOpen, setAboutOpen] = useState(false);

  const [anchorElMenu, setAnchorElMenu] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleOpenAppMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElMenu(event.currentTarget);
  };

  const handleCloseAppMenu = () => {
    setAnchorElMenu(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleNavigate = () => {
    navgation('wallpaper');
  };

  const handleMinimize = useCallback(() => {
    window.livemoe.windowsService.sendWindowMessage('main', 'min');
  }, []);

  const handleClose = useCallback(() => {
    window.livemoe.windowsService.sendWindowMessage('main', 'hide');
  }, []);

  const handleToggleSetting = useCallback(() => {
    window.livemoe.windowsService.toggleWindow('setting');
    handleCloseAppMenu();
  }, []);

  const handleToggleAbout = useCallback(() => {
    handleCloseAppMenu();
    setAboutOpen(true);
  }, []);

  return (
    <AppBar
      ref={ref}
      position="fixed"
      color="secondary"
      className="draggable app-bar"
    >
      <Container style={{ paddingRight: 0 }} sx={{ gap: 1 }} maxWidth="xl">
        <Toolbar style={{ paddingRight: 6 }}>
          <Box sx={{ flexGrow: 1 }}></Box>
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: 'none', md: 'flex' },
              paddingRight: 0,
            }}
          >
            {pages.map((page) => (
              <Button
                onClick={handleNavigate}
                className="non-draggable"
                key={page}
                sx={{
                  my: 2,
                  display: 'block',
                }}
              >
                {page}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <IconButton
              className="non-draggable"
              onClick={handleOpenUserMenu}
              sx={{ p: 0 }}
            >
              <Skeleton variant="circular" width={40} height={40} />
            </IconButton>
            <Menu
              sx={{ mt: '45px' }}
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Box className="flex" sx={{ flexGrow: 0, mx: 1 }}>
            <IconButton
              className="non-draggable"
              size="large"
              onClick={handleOpenAppMenu}
              sx={{ p: 1 }}
            >
              <MenuRoundedIcon />
            </IconButton>
            <Menu
              sx={{ mt: '45px' }}
              anchorEl={anchorElMenu}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElMenu)}
              onClose={handleCloseAppMenu}
            >
              <MenuItem onClick={handleToggleSetting}>
                <ListItemIcon>
                  <SettingsApplicationsRoundedIcon />
                </ListItemIcon>
                <ListItemText>
                  <Typography textAlign="center">设置</Typography>
                </ListItemText>
              </MenuItem>
              <MenuItem onClick={handleToggleAbout}>
                <ListItemIcon>
                  <InfoRoundedIcon />
                </ListItemIcon>
                <ListItemText>
                  <Typography textAlign="center">关于</Typography>
                </ListItemText>
              </MenuItem>
            </Menu>
          </Box>

          <Box sx={{ flexGrow: 0, mx: 1 }}>
            <IconButton
              onClick={handleMinimize}
              sx={{
                p: 1,
                ':hover': {
                  color: 'skyblue',
                },
              }}
              disableRipple
              disableFocusRipple
              className="non-draggable"
              size="large"
            >
              <MinimizeRoundedIcon viewBox="0 7 24 24" />
            </IconButton>
            <IconButton
              onClick={handleClose}
              sx={{
                p: 1,
                ':hover': {
                  color: 'skyblue',
                },
              }}
              disableRipple
              disableFocusRipple
              className="non-draggable"
              size="large"
            >
              <CloseRoundedIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
      <About open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </AppBar>
  );
});
