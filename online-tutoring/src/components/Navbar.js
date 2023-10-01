import React from 'react'
import { Link, useNavigate} from 'react-router-dom'
import './Navbar.css'
import Registration from './Registration'
const Navbar = () => {

  const navigate = useNavigate();
  
  const navigateRegister = () => {
    navigate('/Registration');
  }
  return (

    <nav className='navbar'>
      <ul>
        <li>
          <Link to="/">Login</Link>
        </li>
        <li>
          <Link to="/homepage">Homepage</Link>
        </li>
        <li>
          <Link to="/registration">Registration</Link>
        </li>
        <li>
          <Link to="/registrationtutors">Registration for Tutors</Link>
        </li>
        <li>
          <Link to="/logout">Logout</Link>
        </li>
        <li>
          <Link to="/landing">Landing</Link>
        </li>
        </ul>
        <div className='signup-container'>
          <button className='signup'onClick={navigateRegister}>Sign Up</button>
        </div>
      
    </nav>
  )
}

export default Navbar
