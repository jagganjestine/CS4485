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
        
        <Link to="/registrationselection">Registration</Link>

    </div>
    <div className="copyright">© 2023 Jaggan Jestine, Rikhab Yusuf, Taha Ahmed, Abdurrehman Zulfiqar, Sharmin Gaziani, Anish Gajera</div>
  </div>
    )
} 

export default BottomNav