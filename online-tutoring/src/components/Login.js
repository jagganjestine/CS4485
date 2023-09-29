import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import emailjs from "@emailjs/browser";
import './Login.css'; 
import firebase from "./firebase";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom"; 
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import './Login.css'; 


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
            // alert("Code has been sent. Check your email!");
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
      var userUID = auth.currentUser.uid;
      console.log(userUID); // This will grab the current user logged in

      // POST this to backend so that we can access it
      // axios.post('/set-uid', {uid: 'userUID'})
      
      // FLASK CODE
      /*
      @app.route('/set-uid', methods=['POST'])
      def set_uid():
        global UID
        UID = request.form['uid']
        return "OK"
      */
      


    } else {
      console.log("Verification failed");
      alert("Verification failed. Please try again.");
    }
  };

  return (
    <div>
      <div className="login-container">
      <div className="login-form">
      <h1 className="login-title">Login</h1>

      {/*Text field for email and password*/}
      <TextField
      type="email"
      label="Email"
      variant="standard"
      className="proportion"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
    <div style={{ marginBottom: '20px' }} /> 

    <TextField
      type="password"
      label="Password"
      variant="standard"
      className="proportion"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />


<div className="remember-me">
    <input
      type="checkbox"
      id="rememberMe"
      name="rememberMe"
    />
    <label htmlFor="rememberMe">Remember Me</label> {/*ADD LINK TO REMEMBER ME*/ }
  </div>

  <div style={{ marginBottom: '30px' }} /> 
      <button className="send-verification-button" onClick={sendVerificationCode}>
        Send Verification Code
      </button>
      <div style={{ marginBottom: '20px' }} /> 
      <div className="verification-code-container">
      <TextField
        type="number"
        label="Verification Code"
        variant="standard"
        className="verification-code"
        value={userCode}
        onChange={(e) => setUserCode(e.target.value)}
      />
            <div style={{ marginBottom: '20px' }} />

      {randomCode && (
        <div>
          <h3>Enter verification code sent to your email</h3>
          <input
            type="number"
            placeholder="Verification Code"
            onChange={(e) => setUserCode(e.target.value)}
          />
\        </div>
      )}

   <button
      className="verify-login-button"
      style={{ marginLeft: '70px' }}
      onClick={verifyCode}> Verify and Login </button>

    <div className="sign-up-container">
    <p>Don't have an account?</p>
    <Link to="/registration"> <button className="sign-up-button">Sign Up</button> </Link>
    </div>

      </div>
      </div>
    </div>
    </div>
  );
}

export default Login;