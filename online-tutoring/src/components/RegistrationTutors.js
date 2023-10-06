import React, { useState } from "react";
import firebase from "./firebase";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import "./RegistrationTutors.css"
import Login from './Login'
import Logout from './Logout'
import HomePage from './Homepage'
import Routing from '../Routing'
import RegistrationTutors from './RegistrationTutors'
import Registration from './Registration'
import { Link, BrowserRouter as Router, Route, Routes } from "react-router-dom";



function TutorRegistration() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [birthday, setBirthday] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [availableHours, setAvailableHours] = useState("");
  

  const [subjects, setSubjects] = useState({
    Math: false,
    English: false,
    Science: false,
    History: false,
    // You can add other subjects as needed
  });

  const auth = getAuth();
  const db = getDatabase();

  const handleSubjectChange = (e) => {
    const { name, checked } = e.target;
    setSubjects(prevState => ({
      ...prevState,
      [name]: checked
    }));
  };

  const getSelectedSubjects = () => {
    return Object.keys(subjects).filter(subject => subjects[subject]);
  };
  const isPasswordStrong = (password) => {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);

    return password.length >= minLength && hasUppercase && hasLowercase && hasDigit && hasSpecialChar;
  };
  const writeTutorData = (userId, firstName, lastName, email, phoneNumber, birthday, subjects, aboutMe, availableHours) => {
    set(ref(db, 'tutors/' + userId), {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone_number: phoneNumber,
      birthday: birthday,
      subjects: subjects,
      about_me: aboutMe,
      available_hours: availableHours
    });
  };

  const handleRegistration = async () => {
    if (!isPasswordStrong(password)) {
      alert("Password is too weak. Please ensure your password has at least 8 characters, includes an uppercase letter, a lowercase letter, a digit, and a special character.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      writeTutorData(userCredential.user.uid, firstName, lastName, email, phoneNumber, birthday, subjects, aboutMe, availableHours);
      console.log("Success");
      // REDIRECT TO LOGIN PAGE
    } catch (error) {
      alert("Something went wrong, Please try again.")
      console.error(error);
    }
  };

  return (
    <div>
      <div className="test">
  <div className="tutor-registration-container">
    <div>
      <h2>Tutor Registration</h2>
      <input type="text" placeholder="First Name" onChange={(e) => setFirstName(e.target.value)} />
      <input type="text" placeholder="Last Name" onChange={(e) => setLastName(e.target.value)} />
      <input type="text" placeholder="Phone Number" onChange={(e) => setPhoneNumber(e.target.value)} />
      <input type="date" placeholder="Birthday" onChange={(e) => setBirthday(e.target.value)} />
      <textarea placeholder="About Me" onChange={(e) => setAboutMe(e.target.value)}></textarea>
      <input type="text" placeholder="Available Hours (e.g. 9am-5pm)" onChange={(e) => setAvailableHours(e.target.value)} />
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

      <div>
        <h3>Subjects Taught</h3>
        <label>
          <input type="checkbox" name="Math" onChange={handleSubjectChange} />
          Math
        </label>
        <label>
          <input type="checkbox" name="English" onChange={handleSubjectChange} />
          English
        </label>
        <label>
          <input type="checkbox" name="Science" onChange={handleSubjectChange} />
          Science
        </label>
        <label>
          <input type="checkbox" name="History" onChange={handleSubjectChange} />
          History
        </label>
        {/* You can add other subjects as needed */}
      </div>

      <button onClick={handleRegistration}>Register as Tutor</button>
    </div>
    </div>
    </div>
    <div className='bottom-nav'>
            <div className='links'>
            <Link to="/">Login</Link>
            <Routes>
                <Route path="/login" element={<Login />} />
            </Routes>

            <br />

            <Link to="/homepage">Home page</Link>
            <Routes>
                <Route path="/homepage" element={<HomePage />} />
            </Routes>

            <br />
            
            <Link to="/registrationtutors">Registration for Tutors</Link>
            <Routes>
                <Route path="/registrationtutors" element={<RegistrationTutors />} />
            </Routes>

            <br />

            <Link to="/registration">Registration</Link>
            <Routes>
                <Route path="/registration" element={<Registration />} />
            </Routes>

            <br />

            <Link to="/logout">Logout</Link>
            <Routes>
                <Route path="/logout" element={<Logout />} />
            </Routes>
        </div>
      </div>
      </div>
    

    
  );
}

export default TutorRegistration;
