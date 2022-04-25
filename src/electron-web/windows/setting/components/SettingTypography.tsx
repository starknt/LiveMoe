import Typography, { type TypographyProps } from '@mui/material/Typography'

const SettingTypography: React.FC<TypographyProps> = ({
  children,
  ...props
}) => {
  return (
    <Typography sx={{ fontSize: '0.85rem', fontWeight: '550' }} {...props}>
      {children}
    </Typography>
  )
}

export default SettingTypography
