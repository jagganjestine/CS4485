import React, { useState, useEffect } from "react";
import './Homepage.css'
import { getDatabase, ref, onValue, query, orderByChild, equalTo, set, get, remove } from "firebase/database";
import { getAuth } from "firebase/auth";
import {getDownloadURL, getStorage, ref as sRef} from "firebase/storage"
import { getTableSortLabelUtilityClass } from "@mui/material";
import Text from '@mui/material/TextField';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import trophy from '../images/trophy.png'
import cap from '../images/cap.png'
import medal from '../images/medal.png'

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
  const [imageURL, setImageURL] = useState("");
  


  const auth = getAuth();
  const db = getDatabase();
  const storage = getStorage();

  const subjects = ["Math", "English", "Science", "History"]; // You can extend this list

  // Fetch students's upcoming appointments with tutors
  const fetchUpcomingAppointments = () => {
    const appointmentsRef = ref(db, `appointments`);
    onValue(appointmentsRef, async (snapshot) => {
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
    });
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

// Cancel appointments fucntion for both tutor and students
const handleCancelAppointment = async (appointmentId) => {
  try {
    const appointmentRef = ref(db, `appointments/${appointmentId}`);
    await remove(appointmentRef); // This will delete the appointment entry

    // Now, fetch the updated list
    if (userType === "user") {
      fetchUpcomingAppointments();
    } else {
      fetchTutorAppointments();
    }
    alert("Appointment canceled successfully!");
  } catch (error) {
    console.error("Error canceling appointment:", error);
    alert("There was an error canceling the appointment. Please try again.");
  }
};

// Helper function to validate appointment time and date
const isFutureDate = (date, time) => {
  const appointmentDateTime = new Date(date + " " + time);
  const currentDateTime = new Date();
  return appointmentDateTime > currentDateTime;
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
    const appointmentId = `${auth.currentUser.uid}_${selectedTutor.id}_${Date.now()}`; // Retain the unique identifier
  
    const newAppointment = {
      id: appointmentId,
      tutorId: selectedTutor.id,
      userId: auth.currentUser.uid,
      date: appointmentDate,
      time: appointmentTime
      // if you decide to include subject, add it here
    };
  
    // 1. Check if the selected date and time are in the past
    const selectedDateTime = new Date(appointmentDate + " " + appointmentTime);
    const currentDateTime = new Date();
  
    if (selectedDateTime <= currentDateTime) {
      alert("You cannot schedule appointments in the past!");
      return;
    }
  
    // 2. Check if there's already an appointment at the selected date and time
    const appointmentsRef = ref(db, 'appointments');
    const existingAppointmentsQuery = query(
      appointmentsRef,
      orderByChild('tutorId'),
      equalTo(selectedTutor.id)
    );
  
    try {
      const snapshot = await get(existingAppointmentsQuery);
      const existingAppointments = snapshot.val();
  
      if (existingAppointments) {
        for (let existingAppointmentId in existingAppointments) {
          let appointment = existingAppointments[existingAppointmentId];
          if (appointment.date === appointmentDate && appointment.time === appointmentTime) {
            alert("This time slot is already booked with the selected tutor!");
            return;
          }
        }
      }
  
      // If no conflicting appointments, proceed to schedule the appointment
      await set(ref(db, `appointments/${appointmentId}`), newAppointment);
      setShowScheduleModal(false);  // Close the modal
      alert("Appointment scheduled successfully!");  // Feedback
      fetchUpcomingAppointments(); // Refresh the list of upcoming appointments
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
  const fetchImageURL = async () => {
    try {
      const imageRef = sRef(storage, `profile_pictures/${auth.currentUser.uid}`);
      const url = await getDownloadURL(imageRef);
      setImageURL(url);
    } catch (error) {
      console.error("Error fetching image URL:", error);
    }
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
                fetchImageURL();
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
      <img src={imageURL} alt = "Profile" className = "profileImage"/>
        <p>About Me: {userData.about_me}</p>
        <p>Available Hours: {userData.available_hours}</p>
        
        
          
      <h3>Your Upcoming Appointments with Students</h3>
      {upcomingAppointments.map((appointment, index) => (
        <div key={index}>
          <p>Student: {appointment.studentName}</p>
          <p>Date: {appointment.date}</p>
          <p>Time: {appointment.time}</p>
          <button onClick={() => handleCancelAppointment(appointment.id)}>Cancel</button>
          {/* Add more appointment details if needed */}
        </div>
      ))}
    </div>
  );
}

// used to reformat date for upcoming appointments (student hp)
function formatDate(inputDate) {
  const date = new Date(inputDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${month}/${day}/${year}`;
}

// used to reformat time for upcoming appointments (student hp)
function formatTime(inputTime) {
  const time = inputTime.split(":");
  const hours = parseInt(time[0]);
  const minutes = time[1];
  const amOrPm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours > 12 ? hours - 12 : hours;
  return `${formattedHours}:${minutes} ${amOrPm}`;
}

  // If the user is a general user
  return (
    <div >
      <div className="purple-panel-student">
      <h1 className="panel-title-student">Your Stats:</h1>
      <h1 className="classes-panel-student">Classes</h1>
      <img className="trophy-student" src={trophy} />
      <h1 className="hours-panel-student">Hours</h1>
      <img className="medal-student" src={medal} />
      <h1 className="subject-panel-student">Top Subject:</h1>
      <img className="cap-student" src={cap} />
      </div>
      {/*<h2>Welcome Back, {userData.first_name} {userData.last_name}!</h2>
      <p>Your School: {userData.school}</p>
  <p>Your Major: {userData.major}</p>*/}

      {/* Search functionality */}
      <input className="search-bar"
        type="text" 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder=" Search..."
      /> 
      <button onClick={handleSearch}><FontAwesomeIcon icon={faSearch} /></button>
      <div style={{ paddingTop: '20px' }} />  {/* test padding */}
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
      <div className = "dashboard-container-student">
      <div className= "favorite-tutors">
      <h5 className="favorite-tutor-title" > My Favorites List:</h5>
        {userData.favoriteTutors && userData.favoriteTutors.map(tutorId => (
          <div key={tutorId}>
            {tutorId}
            <button className= "delete-button-student" onClick={() => handleDeleteFavorite(tutorId)}>Delete</button>
          </div>
        ))}
      </div>
      
      {/*Display upcoming appointments*/}
<div>
  
{upcomingAppointments.map((appointment, index) => (
  <div className="upcoming-appts-student" key={index}>
    <h5 className="appt-title-student">Upcoming Appointments:</h5>
    <p>
    <span className="tutor-appointment-name"> {appointment.tutorName} </span> 
    <span className="tutor-appointment-date-time">
      {formatDate(appointment.date)} at {formatTime(appointment.time)} </span> 
      <button className="cancel-button-student" onClick={() => handleCancelAppointment(appointment.id)}>Cancel</button>
    </p>
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

    </div>
    </div>
  );
}

export default HomePage;
