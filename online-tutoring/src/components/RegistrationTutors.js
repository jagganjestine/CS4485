import React, { useState } from "react";
import firebase from "./firebase";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "firebase/storage";
import "./RegistrationTutors.css"
import Login from './Login'
import Logout from './Logout'
import HomePage from './Homepage'
import Routing from '../Routing'
import RegistrationTutors from './RegistrationTutors'
import Registration from './Registration'
import { Link, BrowserRouter as Router, Route, Routes } from "react-router-dom";
import BottomNav from "./BottomNav";
import { TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import sha256 from 'crypto-js/sha256';


function TutorRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [birthday, setBirthday] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
 // const [profileImage, setProfileImage] = useState(null);
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

  const generateTimeOptions = () => {
    const options = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j += 30) {
        const hour = i.toString().padStart(2, '0');
        const minute = j.toString().padStart(2, '0');
        options.push(`${hour}:${minute}`);
      }
    }
    return options;
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
  const writeTutorData = (userId, firstName, lastName, email, phoneNumber, birthday, subjects, aboutMe, startTime, endTime, hashedPassword) => {

    set(ref(db, 'tutors/' + userId), {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone_number: phoneNumber,
      birthday: birthday,
      subjects: subjects,
      about_me: aboutMe,
      password: hashedPassword,
      start_Time: startTime,
      end_Time: endTime,

    });

  };

  function handleChange(e) {
    if (e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  }

  function handleSubmit(event) {
    event.preventDefault(); // Prevent the default form submission

    // Here you can add any additional validation if needed

    handleRegistration(); // Your existing function to handle registration
}

  const handleRegistration = async () => {
    if (felonyConvictions === 'yes' || misdemeanorConvictions === 'yes' || pendingCharges === 'yes' || probationOrParole === 'yes' || criminalConvictionRelated === 'yes' || unauthorizedUseDisclosure === 'yes') {
      Swal.fire({
        icon: 'error',
        title: 'Registration Unsuccessful!',
        text: 'We’re sorry, but it seems you don’t quite meet the requirements for this position',
    });
      return;
    }

    if (!isPasswordStrong(password)) {
      //alert("Password is too weak. Please ensure your password has at least 8 characters, includes an uppercase letter, a lowercase letter, a digit, and a special character.");
      Swal.fire({
        icon: 'warning',
        title: 'Weak Password',
        text: 'Password is too weak. Please ensure your password has at least 8 characters, includes an uppercase letter, a lowercase letter, a digit, and a special character.',
    });
      return;
    }

    try {
      const hashedPassword = sha256(password).toString();
      // console.log(hashedPassword);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const storage = getStorage();

      writeTutorData(userCredential.user.uid, firstName, lastName, email, phoneNumber, birthday, subjects, aboutMe, startTime, endTime, hashedPassword);
      const fileRef = sRef(storage, 'profile_pictures/' + userCredential.user.uid)
      await uploadBytes(fileRef, photo)
      const photoURL = await getDownloadURL(fileRef);
      updateProfile(userCredential.user, {photoURL});
      console.log("Success");
      Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: 'You may now login with these credentials!',
    });
      navigate("/login");
      // REDIRECT TO LOGIN PAGE
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        //alert("Email is already in use. Please press the 'Go to Login' button.");
        Swal.fire({
          icon: 'warning',
          title: 'Email in Use',
          text: 'Email is already in use. Please Login.'
        });
    } else {
        //alert("Something went wrong, Please try again.")
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: 'Something went wrong, please try again.'
        });
    }
    console.error(error);
    }
  };

  const redirectToHomepage = () => {
    navigate("/homepage");
  };


  return (
    <div>
      <div className="test">
        <div className="tutor-registration-container">
          <div>
            <h2 className="tutor-title">Tutor Registration</h2>
            <form onSubmit={handleSubmit}>
            <div className="form-group">
            <TextField type="first name" required label="First Name" id="standard-basic" variant="standard" className="proportion" value={firstName} onChange={(e) => setFirstName(e.target.value)}></TextField>
            </div>
            <div className="form-group">
              <TextField type="last name" required label="Last Name" id="standard-basic" variant="standard" className="proportion" value={lastName} onChange={(e) => setLastName(e.target.value)}></TextField>
            </div>
            <div className="form-group"> 
            <TextField type="phone number" required label="Phone Number" id="standard-basic" variant="standard" className="proportion" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}></TextField>
             </div>
            <div className="form-group">
            <TextField type="date" required label="Birthday" id="standard-basic" variant="standard" className="proportion" value={birthday} onChange={(e) => setBirthday(e.target.value)} InputLabelProps={{shrink: true }}></TextField>
            </div>
            <div style={{ marginTop: '10px' }}>
              <textarea
                style={{ width: '77%' }}
                placeholder="About Me"
                rows={4}
                cols={115}
                onChange={(e) => setAboutMe(e.target.value)}
              ></textarea> <div style={{ marginTop: '10px' }}></div>
            </div>
            <div className="form-group">
              <label htmlFor="startTime">Start Time</label>
              <select
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              >
                <option value="">Select Start Time</option>
                {generateTimeOptions().map((time, index) => (
                  <option key={index} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="endTime">End Time</label>
              <select
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              >
                <option value="">Select End Time</option>
                {generateTimeOptions().map((time, index) => (
                  <option key={index} value={time}>{time}</option>
                ))}
              </select>
            </div>
            
            
            <div className="form-group"> 
            <TextField type="email" required label="Email" id="standard-basic" variant="standard" className="proportion" value={email} onChange={(e) => setEmail(e.target.value)}></TextField> 
            </div>
            <div className="form-group"> 
            <TextField type="password" required label="Password" id="standard-basic" variant="standard" className="proportion" value={password} onChange={(e) => setPassword(e.target.value)}style={{ marginBottom: '20px' }}></TextField> 
            </div>
            <div className="upload-container">
              <label for="file-upload">Upload Profile Picture</label>
             <input className="styled-button" type="file" onChange={handleChange}/>
            </div>
           
            <div className = "questions">
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
            <div className = "questions">
              <h3>Do you have any felony convictions?</h3>
              <label>
                <input type="radio" name="felonyConvictions" value="yes" required onChange={(e) => setFelonyConvictions(e.target.value)} />
                Yes
              </label>
              <label>
                <input type="radio" name="felonyConvictions" value="no" required onChange={(e) => setFelonyConvictions(e.target.value)} />
                No
              </label>
            </div>

            <div className = "questions">
              <h3>Do you have any misdemeanor convictions?</h3>
              <label>
                <input type="radio" name="misdemeanorConvictions" value="yes" required onChange={(e) => setMisdemeanorConvictions(e.target.value)} />
                Yes
              </label>
              <label>
                <input type="radio" name="misdemeanorConvictions" value="no" required onChange={(e) => setMisdemeanorConvictions(e.target.value)} />
                No
              </label>
            </div>

            <div className = "questions">
              <h3>Do you have any pending charges?</h3>
              <label>
                <input type="radio" name="pendingCharges" value="yes" required onChange={(e) => setPendingCharges(e.target.value)} />
                Yes
              </label>
              <label>
                <input type="radio" name="pendingCharges" value="no" required onChange={(e) => setPendingCharges(e.target.value)} />
                No
              </label>
            </div>

            <div className = "questions">
              <h3>Are you currently on probation or parole?</h3>
              <label>
                <input type="radio" name="probationOrParole" value="yes" required onChange={(e) => setProbationOrParole(e.target.value)} />
                Yes
              </label>
              <label>
                <input type="radio" name="probationOrParole" value="no" required onChange={(e) => setProbationOrParole(e.target.value)} />
                No
              </label>
            </div>

            <div className = "questions">
              <h3>Do you possess any criminal convictions related to the position?</h3>
              <label>
                <input type="radio" name="criminalConvictionRelated" value="yes" required onChange={(e) => setCriminalConvictionRelated(e.target.value)} />
                Yes
              </label>
              <label>
                <input type="radio" name="criminalConvictionRelated" value="no" required onChange={(e) => setCriminalConvictionRelated(e.target.value)} />
                No
              </label>
            </div>

            <div className = "questions">
              <h3>Unauthorized Use/Disclosure</h3>
              <label>
                <input type="radio" name="unauthorizedUseDisclosure" value="yes" required onChange={(e) => setUnauthorizedUseDisclosure(e.target.value)} />
                Yes
              </label>
              <label>
                <input type="radio" name="unauthorizedUseDisclosure" value="no" required onChange={(e) => setUnauthorizedUseDisclosure(e.target.value)} />
                No
              </label>
            </div>



            <div style={{ marginTop: '20px' }}>
              <button className="register-tutor-button" style={{ margin: '0 auto' }} type = "submit">Register as Tutor </button> 
              </div>
              </form>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>



  );
}

export default TutorRegistration;