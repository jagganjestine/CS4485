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

const Landing = () => {
  return (
    <div className='homepage'>
      <Hero />
      <div className='additional-info'>
        <div className='info-box1'>
            <div className='info1-left'>
                <h1>Qualified <br></br> tutors.</h1>
            </div>
        </div>
        <div className='info-box2'>
            <div className='info2-left'>
                <h1>A simple, easy-to-follow interface.</h1>
            </div>
        </div>
        <div className='info-box3'>
            <div className='info3-left'>
                <h1>Link your appointments to your favorite calendar app.</h1>
            </div>
        </div>
      </div>

      <div className='bottom-nav'>
        <div className='links'>
            <Link to="/">Login</Link>
            <Routes>
                <Route path="/login" element={<Login />} />
            </Routes>

            <br />

            <Link to="/homepage">Home page</Link>
            <Routes>
                <Route path="/homepage" element={<HomePage />} />
            </Routes>

            <br />
            
            <Link to="/registrationtutors">Registration for Tutors</Link>
            <Routes>
                <Route path="/registrationtutors" element={<RegistrationTutors />} />
            </Routes>

            <br />

            <Link to="/registration">Registration</Link>
            <Routes>
                <Route path="/registration" element={<Registration />} />
            </Routes>

            <br />

            <Link to="/logout">Logout</Link>
            <Routes>
                <Route path="/logout" element={<Logout />} />
            </Routes>


        </div>
      </div>
    </div>
  )
}

export default Landing
