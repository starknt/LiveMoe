import { Typography, styled } from '@mui/material';

const TinyText = styled(Typography)(({ theme}) => ({
  fontSize: '0.85rem',
  opacity: theme.palette.mode === 'light' ? 0.8 : 0.45,
  fontWeight: 500,
  letterSpacing: 0.25,
}));

export default TinyText;
