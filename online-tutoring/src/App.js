import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Link } from "react-router-dom";
import Homepage from './components/Homepage';
import Login from './components/Login';
import Registration from './components/Registration';
import Logout from './components/Logout';
import NotFound from "./components/NotFound";
import TutorRegistration from './components/RegistrationTutors';
import Navbar from './components/Navbar';
import Routing from './Routing';

function App() {
  return (
    <Routing />
  );
}

export default App;
