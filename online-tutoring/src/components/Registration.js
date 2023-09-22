import React, { useState } from "react";
import firebase from "../firebase";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

function Registration() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = getAuth();

  const isPasswordStrong = (password) => {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
    
    return password.length >= minLength && hasUppercase && hasLowercase && hasDigit && hasSpecialChar;
  }

  const handleRegistration = async () => {
    if (!isPasswordStrong(password)) {
      alert("Password is too weak. Please ensure your password has at least 8 characters, includes an uppercase letter, a lowercase letter, a digit, and a special character.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("Success");
      // REDIRECT TO LOGIN PAGE
    } catch (error) {
      alert("Something went wrong, Please try again.")
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Registration</h2>
      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <p> Please ensure your password has at least 8 characters, includes an uppercase letter, a lowercase letter, a digit, and a special character.</p>
      <button onClick={handleRegistration}>Register</button>
    </div>
  );
}

export default Registration;
