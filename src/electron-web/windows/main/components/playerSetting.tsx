import type { SelectChangeEvent } from '@mui/material'
import { Box, FormControl, FormControlLabel, FormLabel, MenuItem, Radio, RadioGroup, Select } from '@mui/material'
import DialogContent from '@mui/material/DialogContent'
import Typography from '@mui/material/Typography'
import type { IWallpaperPlayerMode } from 'common/electron-common/wallpaperPlayer'
import { BootstrapDialog } from 'electron-web/components/BootstrapDialog'
import { BootstrapDialogTitle } from 'electron-web/components/BootstrapDialogTitle'
import { selectPlayerConfiguration } from 'electron-web/features/playerSlice'
import { PlayerSettingIcon } from 'electron-web/styles/icons/PlayerSettingIcon'
import React, { useCallback } from 'react'
import { useSelector } from 'react-redux'

export interface PlayerSettingDialogProps {
  open: boolean
  onClose: () => void
}

export const PlayerSetting: React.FC<PlayerSettingDialogProps> = ({ onClose, open }) => {
  const configuration = useSelector(selectPlayerConfiguration).configuration

  const handlePlayerModeChange = useCallback((event: SelectChangeEvent<IWallpaperPlayerMode>) => {
    livemoe.wallpaperPlayerService.mode(event.target.value as IWallpaperPlayerMode)
  }, [])

  return <BootstrapDialog open={open}>
    <BootstrapDialogTitle onClose={onClose}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', userSelect: 'none' }}>
        <PlayerSettingIcon />
        <Typography
              sx={{ padding: '4px 24px' }}
              variant="h6"
            >
            播放设置
        </Typography>
      </Box>
    </BootstrapDialogTitle>
    <DialogContent dividers sx={{ width: '460px', display: 'flex', justifyContent: 'center', padding: '16px 4px' }}>
        <FormControl sx={{ gap: '1rem' }} >
          <Box sx={{ display: 'flex', columnGap: '4rem', justifyContent: 'space-between', alignItems: 'center' }}>
            <FormLabel>壁纸切换</FormLabel>
            <RadioGroup defaultValue="START_APPEARANCE">
              <FormControlLabel value="START_APPEARANCE" control={<Radio />} label="壁纸播放结束后切换" />
              {/* <FormControlLabel value="REGULAR_APPEARANCE" control={<Radio />} label="壁纸播放时间" /> */}
            </RadioGroup>
          </Box>
          <Box sx={{ display: 'flex', columnGap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
            <FormLabel>播放顺序</FormLabel>
            <Select onChange={handlePlayerModeChange} sx={{ marginRight: '5rem' }} defaultValue={configuration.mode}>
              {/* <MenuItem value="0">顺序播放</MenuItem> */}
              <MenuItem value="single">单个循环</MenuItem>
              <MenuItem value="list-loop">列表循环</MenuItem>
            </Select>
          </Box>
      </FormControl>
    </DialogContent>
  </BootstrapDialog>
}
