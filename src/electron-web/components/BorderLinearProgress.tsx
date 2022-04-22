import { LinearProgress, linearProgressClasses, styled } from '@mui/material';

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  marginTop: theme.spacing(1),
  height: 2,
  borderRadius: 0,
  borderTopLeftRadius: 'inherit',
  borderTopRightRadius: 'inherit',
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor:
      theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 0,
    backgroundColor: theme.palette.mode === 'light' ? '#1a90ff' : '#308fe8',
  },
}));

export default BorderLinearProgress;
