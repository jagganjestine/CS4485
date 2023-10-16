import React from 'react'
import { useNavigate } from 'react-router-dom'

const Hero = () => {

  const navigate = useNavigate();
  const navigateRegister = () => {
    navigate('/RegistrationSelection');
  }
  return (
    <div className = "hero-container">
      <div className='hero-section'>
        <div class="gradient-box">
                <div className='hero-left'>
                    <h1 className='typewriter'>Your semester <br></br>made easy.</h1>
                    <p>
                    Tutor looking for work? Student seeking help? Sign up now.
                    </p>
                    <div className='box-container'>
                        <button className="get-started" onClick={navigateRegister}>Get Started</button>
                    </div>
                </div>
            </div>
      </div>
    </div>
  )
}

export default Hero
