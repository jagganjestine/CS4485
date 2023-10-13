import React from 'react'
import { Link } from 'react-router-dom'
import './SelectionHero.css'
const SelectionHero = () => {
  return (
    <div className="selection-page">
        <div className="registration-container">
          <h2 className="rsHeader">What are you registering as?</h2>
              <div className="buttons-container">
                <Link to="/registration" style={{ textDecoration: 'none' }}className="registration-button">Student</Link>
                <span className="or-text">or</span>
                <Link to="/registrationtutors" style={{ textDecoration: 'none' }}className="registration-button">Tutor</Link>
              </div>
            </div>
        </div>
    
  )
}

export default SelectionHero
