import React, { Suspense } from 'react'
import './index.css'

const Setting: React.FC = () => {
  return (
    <Suspense fallback={<div>加载中....</div>}>
      <div className="lm-wallpaper-setting"></div>
    </Suspense>
  )
}

export default Setting
