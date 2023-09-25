import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import emailjs from "@emailjs/browser";
import './Login.css'; 
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom"; 


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [randomCode, setRandomCode] = useState(null);
  const [userCode, setUserCode] = useState("");
  const auth = getAuth();

  const sendVerificationCode = async () => {
    try {
      // Check if credentials are correct by attempting to sign in
      await signInWithEmailAndPassword(auth, email, password);

      // If signInWithEmailAndPassword doesn't throw an error, credentials are correct
      const min = 100000;
      const max = 999999;
      const generatedCode = Math.floor(Math.random() * (max - min + 1)) + min;
      setRandomCode(generatedCode);

      const formValues = {
        toemail: email,
        message: generatedCode,
      };

      emailjs
        .send(
          "service_obyxgvu",
          "template_zhy667a",
          formValues,
          "BujL3gtXVBlpKdIYE"
        )
        .then(
          (result) => {
            alert("Code has been sent. Check your email!");
            console.log("Code has been sent");
          },
          (error) => {
            console.log(error.text);
          }
        );
    } catch (error) {
      console.error("Invalid credentials:", error);
      alert("Invalid credentials. Please try again.");
    }
  };

  const verifyCode = async () => {
    if (parseInt(userCode) === randomCode) {
      console.log("Verification successful");
      setRandomCode(null);
    } else {
      console.log("Verification failed");
      alert("Verification failed. Please try again.");
    }
  };

  return (
    <div>
      <h2>Login</h2>
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
      {/* Add a black "Send Verification Code" button */}
      <button className="send-verification-button" onClick={sendVerificationCode}>
        Send Verification Code
      </button>

      {randomCode && (
        <div>
          <h3>Enter verification code sent to your email</h3>
          <input
            type="number"
            placeholder="Verification Code"
            onChange={(e) => setUserCode(e.target.value)}
          />
          <button onClick={verifyCode}>Verify and Login</button>
        </div>
      )}
    </div>
  );
}

export default Login;
