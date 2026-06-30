import React from 'react'

const BlurCircle = ({ top = 'auto', left = 'auto', right = 'auto', bottom = 'auto' }) => {
  return (
    <div
      className='absolute -z-50 h-58 w-58 aspect-square rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(255,179,91,0.5),rgba(255,90,61,0.35),rgba(255,90,61,0)_72%)] blur-2xl float-y'
      style={{ top, left, right, bottom }}
    />
  )
}

export default BlurCircle