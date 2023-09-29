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

function Routing() {
  return (
    <Router>
      <div className="App">
      <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/homepage" element={<Homepage />} /> {/* Use 'element' prop */}
          <Route path="/registration" element={<Registration />} />
          <Route path="/registrationtutors" element={<TutorRegistration />} />

          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  )
}

export default Routing
