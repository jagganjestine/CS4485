import React from 'react'
import { Link, useNavigate} from 'react-router-dom'
import './Navbar.css'
import { useState, useEffect } from 'react'
import Registration from './Registration'
const Navbar = () => {

  const navigate = useNavigate();
  const navigateRegister = () => {
    navigate('/Registration');
  }

  const [isSticky, setIsSticky] = useState(false);

  // Function to handle scrolling and toggle the sticky class
  const handleScroll = () => {
    if (window.pageYOffset > 0) {
      setIsSticky(true);
    } else {
      setIsSticky(false);
    }
  };

  // Add an event listener for the scroll event
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      // Remove the event listener when the component unmounts
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div id="navbar1" className={isSticky ? 'navbar sticky' : 'navbar'}>
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
    </div>
  )
}

export default Navbar
