import React, { useState } from 'react';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import './removeButton.css';

interface WallpaperRemoveBtn {
  check?: boolean;
  id: number;
  onChange: (value: boolean) => void;
}

const WallpaperRemoveButton: React.FC<WallpaperRemoveBtn> = ({
  id,
  onChange,
  check,
}) => {
  const [checked, setChecked] = useState<boolean>(check || false);

  return (
    <label
      className="lm-wallpaper-item-remove"
      htmlFor={`lm-wallpaper-item-remove-${id}`}
    >
      {checked ? <CheckCircleOutlineRoundedIcon /> : ''}
      <input
        defaultChecked={checked}
        id={`lm-wallpaper-item-remove-${id}`}
        hidden
        type="checkbox"
        onChange={(e) => {
          if (e.target.checked) {
            setChecked(true);
            onChange(true);
          } else {
            setChecked(false);
            onChange(false);
          }
        }}
      />
    </label>
  );
};

WallpaperRemoveButton.defaultProps = {
  check: false,
};

export default WallpaperRemoveButton;
