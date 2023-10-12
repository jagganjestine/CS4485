import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue, query, orderByChild, equalTo } from "firebase/database";
import { getAuth } from "firebase/auth";

function HomePage() {
  const [userData, setUserData] = useState({});
  const [userType, setUserType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [checkedSubjects, setCheckedSubjects] = useState({});
  const auth = getAuth();
  const db = getDatabase();

  const subjects = ["Math", "English", "Science", "History"]; // You can extend this list

  const handleSearch = () => {
    const tutorsRef = ref(db, 'tutors');
    
    onValue(tutorsRef, (snapshot) => {
      const tutorsData = snapshot.val();
      const tutorsArray = Object.entries(tutorsData || {}).filter(([, data]) => {
        const doesNameMatch = searchQuery.trim() !== "" && (
          data.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          data.last_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
  
        const areSubjectsChecked = Object.keys(checkedSubjects).length > 0;
        const doesSubjectMatch = areSubjectsChecked && subjects.some(subject => {
          return checkedSubjects[subject] && data.subjects && data.subjects[subject];
        });
  
        // If searchQuery is empty and subjects are checked, only consider subject match
        if (searchQuery.trim() === "" && areSubjectsChecked) {
          return doesSubjectMatch;
        }
  
        return doesNameMatch || doesSubjectMatch;
      }).map(([id, data]) => ({ id, ...data }));
  
      setSearchResults(tutorsArray);
    });
  };
  
  const handleSubjectChange = (subject) => {
    setSearchResults([]);  // Clear the search results
    setCheckedSubjects(prevState => ({
      ...prevState,
      [subject]: !prevState[subject]
    }));
  };
  

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
if (!userData.first_name) return <div>Please login</div>;

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

// If the user is a general user
return (
  <div>
    <h2>Welcome Back, {userData.first_name} {userData.last_name}!</h2>
    <p>Your School: {userData.school}</p>
    <p>Your Major: {userData.major}</p>

    {/* Search functionality */}
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search for tutors by name"
    />
    <button onClick={handleSearch}>Search</button>
    <div>
      {subjects.map(subject => (
        <label key={subject}>
          <input type="checkbox" checked={checkedSubjects[subject] || false} onChange={() => handleSubjectChange(subject)} />
          {subject}
        </label>
      ))}
    </div>

    {/* Display search results */}
    <div>
      {searchResults.map(tutor => (
        <div key={tutor.id}>
          <h3>{tutor.first_name} {tutor.last_name} {tutor.phone_number}</h3>
          <p>Subjects: {Object.keys(tutor.subjects).filter(subject => tutor.subjects[subject] === true).join(', ')}</p>
          {/* Display other tutor details if needed */}
        </div>
      ))}
    </div>
  </div>
);
}

export default HomePage;
