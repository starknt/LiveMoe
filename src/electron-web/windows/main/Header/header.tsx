import React, { useCallback, useState } from 'react';
import MinimizeRoundedIcon from '@mui/icons-material/MinimizeRounded';
import FullscreenExitRoundedIcon from '@mui/icons-material/FullscreenExitRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

const Header: React.FC = () => {
  const [isFullscreen, setFullscreen] = useState(false);

  const exit = useCallback(() => {
    livemoe.windowsService
      .sendWindowMessage('main', 'exit')
      .then(() => {})
      .catch((err) => console.error(err));
  }, []);

  const min = useCallback(() => {
    livemoe.windowsService
      .sendWindowMessage('main', 'min')
      .then((res) => {
        console.warn('call min result', res);
      })
      .catch((err) => console.error(err));
  }, []);

  const max = useCallback(async () => {
    livemoe.windowsService
      .sendWindowMessage('main', isFullscreen ? 'exitFullscreen' : 'fullscreen')
      .then(() => {})
      .catch((err) => console.error(err));

    setFullscreen((_) => !_);
  }, [isFullscreen]);

  return (
    <div className="headerWrapper">
      <header className="header">
        <span className="title font-700 text-white" />
        <div className="actions">
          <button type="button" onClick={min} className="action">
            <MinimizeRoundedIcon viewBox="0 8 24 24" fontSize="medium" />
          </button>
          <button type="button" onClick={max} className="action">
            {isFullscreen ? (
              <FullscreenExitRoundedIcon fontSize="medium" />
            ) : (
              <FullscreenRoundedIcon fontSize="medium" />
            )}
          </button>
          <button type="button" onClick={exit} className="action">
            <CloseRoundedIcon fontSize="medium" />
          </button>
        </div>
      </header>
    </div>
  );
};

export default Header;
