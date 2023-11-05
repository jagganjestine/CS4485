import React, { useState } from "react";
import firebase from "./firebase";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import "./Registration.css";
import { TextField } from "@mui/material";
import Swal from 'sweetalert2';

function Registration() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [school, setSchool] = useState("");
  const [major, setMajor] = useState("");
 

  const auth = getAuth();
  const db = getDatabase();

  const isPasswordStrong = (password) => {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);

    return password.length >= minLength && hasUppercase && hasLowercase && hasDigit && hasSpecialChar;
  };
  // Hash the password and store the hash password
  const writeUserData = (userId, firstName, lastName, email, birthday, school, major) => {
    
    set(ref(db, 'users/' + userId), {
      first_name: firstName,
      last_name: lastName,
      email: email,
      birthday: birthday,
      school: school,
      major: major,
      favoriteTutors: []
  
      

    });
  };

  const handleRegistration = async () => {
    if (!isPasswordStrong(password)) {
        //alert("Password is too weak. Please ensure your password has at least 8 characters, includes an uppercase letter, a lowercase letter, a digit, and a special character.");
        Swal.fire({
          icon: 'warning',
          title: 'Weak Password',
          text: 'Password is too weak. Please ensure your password has at least 8 characters, includes an uppercase letter, a lowercase letter, a digit, and a special character.'
        });
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        writeUserData(userCredential.user.uid, firstName, lastName, email, birthday, school, major);
        console.log("Success");
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful!',
          text: 'You may now login with these credentials!',
      });
        navigate("/login");
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


  const redirectToLogin = () => {
    navigate("/");
  };

  return (
    <div className="new_registration-container">
      <div>
      <h2>Student Registration</h2>

      <div className="form-group">
      {/* <TextField id="standard-basic" variant="standard" type="first name" placeholder="First Name" onChange={(e) => setFirstName(e.target.value)} /> */}
      <TextField type="first name" label="First Name" id="standard-basic" variant="standard" className="proportion" value={firstName} onChange={(e) => setFirstName(e.target.value)}></TextField>
      </div>

      <div className="form-group">
      {/* <TextField type="last name" placeholder="Last Name" onChange={(e) => setLastName(e.target.value)} /> */}
      <TextField type="last name" label="Last Name" id="standard-basic" variant="standard" className="proportion" value={lastName} onChange={(e) => setLastName(e.target.value)}></TextField>    
      </div>

      <div className="form-group">
      { /* <TextField type="date" placeholder="Birthday" onChange={(e) => setBirthday(e.target.value)} /> */}
      <TextField type="date" label="Birthday" id="standard-basic" variant="standard" className="proportion" value={birthday} onChange={(e) => setBirthday(e.target.value)} InputLabelProps={{shrink: true }}></TextField>
      </div>

      <div className="form-group">
      {/*<TextField type="school" placeholder="School" onChange={(e) => setSchool(e.target.value)} /> */} 
      <TextField type="school" label="School" id="standard-basic" variant="standard" className="proportion" value={school} onChange={(e) => setSchool(e.target.value)}></TextField>
      </div>

      <div className="form-group">
      { /* <TextField type="major" placeholder="Major" onChange={(e) => setMajor(e.target.value)} /> */}
      <TextField type="major" label="Major" id="standard-basic" variant="standard" className="proportion" value={major} onChange={(e) => setMajor(e.target.value)}></TextField>
      </div>

      <div className="form-group">
      <TextField type="email" label="Email" id="standard-basic" variant="standard" className="proportion" value={email} onChange={(e) => setEmail(e.target.value)}></TextField>
      </div>
      
      <div className="form-group">  
      <TextField type="password" label="Password" id="standard-basic" variant="standard" className="proportion" value={password} onChange={(e) => setPassword(e.target.value)}></TextField>
      </div>
      <p className="password-requirements">
        Please ensure your password has at least 8 characters, includes an uppercase letter, a digit, and a special character.
      </p>
      <div className="buttons-container">
      <button className="register-button" onClick={handleRegistration}>
        Register
      </button>
      <button className="login-redirect-button" onClick={redirectToLogin}>
        Already have an account? Login!
      </button>
    </div>

    </div>
    </div>
  );
}

export default Registration;