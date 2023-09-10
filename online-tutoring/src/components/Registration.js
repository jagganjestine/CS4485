// src/components/Registration.js
import React, { useState } from "react";
import firebase from "../firebase";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";


function Registration() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = getAuth();

  const handleRegistration = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // User registered successfully
      console.log("Success");
    } catch (error) {
      // Handle registration errors
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
      <button onClick={handleRegistration}>Register</button>
    </div>
  );
}

export default Registration;
