import React from 'react';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import { Box, Link } from '@mui/material';
import { useAppStore } from 'electron-web/store/store';
import TinyText from 'electron-web/components/TinyText';
import GitHubIcon from '@mui/icons-material/GitHub';
import './about.css';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
}

const BootstrapDialogTitle = (props: DialogTitleProps) => {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};

interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
}

const About: React.FC<AboutDialogProps> = ({ open, onClose }) => {
  const application = useAppStore().applicationConfiguration.application;

  return (
    <div>
      <BootstrapDialog aria-labelledby="customized-dialog-title" open={open}>
        <BootstrapDialogTitle onClose={onClose} id="customized-dialog-title">
          <Typography
            sx={{ textAlign: 'center', padding: '4px 56px' }}
            variant="h6"
          >
            关于本软件
          </Typography>
        </BootstrapDialogTitle>
        <DialogContent dividers>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ width: 64, height: 64 }}>
              <div className="app-icon"></div>
            </Box>
            <Box
              sx={{
                marginTop: '2rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <TinyText>{`${application.name}`}</TinyText>
                <TinyText>{`软件概述: `}</TinyText>
                <TinyText>{`electron: `}</TinyText>
                <TinyText>{`chromium: `}</TinyText>
                <TinyText>{`nodejs: `}</TinyText>
                <TinyText>{`v8: `}</TinyText>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <TinyText>{`v${application.version.app}`}</TinyText>
                <TinyText
                  noWrap
                >{`LiveMoe 是一款基于 Electron 的免费开源桌面壁纸播放器`}</TinyText>
                <TinyText>{`v ${application.version.electron}`}</TinyText>
                <TinyText>{`v ${application.version.chrome}`}</TinyText>
                <TinyText>{`v ${application.version.node}`}</TinyText>
                <TinyText>{`v ${application.version.v8}`}</TinyText>
              </Box>
            </Box>
            <Box sx={{ mt: '1rem', verticalAlign: 'middle' }}>
              <TinyText
                sx={{
                  display: 'flex',
                  gap: '0.25rem',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                Copyright © 2022{' '}
                <Link
                  target="_blank"
                  rel="noreferrer"
                  href="https://github.com/SEVEN-1-bit"
                >
                  Seven
                </Link>
              </TinyText>
              <TinyText
                sx={{
                  display: 'flex',
                  gap: '0.25rem',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <GitHubIcon fontSize="small" />
                Github 仓库地址:{' '}
                <Link
                  target="_blank"
                  rel="noreferrer"
                  href="https://github.com/SEVEN-1-bit/LiveMoe"
                >
                  https://github.com/SEVEN-1-bit/LiveMoe
                </Link>
              </TinyText>
            </Box>
          </Box>
        </DialogContent>
      </BootstrapDialog>
    </div>
  );
};

export default About;
