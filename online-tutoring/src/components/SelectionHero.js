import React from 'react'
import { Link } from 'react-router-dom'
import './SelectionHero.css'
const SelectionHero = () => {
  return (
    <div className="selection-page">
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
  )
}

export default SelectionHero
