import React, { useState, useEffect } from "react";
import RegistrationTutors from './RegistrationTutors'
import Registration from './Registration'
import Logout from './Logout'
import HomePage from './Homepage'
import Login from './Login'
import './BottomNav.css'
import { Link, BrowserRouter as Router, Route, Routes } from "react-router-dom";

const BottomNav = () => {
    return(
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
    )
} 

export default BottomNav