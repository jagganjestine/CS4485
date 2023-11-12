import React, { useState, useEffect } from "react";
import './Homepage.css'
import { getDatabase, ref, onValue, query, orderByChild, equalTo, set, get, remove } from "firebase/database";
import { getAuth, signOut } from "firebase/auth";
import {getDownloadURL, getStorage, ref as sRef} from "firebase/storage"
import { getTableSortLabelUtilityClass } from "@mui/material";
import Text from '@mui/material/TextField';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Swal from "sweetalert2";
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

  const subjects = ["Math", "English", "Science", "History"]; // You can extend this list
  const numberOfSubjectsTaught = Object.keys(userData.subjects || {}).filter(subject => userData.subjects[subject] === true).length;

  
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

// Cancel appointments function for both tutor and students
const handleCancelAppointment = async (appointmentId) => {
  const appointmentRef = ref(db, `appointments/${appointmentId}`);

  try {
    const appointmentSnapshot = await get(appointmentRef);
    const appointment = appointmentSnapshot.val();

    if (appointment) {
      const appointmentDateTime = new Date(appointment.date + "T" + appointment.time);
      const currentDateTime = new Date();
      const timeDifference = appointmentDateTime - currentDateTime;

      // Check if the appointment is more than 24 hours away
      if (timeDifference > 24 * 60 * 60 * 1000) {
        await remove(appointmentRef); // This will delete the appointment entry

        if (userType === "user") {
          fetchUpcomingAppointments();
        } else {
          fetchTutorAppointments();
        }

        Swal.fire({
          icon: 'success',
          title: 'Appointment Cancelled',
          text: 'Appointment canceled successfully!',
        });
      } else {
        // Use SweetAlert to inform the user that they can't cancel the appointment
        Swal.fire({
          icon: 'error',
          title: 'Cancellation Not Allowed',
          text: 'You cannot cancel an appointment less than 24 hours in advance.',
        });
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Appointment Not Found',
        text: 'The appointment could not be found.',
      });
    }
  } catch (error) {
    console.error("Error canceling appointment:", error);
    Swal.fire({
      icon: 'error',
      title: 'Error Canceling Appointment',
      text: 'There was an error canceling the appointment. Please try again.',
    });
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
      //alert("You cannot schedule appointments in the past!");
      Swal.fire({
        icon: 'error',
        title: 'Error Scheduling Appointment',
        text: 'You cannot schedule appointments in the past!',
    });
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
            //alert("This time slot is already booked with the selected tutor!");
            Swal.fire({
              icon: 'warning',
              title: 'Time Conflict',
              text: 'This time slot is already booked with the selected tutor!',
          });
            return;
          }
        }
      }
  
      // If no conflicting appointments, proceed to schedule the appointment
      await set(ref(db, `appointments/${appointmentId}`), newAppointment);
      setShowScheduleModal(false);  // Close the modal
      //alert("Appointment scheduled successfully!");  // Feedback
      Swal.fire({
        icon: 'success',
        title: 'Appointment Confirmed',
        text: 'Appointment scheduled successfully!',
    });
      fetchUpcomingAppointments(); // Refresh the list of upcoming appointments
    } catch (error) {
      console.error("Error scheduling appointment:", error);
      //alert("There was an error scheduling the appointment. Please try again.");
      Swal.fire({
        icon: 'error',
        title: 'Error Scheduling Appointment',
        text: 'There was an error scheduling the appointment. Please try again.',
    });
    }
  };
  
  
  

  // Add tutor to user's favorite list
  const addFavoriteTutor = (tutorName) => {
    // Check if the tutor is already in the favorite list
    if (userData.favoriteTutors && userData.favoriteTutors.includes(tutorName)) {
      //alert(`${tutorName} is already in your favorites!`);
      Swal.fire({
        icon: 'warning',
        title: 'Tutor Favorited',
        text: `${tutorName} is already in your favorites!`,
    });
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
              setUserType("Tutor");
              fetchUpcomingAppointments();
              
  
              if (userType === "Tutor") {
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
if (userType === "Tutor") {
  
  return (
    <div>
      <div className="purple-panel-student">
      <h1 className="panel-title-student">Your Stats:</h1>
      <h1 className="classes-panel-student">Classes: {numberOfSubjectsTaught}
       </h1>
      <img className="trophy-student" src={trophy} />
      <h1 className="hours-panel-student">Hours</h1>
      <img className="medal-student" src={medal} />
      <h1 className="subject-panel-student">Top Subject:</h1>
      <img className="cap-student" src={cap} />
      <div className="tutor-logout">
      <button className="tutor-logout-button" onClick={handleLogout}>Logout</button>
      </div>
      </div>
      <div className="profile-container">
        <img src={imageURL} alt = "Profile" className = "profileImage"/>
        <div className="profile-text-container">
          <p className="edit-profile">Edit Profile</p>
          <p className="profile-name"> <strong>Name:</strong> {userData.first_name + " " + userData.last_name}</p>
          <p className="profile-status"> <strong>Status:</strong> {userType}</p>
          <p className="profile-subjects"><strong>Subjects: </strong> 
          {Object.keys(userData.subjects || {}).filter(subject => userData.subjects[subject] === true).join(', ')}
          </p>
          <p className="about-me"><strong>About Me:</strong> {userData.about_me}</p>
          <p className="available-hours"><strong>Available Hours:</strong> {userData.available_hours}</p>
        </div>
      </div>

      <div className="appts-container"> 
        <div className="upcoming-appointments">
          <h3> <span className="upappt">Upcoming Appointments:</span></h3>
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
      </div>

      <br></br>
      
      <div className="notif-container">
        <div className="tutor-notifications">Notifications:</div>
      </div>
    </div>
  );
}


  // If the user is a general user
  return (
    <div>
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
      <p>Tutor: {appointment.tutorName}</p>
      <p>Date: {appointment.date}</p>
      <p>Time: {appointment.time}</p>
      <button onClick={() => handleCancelAppointment(appointment.id)}>Cancel</button>
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
