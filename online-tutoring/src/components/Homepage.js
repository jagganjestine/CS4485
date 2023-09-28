import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";

function HomePage() {
  const [userData, setUserData] = useState({});
  const [userType, setUserType] = useState(""); // "user" or "tutor"
  const auth = getAuth();
  const db = getDatabase();


  useEffect(() => {
    if (auth.currentUser) {
      // First, try to find the user in the /users branch
      const userRef = ref(db, 'users/' + auth.currentUser.uid);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setUserData(data);
          setUserType("user");
        } else {
          // If not found in /users, try the /tutors branch
          const tutorRef = ref(db, 'tutors/' + auth.currentUser.uid);
          onValue(tutorRef, (snapshot) => {
            const tutorData = snapshot.val();
            if (tutorData) {
              setUserData(tutorData);
              setUserType("tutor");
            }
          });
        }
      });
    }
  }, [auth, db]);

  // If userData hasn't been fetched yet, show loading state
  if (!userData.first_name) return <div>Loading...</div>;

  // If the user is a tutor, show the tutor-specific homepage
  if (userType === "tutor") {
    return (
      <div>
        <h2>Welcome Back, Tutor {userData.first_name} {userData.last_name}!</h2>
       
        <p>About Me: {userData.about_me}</p>
        <p>Available Hours: {userData.available_hours}</p>
        {/* Add more tutor-specific details here */}
      </div>
    );
  }

  // Default to the general user homepage
  return (
    <div>
      <h2>Welcome Back, {userData.first_name} {userData.last_name}!</h2>
      <p>Your School: {userData.school}</p>
      <p>Your Major: {userData.major}</p>
      {/* You can display other user information as needed */}
    </div>
  );
}

export default HomePage;
