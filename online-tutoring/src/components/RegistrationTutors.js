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
import TextField from '@mui/material/TextField';
import '@mui/material'





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
      <div className="form-group-2"> <TextField type="first name" label="First Name" id="standard-basic" variant="standard" className="proportion2" value={firstName} onChange={(e) => setFirstName(e.target.value)}></TextField></div>
      <div className="form-group-2"> <TextField type="last name" label="Last Name" id="standard-basic" variant="standard" className="proportion2" value={lastName} onChange={(e) => setLastName(e.target.value)}></TextField></div>
      <div className="form-group-2"> <TextField type="phone number" label="Phone Number" id="standard-basic" variant="standard" className="proportion2" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}></TextField></div>
      <div className="form-group-2"> <TextField type="date" label="Birthday" id="standard-basic" variant="standard" className="proportion2" value={birthday} onChange={(e) => setBirthday(e.target.value)} InputLabelProps={{shrink: true }}></TextField></div>
      <div className="form-group-2"> <textarea type= "about me" placeholder="About Me" id="standard-basic" variant="standard" className="proportion2" rows={6} cols={94} onChange={(e) => setAboutMe(e.target.value)}></textarea> </div>
      <div className="form-group-2"> <TextField type="hours" label="Available Hours" id="standard-basic" variant="standard" className="proportion2" value={availableHours} onChange={(e) => setAvailableHours(e.target.value)}></TextField> </div>
      <div className="form-group-2"> <TextField type="email" label="Email" id="standard-basic" variant="standard" className="proportion2" value={email} onChange={(e) => setEmail(e.target.value)}></TextField> </div>
      {/* <TextField type="email" label="Email" id="standard-basic" variant="standard" className="proportion2" value={email} onChange={(e) => setEmail(e.target.value)} ></TextField> */}
      <div className="form-group-2"> <TextField type="password" label="Password" id="standard-basic" variant="standard" className="proportion2" value={password} onChange={(e) => setPassword(e.target.value)}></TextField> </div>

      <div>
        <h3 className="tutor-reg-title">Subjects Taught</h3>
        <div className="subject-checkboxes">
        <FormGroup className="checkboxes">
          <div>
          <FormControlLabel control={<Checkbox onChange={handleSubjectChange}/>} label="Math" style={{ '& .MuiCheckbox-root.Mui-checked': { color: 'white' } }}></FormControlLabel>
          <FormControlLabel control={<Checkbox onChange={handleSubjectChange}/>} label="English" style={{ '& .MuiCheckbox-root.Mui-checked': { color: 'white' } }}></FormControlLabel>
          <FormControlLabel control={<Checkbox onChange={handleSubjectChange}/>} label="Science" style={{ '& .MuiCheckbox-root.Mui-checked': { color: 'white' } }}></FormControlLabel>
          <FormControlLabel control={<Checkbox onChange={handleSubjectChange}/>} label="History" style={{ '& .MuiCheckbox-root.Mui-checked': { color: 'white' } }}></FormControlLabel>
          {/* You can add other subjects as needed */}
          </div>
        </FormGroup>
        </div>
        <div className="background-check-questions">
        <h3 className="tutor-reg-title">Background Check Information</h3>
        <h4 className="background-check-questions">Felony Convictions</h4>
        <p1 className="background-check-questions">Have you ever been convicted of a felony?*</p1>
        <FormGroup className="checkboxes">
          <div>
          <FormControlLabel control={<Checkbox />} label="Yes" style={{ '& .MuiCheckbox-root.Mui-checked': { color: 'white' } }}></FormControlLabel>
          <FormControlLabel control={<Checkbox />} label="No"></FormControlLabel>
          </div>
        </FormGroup>
        <h4 className="background-check-questions">Misdemeanor Convictions</h4>
        <p1 className="background-check-questions">Have you ever been convicted of a misdemeanor?*</p1>
        <FormGroup className="checkboxes" style={{ '& .MuiCheckbox-root.Mui-checked': { color: 'white' } }}>
          <div>
          <FormControlLabel control={<Checkbox />} label="Yes"></FormControlLabel>
          <FormControlLabel control={<Checkbox />} label="No"></FormControlLabel>
          </div>
        </FormGroup>
        <h4 className="background-check-questions">Pending Charges</h4>
        <p1 className="background-check-questions">Do you currently have any pending criminal charges against you?*</p1>
        <FormGroup className="checkboxes" style={{ '& .MuiCheckbox-root.Mui-checked': { color: 'white' } }}>
          <div>
          <FormControlLabel control={<Checkbox />} label="Yes"></FormControlLabel>
          <FormControlLabel control={<Checkbox />} label="No"></FormControlLabel>
          </div>
        </FormGroup>
        <h4 className="background-check-questions">Probation or Parole</h4>
        <p1 className="background-check-questions">Are you currently on probation or parole?*</p1>
        <FormGroup className="checkboxes" style={{ '& .MuiCheckbox-root.Mui-checked': { color: 'white' } }}>
          <div>
          <FormControlLabel control={<Checkbox />} label="Yes"></FormControlLabel>
          <FormControlLabel control={<Checkbox />} label="No"></FormControlLabel>
          </div>
        </FormGroup>
        <h4 className="background-check-questions">Criminal Conviction Related to Position</h4>
        <p1 className="background-check-questions">Have you ever been convicted of a crime that is directly related to the position for which you are applying?*</p1>
        <FormGroup className="checkboxes" style={{ '& .MuiCheckbox-root.Mui-checked': { color: 'white' } }}>
          <div>
          <FormControlLabel control={<Checkbox />} label="Yes"></FormControlLabel>
          <FormControlLabel control={<Checkbox />} label="No"></FormControlLabel>
          </div>
        </FormGroup>
        <h4 className="background-check-questions">Unauthorized Use/Disclosure</h4>
        <p1 className="background-check-questions">Have you ever been found guilty or convicted of unauthorized use, disclosure, or theft of proprietary or confidential information?*</p1>
        <FormGroup className="checkboxes" style={{ '& .MuiCheckbox-root.Mui-checked': { color: 'white' } }}>
          <div>
          <FormControlLabel control={<Checkbox />} label="Yes"></FormControlLabel>
          <FormControlLabel control={<Checkbox />} label="No"></FormControlLabel>
          </div>
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
