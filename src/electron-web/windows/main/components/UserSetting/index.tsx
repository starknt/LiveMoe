import { useCallback, useState } from 'react'

const settings = ['个人信息', '消息', '退出登录']

export default function UserSetting() {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null)

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleCloseUserMenu = useCallback(() => {
    setAnchorElUser(null)
  }, [])

  return <>用户设置
    {/* <IconButton
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
              {settings.map(setting => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu> */}
  </>
}
