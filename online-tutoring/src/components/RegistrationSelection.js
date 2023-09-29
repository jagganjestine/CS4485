import React, { useState } from "react";
import { Link } from "react-router-dom";
import './RegistrationSelection.css'; 

function RegistrationSelection() {
    return (
        <div className="registration-container">
          <div className="registration-form">
            <h1>Are you a</h1>
            <div className="buttons-container">
              <Link to="/registration" className="registration-button">Student</Link>
              <span className="or-text">or</span>
              <Link to="/registrationtutors" className="registration-button">Tutor</Link>
              <Link to="/"> <button className="sign-up-button">Login</button> </Link>
            </div>
          </div>
        </div>
      );
    }

export default RegistrationSelection;