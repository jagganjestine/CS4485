import React, { useState, useEffect } from "react";
import { Link, BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import './RegistrationSelection.css'; 
import RegistrationTutors from './RegistrationTutors'
import Registration from './Registration'
import Logout from './Logout'
import HomePage from './Homepage'
import Login from './Login'
import BottomNav from './BottomNav'

function RegistrationSelection() {
    return (
      <div className="container">
        <BottomNav />
        <div className="registration-container">
          <div className="registration-form">
            <h1 className="rsHeader">Are you a</h1>
            <div className="buttons-container">
              <Link to="/registration" style={{ textDecoration: 'none' }}className="registration-button">Student</Link>
              <span className="or-text">or</span>
              <Link to="/registrationtutors" style={{ textDecoration: 'none' }}className="registration-button">Tutor</Link>
            </div>
          </div>
        </div>
      </div>
    );
}

export default RegistrationSelection;
