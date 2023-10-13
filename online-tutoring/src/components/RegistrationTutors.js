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
import BottomNav from "./BottomNav";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";




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
      <h1 className="tutor-reg-title">Tutor Registration</h1>
      <div className="form-group-2"> <input type="first name" placeholder="First Name" onChange={(e) => setFirstName(e.target.value)} /> </div>
      <div className="form-group-2"> <input type="last name" placeholder="Last Name" onChange={(e) => setLastName(e.target.value)} /> </div>
      <div className="form-group-2"> <input type="phone number" placeholder="Phone Number" onChange={(e) => setPhoneNumber(e.target.value)} /> </div>
      <div className="form-group-2"> <input type="date" placeholder="Birthday" onChange={(e) => setBirthday(e.target.value)} /> </div>
      <div className="form-group-2"> <textarea type= "about me" placeholder="About Me" rows={6} cols={94} onChange={(e) => setAboutMe(e.target.value)}></textarea> </div>
      <div className="form-group-2"> <input type="hours" placeholder="Available Hours (e.g. 9am-5pm)" onChange={(e) => setAvailableHours(e.target.value)} /> </div>
      <div className="form-group-2"> <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} /> </div>
      <div className="form-group-2"> <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} /> </div>

      <div>
        <h3 className="tutor-reg-title">Subjects Taught</h3>
        <div className="subject-checkboxes">
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
        <div className="background-check-questions">
        <h3 className="tutor-reg-title">Background Check Information</h3>
        <h4 className="background-check-questions">Felony Convictions</h4>
        <p1 className="background-check-questions">Have you ever been convicted of a felony?*</p1>
        <FormGroup>
          <FormControlLabel className="checkboxes" control={<Checkbox />} label="Yes"></FormControlLabel>
        </FormGroup>
        <FormGroup>
          <FormControlLabel className="checkboxes" control={<Checkbox />} label="No"></FormControlLabel>
        </FormGroup>
        <h4 className="background-check-questions">Misdemeanor Convictions</h4>
        <p1 className="background-check-questions">Have you ever been convicted of a misdemeanor?*</p1>
        <FormGroup>
          <FormControlLabel className="checkboxes" control={<Checkbox />} label="Yes"></FormControlLabel>
        </FormGroup>
        <FormGroup>
          <FormControlLabel className="checkboxes" control={<Checkbox />} label="No"></FormControlLabel>
        </FormGroup>
        <h4 className="background-check-questions">Pending Charges</h4>
        <p1 className="background-check-questions">Do you currently have any pending criminal charges against you?*</p1>
        <FormGroup>
          <FormControlLabel className="checkboxes" control={<Checkbox />} label="Yes"></FormControlLabel>
        </FormGroup>
        <FormGroup>
          <FormControlLabel className="checkboxes" control={<Checkbox />} label="No"></FormControlLabel>
        </FormGroup>
        <h4 className="background-check-questions">Probation or Parole</h4>
        <p1 className="background-check-questions">Are you currently on probation or parole?*</p1>
        <FormGroup>
          <FormControlLabel className="checkboxes" control={<Checkbox />} label="Yes"></FormControlLabel>
        </FormGroup>
        <FormGroup>
          <FormControlLabel className="checkboxes" control={<Checkbox />} label="No"></FormControlLabel>
        </FormGroup>
        <h4 className="background-check-questions">Criminal Conviction Related to Position</h4>
        <p1 className="background-check-questions">Have you ever been convicted of a crime that is directly related to the position for which you are applying?*</p1>
        <FormGroup>
          <FormControlLabel className="checkboxes" control={<Checkbox />} label="Yes"></FormControlLabel>
        </FormGroup>
        <FormGroup>
          <FormControlLabel className="checkboxes" control={<Checkbox />} label="No"></FormControlLabel>
        </FormGroup>
        <h4 className="background-check-questions">Unauthorized Use/Disclosure</h4>
        <p1 className="background-check-questions">Have you ever been found guilty or convicted of unauthorized use, disclosure, or theft of proprietary or confidential information?*</p1>
        <FormGroup>
          <FormControlLabel className="checkboxes" control={<Checkbox />} label="Yes"></FormControlLabel>
        </FormGroup>
        <FormGroup>
          <FormControlLabel className="checkboxes" control={<Checkbox />} label="No"></FormControlLabel>
        </FormGroup>

        </div>
        

      </div>
    
    <div className="tut-reg-button-format"> <button className="register-button-2" onClick={handleRegistration}>Register as Tutor</button> </div>
    </div>
    </div>
    </div>
    <BottomNav />
    </div>
    

    
  );
}

export default TutorRegistration;
