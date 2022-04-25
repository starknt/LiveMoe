import HelpRoundedIcon from '@mui/icons-material/HelpRounded'
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import Checkbox, { type CheckboxProps } from '@mui/material/Checkbox'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

export interface SettingCheckboxProps extends CheckboxProps {
  help?: string | React.ReactNode
}

const SettingCheckbox: React.FC<SettingCheckboxProps> = ({
  children,
  ...props
}) => {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Checkbox
        {...props}
        className="non-draggable"
        icon={<RadioButtonUncheckedRoundedIcon />}
        checkedIcon={<CheckCircleOutlineRoundedIcon />}
      />
      <div>{children}</div>
      {props.help
        ? (
        <Tooltip followCursor title={props.help}>
          <IconButton
            sx={{
              'padding': 0,
              'position': 'absolute',
              'top': '6px',
              'right': 'calc( -0.75rem )',
              'display': 'inline-flex',
              'color': 'gray.700',
              'cursor': 'default',
              ':hover': {
                color: 'skyblue',
              },
              'fontSize': '0.85rem',
            }}
            className="non-draggable"
            disableFocusRipple
            disableRipple
          >
            <HelpRoundedIcon sx={{ fontSize: 'inherit' }} />
          </IconButton>
        </Tooltip>
          )
        : (
            ''
          )}
    </Box>
  )
}

export default SettingCheckbox
