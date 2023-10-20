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



function TutorRegistration() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [birthday, setBirthday] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [availableHours, setAvailableHours] = useState("");
  const [felonyConvictions, setFelonyConvictions] = useState(null);
  const [misdemeanorConvictions, setMisdemeanorConvictions] = useState(null);
  const [pendingCharges, setPendingCharges] = useState(null);
  const [probationOrParole, setProbationOrParole] = useState(null);
  const [criminalConvictionRelated, setCriminalConvictionRelated] = useState(null);
  const [unauthorizedUseDisclosure, setUnauthorizedUseDisclosure] = useState(null);


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
    if (felonyConvictions === 'yes' || misdemeanorConvictions === 'yes' || pendingCharges === 'yes' || probationOrParole === 'yes' || criminalConvictionRelated === 'yes' || unauthorizedUseDisclosure === 'yes') {
      alert("Registration failed due to background check. Please ensure all responses are accurate.");
      return;
    }

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
      <h2 className="tutor-title">Tutor Registration</h2>
      {/*<TextField label="First Name" variant="standard" className="verification-code" onChange={(e) => setFirstName(e.target.value)}/></div>*/}
      <div className="form-group"> <input type="first name" placeholder="First Name" onChange={(e) => setFirstName(e.target.value)} /> </div>
      <div className="form-group"> <input type="last name" placeholder="Last Name" onChange={(e) => setLastName(e.target.value)} /> </div>
      <div className="form-group"> <input type="phone number" placeholder="Phone Number" onChange={(e) => setPhoneNumber(e.target.value)} /> </div>
      <div className="form-group"> <input type="date" placeholder="Birthday" onChange={(e) => setBirthday(e.target.value)} /> </div>
      <div style={{ marginTop: '10px' }}>
    <textarea
    style={{ width: '77%' }}  
    placeholder="About Me"
    rows={4}
    cols={115}
    onChange={(e) => setAboutMe(e.target.value)}
  ></textarea> <div style={{ marginTop: '10px' }}></div>
    </div>      
<div className="form-group"> <input type="hours" placeholder="Available Hours (e.g. 9am-5pm)" onChange={(e) => setAvailableHours(e.target.value)} /> </div>
      <div className="form-group"> <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} /> </div>
      <div className="form-group"> <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} /> </div>

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
<div>
  <h3>Felony Convictions</h3>
  <label>
    <input type="radio" name="felonyConvictions" value="yes" onChange={(e) => setFelonyConvictions(e.target.value)} />
    Yes
  </label>
  <label>
    <input type="radio" name="felonyConvictions" value="no" onChange={(e) => setFelonyConvictions(e.target.value)} />
    No
  </label>
</div>

<div>
  <h3>Misdemeanor Convictions</h3>
  <label>
    <input type="radio" name="misdemeanorConvictions" value="yes" onChange={(e) => setMisdemeanorConvictions(e.target.value)} />
    Yes
  </label>
  <label>
    <input type="radio" name="misdemeanorConvictions" value="no" onChange={(e) => setMisdemeanorConvictions(e.target.value)} />
    No
  </label>
</div>

<div>
  <h3>Pending Charges</h3>
  <label>
    <input type="radio" name="pendingCharges" value="yes" onChange={(e) => setPendingCharges(e.target.value)} />
    Yes
  </label>
  <label>
    <input type="radio" name="pendingCharges" value="no" onChange={(e) => setPendingCharges(e.target.value)} />
    No
  </label>
</div>

<div>
  <h3>Probation or Parole</h3>
  <label>
    <input type="radio" name="probationOrParole" value="yes" onChange={(e) => setProbationOrParole(e.target.value)} />
    Yes
  </label>
  <label>
    <input type="radio" name="probationOrParole" value="no" onChange={(e) => setProbationOrParole(e.target.value)} />
    No
  </label>
</div>

<div>
  <h3>Criminal Conviction Related to Position</h3>
  <label>
    <input type="radio" name="criminalConvictionRelated" value="yes" onChange={(e) => setCriminalConvictionRelated(e.target.value)} />
    Yes
  </label>
  <label>
    <input type="radio" name="criminalConvictionRelated" value="no" onChange={(e) => setCriminalConvictionRelated(e.target.value)} />
    No
  </label>
</div>

<div>
  <h3>Unauthorized Use/Disclosure</h3>
  <label>
    <input type="radio" name="unauthorizedUseDisclosure" value="yes" onChange={(e) => setUnauthorizedUseDisclosure(e.target.value)} />
    Yes
  </label>
  <label>
    <input type="radio" name="unauthorizedUseDisclosure" value="no" onChange={(e) => setUnauthorizedUseDisclosure(e.target.value)} />
    No
  </label>
</div>


      
      <div style={{ marginTop: '20px' }}> 
      <button className="register-tutor-button" style={{ margin: '0 auto' }} onClick={handleRegistration}
        >Register as Tutor </button> </div>
    </div>
    </div>
    </div>
    <BottomNav />
    </div>
    

    
  );
}

export default TutorRegistration;
