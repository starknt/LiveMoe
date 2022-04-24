import type {
  BoxProps,
  CheckboxProps,
  TypographyProps,
} from '@mui/material'
import {
  Box,
  Button,
  Checkbox,
  Divider,
  IconButton,
  Tooltip,
  Typography,
  styled,
} from '@mui/material'
import TinyText from 'electron-web/components/TinyText'
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import HelpRoundedIcon from '@mui/icons-material/HelpRounded'
import React, { useCallback } from 'react'
import useMemoizedFn from 'electron-web/hooks/useMemoFn'
import { useAppStore } from 'electron-web/store/store'

export const SettingWidget = styled('div')(() => ({
  '--widget-gap': '8px',
  'padding': 'var(--widget-gap)',
  'width': 'calc( 100% - 2 * var(--widget-gap) )',
  'maxWidth': '100%',
  'height': 'calc( 100% - 2 * var(--widget-gap) )',
  'maxHeight': '100%',
  'display': 'flex',
  'justifyContent': 'center',
  'alignItems': 'center',
}))

const CenterBox = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}))

const SettingBox: React.FC<BoxProps> = ({ children, ...props }) => {
  const childrenCount = React.Children.count(children)

  const renderTwoElementInLine = useMemoizedFn(
    (
      childrens: (React.ReactChild | React.ReactFragment | React.ReactPortal)[],
    ): any => {
      if (childrens.length <= 0)
        return ''

      const ElementInLine = childrens.splice(0, 2)

      return (
        <>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '2rem',
            }}
          >
            {ElementInLine.map((child) => {
              return child
            })}
          </Box>
          {childrens.length > 0 ? renderTwoElementInLine(childrens) : ''}
        </>
      )
    },
  )

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: childrenCount > 2 ? 'flex-start' : 'center',
        flexWrap: 'wrap',
        flexDirection: childrenCount > 2 ? 'column' : 'row',
      }}
      {...props}
    >
      {childrenCount >= 2
        ? renderTwoElementInLine(React.Children.toArray(children))
        : children}
    </Box>
  )
}

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

export interface SettingCheckboxProps extends CheckboxProps {
  help?: string
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

const SettingWallpaperStore: React.FC<{ path?: string }> = ({
  children,
  path,
}) => {
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          columnGap: '1rem',
          justifyContents: 'flex-start',
          maxWidth: '90%',
        }}
      >
        <TinyText variant="span" noWrap>
          当前目录:
        </TinyText>
        <Typography sx={{ flex: 1 }} noWrap>
          {path ?? '加载中...'}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: '1rem', mt: '1rem' }}>
        {React.Children.map(children, (child: React.ReactNode) => {
          if (!React.isValidElement(child))
            return ''

          return React.cloneElement(child as React.ReactElement, {
            ...(child as React.ReactElement).props,
            className: 'non-draggable',
          })
        })}
      </Box>
    </Box>
  )
}

export default function Setting() {
  const store = useAppStore()

  const appConfiguration = store.applicationConfiguration
  const playerConfiguration = store.playerConfiguration

  const handleSelfStartChange = useCallback(
    (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      const { state, ...config } = appConfiguration

      window.livemoe?.applicationService.setConfiguration({
        ...config,
        selfStartup: checked,
      })
    },
    [appConfiguration],
  )

  const handleColdStartupChange = useCallback(
    (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      const { state, ...config } = appConfiguration

      window.livemoe?.applicationService.setConfiguration({
        ...config,
        coldStartup: checked,
      })
    },
    [appConfiguration],
  )

  const handleCloseChange = useCallback(
    (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      const { state, ...config } = appConfiguration

      window.livemoe?.applicationService.setConfiguration({
        ...config,
        closeAction: {
          ...config.closeAction,
          action: checked ? 'exit' : 'hide',
        },
      })
    },
    [appConfiguration],
  )

  const handleAutoupdateChange = useCallback(
    (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      const { state, ...config } = appConfiguration

      window.livemoe?.applicationService.setConfiguration({
        ...config,
        autoUpdate: checked,
      })
    },
    [appConfiguration],
  )

  const handleUpdateTipChange = useCallback(
    (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      const { state, ...config } = appConfiguration

      window.livemoe?.applicationService.setConfiguration({
        ...config,
        updateTips: checked,
      })
    },
    [appConfiguration],
  )

  const handleOpenWallpaperRepository = useCallback(() => {
    window?.livemoe?.guiService.openFolder(appConfiguration.resourcePath)
  }, [appConfiguration])

  const handleChangeWallpaperRepository = useCallback(() => {}, [])

  const handleViewModeChange = useCallback(
    (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      window.livemoe?.wallpaperPlayerService.setConfiguration({
        ...playerConfiguration.configuration,
        viewMode: checked,
      })
    },
    [playerConfiguration],
  )

  const handleWallpaperPlayerPause = useCallback(
    (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      window.livemoe?.wallpaperPlayerService.setConfiguration({
        ...playerConfiguration.configuration,
        userSettings: {
          ...playerConfiguration.configuration.userSettings,
          background: checked ? 'pause' : 'play',
        },
      })
    },
    [playerConfiguration],
  )

  return (
    <SettingWidget>
      <Box
        width="100%"
        height="100%"
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridTemplateRows="repeat(16, 1fr)"
      >
        <Box gridColumn="span 12"></Box>
        <Box
          display="grid"
          gridColumn="span 3"
          gridTemplateRows="repeat(24, 1fr)"
          gridRow="span 14"
        >
          <CenterBox gridRow="span 8">
            <TinyText>基础设置</TinyText>
          </CenterBox>
          <CenterBox gridRow="span 4">
            <TinyText>更新设置</TinyText>
          </CenterBox>
          <CenterBox gridRow="span 8">
            <TinyText>壁纸设置</TinyText>
          </CenterBox>
          <CenterBox gridRow="span 4">
            <TinyText>播放设置</TinyText>
          </CenterBox>
        </Box>
        <Box
          justifyContent="center"
          alignItems="center"
          display="grid"
          gridColumn="span 1"
          gridRow="span 14"
        >
          <Divider orientation="vertical" />
        </Box>
        <Box
          display="grid"
          gridTemplateRows="repeat(24, 1fr)"
          gridColumn="span 8"
          gridRow="span 14"
          overflow="hidden"
        >
          <SettingBox gridRow="span 8">
            <SettingCheckbox
              onChange={handleSelfStartChange}
              checked={appConfiguration.selfStartup}
            >
              <SettingTypography>开机自启</SettingTypography>
            </SettingCheckbox>
            <SettingCheckbox
              checked={appConfiguration.coldStartup}
              onChange={handleColdStartupChange}
              help="启动应用时不会自动打开商店"
            >
              <SettingTypography>静默启动</SettingTypography>
            </SettingCheckbox>
            <SettingCheckbox
              onChange={handleViewModeChange}
              checked={playerConfiguration.configuration.viewMode}
              help="桌面双击进入观赏模式"
            >
              <SettingTypography>观赏模式</SettingTypography>
            </SettingCheckbox>
            <SettingCheckbox
              onChange={handleCloseChange}
              checked={appConfiguration.closeAction.action === 'exit'}
              help="当关闭商店时, 是否退出应用"
            >
              <SettingTypography>退出应用</SettingTypography>
            </SettingCheckbox>
          </SettingBox>
          <SettingBox gridRow="span 4">
            <SettingCheckbox
              onChange={handleAutoupdateChange}
              checked={appConfiguration.autoUpdate}
            >
              <SettingTypography>自动更新</SettingTypography>
            </SettingCheckbox>
            <SettingCheckbox
              onChange={handleUpdateTipChange}
              checked={appConfiguration.updateTips}
            >
              <SettingTypography>关闭提示</SettingTypography>
            </SettingCheckbox>
          </SettingBox>
          <Box margin="auto" gridRow="span 8">
            <SettingWallpaperStore
              path={store.applicationConfiguration.resourcePath}
            >
              <Button
                onClick={handleChangeWallpaperRepository}
                variant="contained"
              >
                修改仓库目录
              </Button>
              <Button
                onClick={handleOpenWallpaperRepository}
                variant="outlined"
              >
                打开壁纸仓库
              </Button>
            </SettingWallpaperStore>
          </Box>
          <SettingBox gridRow="span 4">
            <SettingCheckbox
              onChange={handleWallpaperPlayerPause}
              checked={
                playerConfiguration.configuration.userSettings.background
                === 'pause'
              }
              help="当其他应用进入全屏状态时, 是否应用暂停壁纸的播放"
            >
              <SettingTypography>后台暂停</SettingTypography>
            </SettingCheckbox>
            <SettingCheckbox
              sx={{ visibility: 'hidden', pointerEvents: 'none' }}
            >
              <SettingTypography
                sx={{ visibility: 'hidden', pointerEvents: 'none' }}
              >
                noop
              </SettingTypography>
            </SettingCheckbox>
          </SettingBox>
        </Box>
        <Box gridColumn="span 12"></Box>
      </Box>
    </SettingWidget>
  )
}
