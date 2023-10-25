import React from 'react'
import Hero from './Hero'
import './Hero.css'
import './Landing.css'
import Routing from '../Routing'
import { Link, BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from './Login'
import RegistrationTutors from './RegistrationTutors'
import Registration from './Registration'
import Logout from './Logout'
import HomePage from './Homepage'
import BottomNav from './BottomNav'
import img2 from '../images/qualified.png'
import img3 from '../images/interface.png'
import img4 from '../images/calendar.png'

const Landing = () => {
  return (
    <div className='homepage'>
      <Hero />
      <div className='additional-info'>
        <div className='info-box1'>
            <div className='info1-left'>
                <h1>Qualified <br></br> tutors.</h1>
                <div>
                      <img className="img2" src={img2} />
                </div>
            </div>
        </div>
        <div className='info-box2'>
            <div className='info2-left'>
                <h1>A simple, easy-to-follow interface.</h1>
            </div>
            <div>
                <img className="img3" src={img3} />
            </div>
        </div>
        <div className='info-box3'>
            <div className='info3-left'>
                <h1>Link your appointments to your favorite calendar app.</h1>
            </div>
            <div>
                <img className="img4" src={img4} />
            </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

export default Landing
