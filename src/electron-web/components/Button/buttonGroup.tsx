import React from 'react'

export interface ButtonGroupProps {
  className?: string
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`lm-wallpaper-btn-ground ${className}`}>{children}</div>
  )
}
