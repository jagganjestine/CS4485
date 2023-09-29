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
import RegistrationSelection from './components/RegistrationSelection';


function App() {
  return (
    <Router>
      <div className="App">
      <nav>
          <ul>
            <li>
              <Link to="/">Login</Link>
            </li>
            <li>
              <Link to="/homepage">Homepage</Link>
            </li>
            <li>
              <Link to="/registrationselection">Registration Selection</Link>
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
        </nav>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/homepage" element={<Homepage />} /> 
          <Route path="/registration" element={<Registration />} />
          <Route path="/registrationtutors" element={<TutorRegistration />} />
          <Route path="/registrationselection" element={<RegistrationSelection />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
