// src/components/Logout.js
import React from "react";
import firebase from "./firebase";
import { getAuth, signOut } from "firebase/auth";

function Logout() {
  const auth = getAuth();
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Signed out")
      // User logged out successfully
    } catch (error) {
      // Handle logout errors
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Logout</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Logout;
