import React, { useState } from "react";
import firebase from "./firebase";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import "./Registration.css";

function Registration() {
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
      major: major

    });
  };

  const handleRegistration = async () => {
    if (!isPasswordStrong(password)) {
      alert("Password is too weak. Please ensure your password has at least 8 characters, includes an uppercase letter, a lowercase letter, a digit, and a special character.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      writeUserData(userCredential.user.uid, firstName, lastName, email, birthday, school, major);
      console.log("Success");
      // REDIRECT TO LOGIN PAGE
    } catch (error) {
      alert("Something went wrong, Please try again.")
      console.error(error);
    }
  };

  return (
    <div className="registration-container">
      <div>
      <h2>Student Registration</h2>

      <div className="form-group">
      <input type="first name" placeholder="First Name" onChange={(e) => setFirstName(e.target.value)} />
      </div>

      <div className="form-group">
      <input type="last name" placeholder="Last Name" onChange={(e) => setLastName(e.target.value)} />     
      </div>

      <div className="form-group">
      <input type="date" placeholder="Birthday" onChange={(e) => setBirthday(e.target.value)} />    
      </div>

      <div className="form-group">
      <input type="school" placeholder="School" onChange={(e) => setSchool(e.target.value)} />     
      </div>

      <div className="form-group">
      <input type="major" placeholder="Major" onChange={(e) => setMajor(e.target.value)} />     
      </div>

      <div className="form-group">
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)}/>
      </div>
      
      <div className="form-group"> <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>
      </div>
      <p className="password-requirements">
        Please ensure your password has at least 8 characters, includes an uppercase letter, a digit, and a special character.
      </p>
      <button className="register-button" onClick={handleRegistration}>
        Register
        </button>
    </div>
    </div>
  );
}

export default Registration;
