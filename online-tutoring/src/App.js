import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Link } from "react-router-dom";
import Homepage from './components/Homepage';
import Login from './components/Login';
import Registration from './components/Registration';
import Logout from './components/Logout';
import NotFound from "./components/NotFound";


function App() {
  return (
    <Router>
      <div className="App">
      <nav>
          <ul>
            <li>
              <Link to="/">Homepage</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/registration">Registration</Link>
            </li>
            <li>
              <Link to="/logout">Logout</Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} /> {/* Use 'element' prop */}
          <Route path="/registration" element={<Registration />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
