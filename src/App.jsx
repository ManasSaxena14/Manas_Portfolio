import { useState } from 'react'
import react from 'react'
import Technologies from './components/Technologies'
import Navbar from './components/navbar'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Contact from './components/MyContact'

const App = () => {
  return ( 
    <div className='overflow-x-hidden text-neutral-300 antialiased 
    selection:bg-cyan-300 selection:text-cyan-950'>

      <div className='fixed top-0 -z-10 h-full w-full'>
        <div className="absolute top-0 left-0 z-[-2] h-screen w-screen bg-black bg-[radial-gradient(ellipse_90%_70%_at_80%_20%,rgba(95,88,240,0.08),transparent),radial-gradient(ellipse_90%_70%_at_80%_80%,rgba(0,255,255,0.08),transparent),radial-gradient(ellipse_90%_70%_at_0%_0%,rgba(0,255,40,0.05),transparent),radial-gradient(ellipse_90%_90%_at_100%_0%,rgba(255,0,0,0.05),transparent),radial-gradient(ellipse_60%_50%_at_30%_70%,rgba(255,0,255,0.05),transparent)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:40px_60px] opacity-10 pointer-events-none z-[-1]"></div>
      </div>

      <div className='container m-auto ' >
        <Navbar />
        <Hero/>
        <About/>
        <Technologies/>
        <Projects/>
        <Contact/>
      </div>
    </div>
  ); 
}


export default App
