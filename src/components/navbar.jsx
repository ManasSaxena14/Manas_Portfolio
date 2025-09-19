import React from 'react'
import logo from '../assets/Logo2.png'

const Navbar = () => {
  return (
    <nav className='mb-20 flex items-center justify-between py-6'>
      <div className="flex shrink-0 items-center">
        <img
          className='h-10'
          src={logo}
          alt="logo"
          style={{
            width: "60px",
            height: "2.4rem",
            objectFit: "cover",
            objectPosition: "55% 48%",
            opacity: 0.8
          }}
        />
      </div>

    </nav>
  )
}

export default Navbar
