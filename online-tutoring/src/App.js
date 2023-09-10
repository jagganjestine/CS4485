import logo from './logo.svg';
import './App.css';
import Login from './components/Login';
import Registration from './components/Registration';
import Logout from './components/Logout';

function App() {
  return (
    <div className="App">
      <Registration/>
      <Login/>
      <Logout/>
    </div>
  );
}

export default App;
