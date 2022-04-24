import React from 'react'

export interface InputProps {
  Icon?: React.ReactNode
  onChange?: (value: string) => void
  className?: string
}

const Input: React.FC<InputProps> = ({ onChange, Icon, className = '' }) => {
  return (
    <div className={`lm-wallpaper-input ${className}`}>
      <input type="text" onChange={e => onChange?.(e.target.value)} />
      <i>{Icon}</i>
    </div>
  )
}

export default Input
