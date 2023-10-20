import React, { useState, useEffect } from "react";
import './Homepage.css'
import { getDatabase, ref, onValue, query, orderByChild, equalTo, set, get } from "firebase/database";
import { getAuth } from "firebase/auth";

function HomePage() {
  const [userData, setUserData] = useState({});
  const [userType, setUserType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [checkedSubjects, setCheckedSubjects] = useState({});
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);


  const auth = getAuth();
  const db = getDatabase();

  const subjects = ["Math", "English", "Science", "History"]; // You can extend this list

  // Fetch students's upcoming appointments with tutors
  const fetchUpcomingAppointments = async () => {
    const appointmentsRef = ref(db, `appointments`);
    const snapshot = await get(appointmentsRef);
    const allAppointments = snapshot.val();
    const userAppointments = Object.values(allAppointments || {}).filter(appointment => appointment.userId === auth.currentUser.uid);
  
    // Fetching tutor names for each appointment
    const populatedAppointments = await Promise.all(userAppointments.map(async appointment => {
      const tutorRef = ref(db, 'tutors/' + appointment.tutorId);
      const tutorSnapshot = await get(tutorRef);
      const tutorData = tutorSnapshot.val();
      appointment.tutorName = tutorData.first_name + ' ' + tutorData.last_name;
      return appointment;
    }));
  
    setUpcomingAppointments(populatedAppointments);
  };
  
  // Fetch tutor's appointments with students
  const fetchTutorAppointments = () => {
    const appointmentsRef = ref(db, `appointments`);
    onValue(appointmentsRef, async (snapshot) => {
      const allAppointments = snapshot.val();
      const tutorAppointments = Object.values(allAppointments || {}).filter(appointment => appointment.tutorId === auth.currentUser.uid);

      // Fetching student names for each appointment
      const populatedAppointments = [];
      for (let appointment of tutorAppointments) {
        const studentRef = ref(db, 'users/' + appointment.userId);
        const studentSnapshot = await get(studentRef);  // <-- Use get instead of onValue
        const studentData = studentSnapshot.val();
        appointment.studentName = studentData.first_name + ' ' + studentData.last_name;
        populatedAppointments.push(appointment);
      }

      setUpcomingAppointments(populatedAppointments);
    });
};


  // Handle search for tutors based on name or subjects
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

  // Handle scheduling of new appointments
  const handleScheduleAppointment = async () => {
    const newAppointment = {
      tutorId: selectedTutor.id,
      userId: auth.currentUser.uid,
      date: appointmentDate,
      time: appointmentTime
      // if you decide to include subject, add it here
    };

    try {
      await set(ref(db, `appointments/${auth.currentUser.uid}_${selectedTutor.id}`), newAppointment);
      setShowScheduleModal(false);  // Close the modal
      alert("Appointment scheduled successfully!");  // Just for feedback
    } catch (error) {
      console.error("Error scheduling appointment:", error);
      alert("There was an error scheduling the appointment. Please try again.");
    }
  };

  // Add tutor to user's favorite list
  const addFavoriteTutor = (tutorName) => {
    // Check if the tutor is already in the favorite list
    if (userData.favoriteTutors && userData.favoriteTutors.includes(tutorName)) {
      alert(`${tutorName} is already in your favorites!`);
      return;
    }

    const updatedFavorites = userData.favoriteTutors ? [...userData.favoriteTutors, tutorName] : [tutorName];

    set(ref(db, `users/${auth.currentUser.uid}/favoriteTutors`), updatedFavorites);
    setUserData(prevState => ({ ...prevState, favoriteTutors: updatedFavorites }));
  };

  // Remove tutor from user's favorite list
  const handleDeleteFavorite = async (tutorId) => {
    // Create a copy of the favoriteTutors array without the selected tutorId
    const updatedFavorites = userData.favoriteTutors.filter(id => id !== tutorId);

    // Update the user's favoriteTutors data in the database
    await set(ref(db, 'users/' + auth.currentUser.uid + '/favoriteTutors'), updatedFavorites);

    // Update local state
    setUserData(prevData => ({
      ...prevData,
      favoriteTutors: updatedFavorites
    }));
  };

  // Handle change in subject checkboxes
  const handleSubjectChange = (subject) => {
    setSearchResults([]);  // Clear the search results
    setCheckedSubjects(prevState => ({
      ...prevState,
      [subject]: !prevState[subject]
    }));
  };

  // Fetch user data on component mount and decide whether the user is a general user or a tutor
  useEffect(() => {
    if (auth.currentUser) {
      // First, try to find the user in the /users branch
      const userRef = ref(db, 'users/' + auth.currentUser.uid);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setUserData(data);
          setUserType("user");
          fetchUpcomingAppointments();
        } else {
          // If not found in /users, try the /tutors branch
          const tutorRef = ref(db, 'tutors/' + auth.currentUser.uid);
          onValue(tutorRef, (snapshot) => {
            const tutorData = snapshot.val();
            if (tutorData) {
              setUserData(tutorData);
              setUserType("tutor");
              fetchUpcomingAppointments();
  
              if (userType === "tutor") {
                fetchTutorAppointments();
              }
            }
          });
        }
      });
    }
  }, [auth, db, userType]);
  


  // If userData hasn't been fetched yet, show loading state
  if (!userData.first_name) return <div>Please login</div>;

  
  // If the user is a tutor, show the tutor-specific homepage
if (userType === "tutor") {
  return (
    <div>
      <h2>Welcome Back, Tutor {userData.first_name} {userData.last_name}!</h2>
        <p>About Me: {userData.about_me}</p>
        <p>Available Hours: {userData.available_hours}</p>
      
      <h3>Your Upcoming Appointments with Students</h3>
      {upcomingAppointments.map((appointment, index) => (
        <div key={index}>
          <p>Student: {appointment.studentName}</p>
          <p>Date: {appointment.date}</p>
          <p>Time: {appointment.time}</p>
          {/* Add more appointment details if needed */}
        </div>
      ))}
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
            <h3>{tutor.first_name} {tutor.last_name}</h3>
            <h4>{tutor.phone_number}</h4>
            <p>Subjects: {Object.keys(tutor.subjects).filter(subject => tutor.subjects[subject] === true).join(', ')}</p>
            <button onClick={() => addFavoriteTutor(`${tutor.first_name} ${tutor.last_name}`)}>Add to Favorites</button>
            <button onClick={() => { setSelectedTutor(tutor); setShowScheduleModal(true); }}>Schedule Appointment</button>
            {/* Display other tutor details if needed */}
          </div>
        ))}
      </div>

      {/*Display favorite tutor list*/}
      <div>
        <h4>----Favorite Tutors----</h4>
        {userData.favoriteTutors && userData.favoriteTutors.map(tutorId => (
          <div key={tutorId}>
            {tutorId}
            <button onClick={() => handleDeleteFavorite(tutorId)}>Delete</button>
          </div>
        ))}
      </div>
      
      {/*Display upcoming appointments*/}
      <div>
        <h3>Your Upcoming Appointments</h3>
        {upcomingAppointments.map((appointment, index) => (
          <div key={index}>
            <p>Tutor: {appointment.tutorName}</p> {/* Updated line */}
            <p>Date: {appointment.date}</p>
            <p>Time: {appointment.time}</p>
            {/* Add more appointment details if needed */}
          </div>
        ))}
      </div>

      {/*Code for the popup that displays when user trys to schedule appointment*/}
      {/* DONT MESS W IT :) */}  
      {showScheduleModal && (
        <div className="modal">
          <h3>Schedule an appointment with {selectedTutor.first_name} {selectedTutor.last_name}</h3>
          <input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} />
          <input type="time" value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} />
          <button onClick={handleScheduleAppointment}>Confirm Appointment</button>
          <button onClick={() => setShowScheduleModal(false)}>Cancel</button>
        </div>
      )}
      {/* DONT MESS W IT :) */} 

    </div>//End div for entire return statement
  );
}

export default HomePage;
