import React from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css'
const Navbar = () => {
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
        </ul>
        <div className='signup-container'>
          <button className='signup'>Sign Up</button>
        </div>
      
    </nav>
  )
}

export default Navbar
