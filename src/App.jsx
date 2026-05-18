import { useState } from 'react'
import reactLogo from './assets/react.svg'
import heroImg from './assets/hero.png'
import './App.css'
import {Routes, Route} from 'react-router-dom'
import Home from './pages/home'
import Services from './pages/services'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
       <Routes>
        <Route path="/" element={<Home/>} />
        <Route path='/services' element={<Services/>} />
      </Routes>
    </>
  )
}

export default App
