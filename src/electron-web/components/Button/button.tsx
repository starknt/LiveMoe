import React from 'react'

export interface ButtonProps {
  Icon?: React.ReactNode
  onClick?: () => void
  select?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  Icon,
  onClick,
  select = false,
}) => {
  return (
    <button
      onClick={onClick}
      className={`lm-wallpaper-btn ${select ? 'selected' : ''}`}
      type="button"
    >
      <i className="lm-wallpaper-btn-icon">{Icon}</i>
      {children}
    </button>
  )
}
