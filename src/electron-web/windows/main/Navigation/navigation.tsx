import React, { useState, useEffect } from 'react';
import Menu, { MenuProps, MenuItem, MenuItemProps } from 'rc-menu';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import { Link } from 'react-router-dom';

interface NavigationProps extends MenuProps {}

interface NavigationItemProps extends MenuItemProps {
  icon?: React.ReactNode;
  to?: string;
}

const Navigation: React.FC<NavigationProps> = ({ children }) => {
  const [openKeys, setOpenKeys] = useState<string[]>(['/']);

  useEffect(() => {
    return () => {
      localStorage.setItem('paths', JSON.stringify(openKeys));
    };
  }, [openKeys]);

  useEffect(() => {
    const paths = localStorage.getItem('paths');

    if (paths) {
      try {
        const keyPaths = JSON.parse(paths);

        setOpenKeys(keyPaths);
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  return (
    <div className="navigationWrapper">
      <div className="fixed left-0 top-0">
        <Menu
          selectable
          className="navigation"
          mode="inline"
          defaultSelectedKeys={openKeys}
          onSelect={(key) => {
            setOpenKeys(key.keyPath);
          }}
        >
          {children}
        </Menu>
      </div>
    </div>
  );
};

Navigation.propTypes = {};

const Item: React.FC<NavigationItemProps> = ({
  children,
  icon = <AccountCircleRoundedIcon />,
  title,
  to = undefined,
  disabled = false,
}) => {
  if (to) {
    return (
      <Link to={to}>
        <MenuItem eventKey={`${to}`} title={title} disabled={disabled}>
          <span className="lm-navigation-icon">{icon}</span>
          {children}
        </MenuItem>
      </Link>
    );
  }

  return (
    <MenuItem eventKey={`${to}`} title={title} disabled={disabled}>
      <span className="lm-navigation-icon">{icon}</span>
      {children}
    </MenuItem>
  );
};

export default Navigation;
export type { NavigationItemProps, NavigationProps };
export { Navigation, Item };
