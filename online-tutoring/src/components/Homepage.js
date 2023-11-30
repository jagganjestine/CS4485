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
import appt from '../images/appt.jpg'
import fav from '../images/favorites.png'
import Checkbox from '@mui/material/Checkbox';
import { grey } from '@mui/material/colors';



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
  const [allChecked, setAllChecked] = useState(false);


  const auth = getAuth();
  const db = getDatabase();
  const storage = getStorage();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Signed out")
      Swal.fire({
        icon: 'success',
        title: 'Logged out.',
        text: 'You have been successfully signed out!',
      });
      window.localStorage.clear()
      window.location.href = "/"
      // User logged out successfully
    } catch (error) {
      // Handle logout errors
      console.error(error);
    }
  };
  
  // used to reformat date for upcoming appointments (student hp)
function formatDate(inputDate) {
  // Append 'T00:00:00' to make sure the date is parsed in local time
  const date = new Date(`${inputDate}T00:00:00`);
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

const handleAllChecked = (event) => {
  const checked = event.target.checked;
  setAllChecked(checked);
  
  // If 'All Subjects' is checked, set all individual subjects to true, otherwise set to false
  const newCheckedSubjects = {};
  subjects.forEach(subject => {
    newCheckedSubjects[subject] = checked;
  });
  setCheckedSubjects(newCheckedSubjects);

  // If all subjects are checked, modify the handleSearch to search without subject filters
  if (checked) {
    setSearchResults([]); // Optional: Clear previous search results
    // Call the search function without subject filter or modify the search function accordingly
    handleSearch();
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

      // Apply the 24-hour check only for students
      if (userType === "user" && timeDifference <= 24 * 60 * 60 * 1000) {
        Swal.fire({
          icon: 'error',
          title: 'Cancellation Not Allowed',
          text: 'You cannot cancel an appointment less than 24 hours in advance.',
        });
        return;
      }

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
      const appointmentId = `${auth.currentUser.uid}_${selectedTutor.id}_${Date.now()}`;
  
      // Fetch the selected tutor's available hours
      const tutorRef = ref(db, `tutors/${selectedTutor.id}`);
      const tutorSnapshot = await get(tutorRef);
      const tutorData = tutorSnapshot.val();

      if (!tutorData) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Tutor data not found!',
        });
        return;
      }

      if (!appointmentTime) {
        Swal.fire({
          icon: 'error',
          title: 'No Time Selected',
          text: 'Please select a time for the appointment.',
        });
        return;
      }

      const { start_Time, end_Time } = tutorData;
      const selectedDateTime = new Date(appointmentDate + "T" + appointmentTime);
      const startTime = new Date(appointmentDate + "T" + start_Time);
      const endTime = new Date(appointmentDate + "T" + end_Time);

      // Check if the selected time is within tutor's available hours
      if (selectedDateTime < startTime || selectedDateTime > endTime) {
        Swal.fire({
          icon: 'error',
          title: 'Unavailable Time Slot',
          text: 'This time is outside the tutor\'s available hours!',
        });
        return;
      }

      const currentDateTime = new Date();
      if (selectedDateTime <= currentDateTime) {
        Swal.fire({
          icon: 'error',
          title: 'Error Scheduling Appointment',
          text: 'You cannot schedule appointments in the past!',
        });
        return;
      }

      // Check for conflicting appointments
      const appointmentsRef = ref(db, 'appointments');
      const existingAppointmentsQuery = query(appointmentsRef, orderByChild('tutorId'), equalTo(selectedTutor.id));
      try {
        const snapshot = await get(existingAppointmentsQuery);
        const existingAppointments = snapshot.val();
        if (existingAppointments) {
          for (let existingAppointmentId in existingAppointments) {
            let appointment = existingAppointments[existingAppointmentId];
            const existingAppointmentTime = new Date(appointment.date + "T" + appointment.time);

            // Check if the selected time is within one hour of an existing appointment
            if (appointment.date === appointmentDate &&
              Math.abs(selectedDateTime - existingAppointmentTime) < 3600000) {
              Swal.fire({
                icon: 'warning',
                title: 'Time Conflict',
                text: 'This time slot is already booked or too close to another booking with the selected tutor!',
              });
              return;
            }
          }
        }

        const newAppointment = {
          id: appointmentId,
          tutorId: selectedTutor.id,
          userId: auth.currentUser.uid,
          date: appointmentDate,
          time: appointmentTime
        };

        // Schedule the appointment
        await set(ref(db, `appointments/${appointmentId}`), newAppointment);
        setShowScheduleModal(false);
        Swal.fire({
          icon: 'success',
          title: 'Appointment Confirmed',
          text: 'Appointment scheduled successfully!',
        });
        fetchUpcomingAppointments();
      } catch (error) {
        console.error("Error scheduling appointment:", error);
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

  // Helper function to increment hours
const incrementHours = async (userId, userType) => {
  const userRef = ref(db, `${userType}/${userId}`);
  const userSnapshot = await get(userRef);
  const userData = userSnapshot.val();
  
  const newHours = (userData.hours || 0) + 1; // Increment hours by 1
  await set(ref(db, `${userType}/${userId}/hours`), newHours);
};

// Modify this function to increment total hours count
const deletePastAppointments = async () => {
  const appointmentsRef = ref(db, 'appointments');
  const snapshot = await get(appointmentsRef);
  const allAppointments = snapshot.val();

  if (allAppointments) {
    for (const appointmentId in allAppointments) {
      const appointment = allAppointments[appointmentId];
      const appointmentDateTime = new Date(appointment.date + 'T' + appointment.time);
      const currentDateTime = new Date();

      if (appointmentDateTime < currentDateTime) {
        // Increment hours before deleting the appointment
        await incrementHours(appointment.userId, 'users'); // for student
        await incrementHours(appointment.tutorId, 'tutors'); // for tutor
        
        // Now remove the appointment
        await remove(ref(db, `appointments/${appointmentId}`));
      }
    }

    // Fetch updated upcoming appointments
    fetchUpcomingAppointments();
  }
};
  // Fetch user data on component mount and decide whether the user is a general user or a tutor
  const fetchData = async () => {
    if (auth.currentUser) {
      const userRef = ref(db, 'users/' + auth.currentUser.uid);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();

      if (userData) {
        setUserData(userData);
        setUserType("user");
        fetchUpcomingAppointments();
      } else {
        const tutorRef = ref(db, 'tutors/' + auth.currentUser.uid);
        const tutorSnapshot = await get(tutorRef);
        const tutorData = tutorSnapshot.val();

        if (tutorData) {
          setUserData(tutorData);
          setUserType("Tutor");
          fetchTutorAppointments();
          fetchImageURL();
        }
      }
      deletePastAppointments();
    }
  };
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchData();
      }
    });

    return () => unsubscribe(); // Clean up the subscription
  }, [auth]);
  


  // If userData hasn't been fetched yet, show loading state
  // if (!userData.first_name) return <div>Please login</div>;

  
  // If the user is a tutor, show the tutor-specific homepage
if (userType === "Tutor") {
  
  return (
    <div>
    <div className="sidebar-tutor">
      <div className="purple-panel-tutor">
        <h1 className="panel-title-tutor">Your Stats:</h1>
        <h1 className="classes-panel-tutor"><span className="number-subjects-taught">{numberOfSubjectsTaught} </span>Classes <img className="trophy-tutor" src={trophy} /></h1>
        <h1 className="hours-panel-tutor">Hours: {userData.hours || 0}</h1>
        <img className="medal-tutor" src={medal} />
        <h1 className="subject-panel-tutor">Top Subject:</h1>
        <img className="cap-tutor" src={cap} />
        <div className="tutor-logout">
          <button className="tutor-logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
    <div className="profile-container">
      <img src={imageURL} alt = "Profile" className = "profileImage"/>
      <div className="profile-text-container">
        <p className="profile-name"> <span className="bold-words">Name:</span> {userData.first_name + " " + userData.last_name}</p>
        <p className="profile-status"> <span className="bold-words">Status:</span> {userType}</p>
        <p className="profile-subjects"><span className="bold-words">Subjects: </span> 
        {Object.keys(userData.subjects || {}).filter(subject => userData.subjects[subject] === true).join(', ')}
        </p>
        <p className="about-me"><span className="bold-words">About Me:</span> {userData.about_me}</p>
        <p className="available-hours"><span className="bold-words">Available Hours:</span> {userData.start_Time} - {userData.end_Time}</p>
      </div>
    </div>

    <div className="appts-container"> 
      <div className="upcoming-appointments">
        <h3> <span className="upappt">Upcoming Appointments:</span></h3>
        {upcomingAppointments.map((appointment, index) => (
          <div key={index}>
            <p className="appointment-details">
                <span className="appointment-name">{appointment.studentName}</span>
                <span className="appointment-date">{"\t" + " on " + formatDate(appointment.date)}</span>
                <div className="appt-time-cancel">
                  <span className="appointment-time">{"\t" + " at " + formatTime(appointment.time)}</span>
                  <button className="cancel-appointment" onClick={() => handleCancelAppointment(appointment.id)}>Cancel</button>
                </div>
            </p>
            {/* Add more appointment details if needed */}
          </div>
        ))}
      </div>
    </div>

    <br></br>
    
    <div className="notif-container">
      <div className="tutor-notifications">
         <span className="notifs-label">Notifications:</span>
        {upcomingAppointments.map((appointment, index) => (
          <div key={index}>
          <p className="notifs-details">
            <span className="appointment-name2">{appointment.studentName}</span>
            <span className="appointment-date2"> recently booked a {appointment.date} appointment</span>
          </p>
          {/* Add more appointment details if needed */}
        </div>
        ))}
      </div>
    </div>
  </div>
  );
}


  // If the user is a general user
  return (
    <div >
      <div className="purple-panel-student">
        <h1 className="panel-title-student">Your Stats:</h1>
        <h1 className="classes-panel-student">Classes</h1>
        <img className="trophy-student" src={trophy} />
        <h1 className="hours-panel-student">Hours: {userData.hours || 0}</h1>
        <img className="medal-student" src={medal} />
        <h1 className="subject-panel-student">Top Subject:</h1>
        <img className="cap-student" src={cap} />
        <div className="student-logout">
          <button className="student-logout-button" onClick={handleLogout}>Logout</button></div>
      </div>

      {/* Search functionality */}
      <input className="search-bar"
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder=" Search..."
      />
      <button className="search-bar-button" onClick={handleSearch}><FontAwesomeIcon icon={faSearch} /></button>
      <div>
        <label className="checkbox-font">
          <Checkbox
            checked={allChecked}
            onChange={handleAllChecked}
            color="primary"
          />
          All Tutors
        </label>
        {subjects.map(subject => (
          <label key={subject} className="checkbox-font">
            <Checkbox
              checked={checkedSubjects[subject] || false}
              onChange={() => handleSubjectChange(subject)}
              color="primary"
            />
            {subject}
          </label>
        ))}
      </div>


      {/* Display search results */}
      <div className="search-results-box-container">
        <div className="search-results-box">
          {searchResults.map(tutor => (
            <div key={tutor.id}>
              <div>
                <h3>{tutor.first_name} {tutor.last_name}
                  <button className="favorite-button" onClick={() => addFavoriteTutor(`${tutor.first_name} ${tutor.last_name}`)}>
                    <img className="star-fav" src={fav} /></button>
                  <button className="appt-schedule-button" onClick={() => {
                    setSelectedTutor(tutor);
                    setShowScheduleModal(true);
                  }}>Schedule Appointment</button></h3>
              </div>
              <h5>Subjects: {Object.keys(tutor.subjects).filter(subject => tutor.subjects[subject] === true).join(', ')}</h5>
              <h5>Available Hours: {formatTime(tutor.start_Time)} - {formatTime(tutor.end_Time)}</h5>
              <h5>Phone Number: {tutor.phone_number}</h5>
              {/* Display other tutor details if needed */}
            </div>

          ))}
        </div>
      </div>

      {/*Display favorite tutor list*/}
      <div className="purple-box">
        <div className="dashboard-container-student">
          <div className="favorite-tutors">
            <h5 className="favorite-tutor-title" > My Favorites List:</h5>
            {userData.favoriteTutors && userData.favoriteTutors.map(tutorId => (
              <div key={tutorId}>
                {tutorId}
                <button className="delete-button-student" onClick={() => handleDeleteFavorite(tutorId)}>Delete</button>
              </div>
            ))}
          </div>

          {/*Display upcoming appointments*/}
          <div>
            {/* Moved the title outside the map loop */}
            <div className="upcoming-appts-student-container">
              <h5 className="appt-title-student">Upcoming Appointments:<img className="appt-student" src={appt} /></h5>
              {upcomingAppointments.map((appointment, index) => (
                <div className="upcoming-appts-student" key={index}>

                  {/* Smiley face cal pic */}
                  <p>
                    <span className="tutor-appointment-name">{appointment.tutorName}</span>
                    <span className="tutor-appointment-date-time">
                      {formatDate(appointment.date)} at {formatTime(appointment.time)}
                    </span>
                    <button
                      className="cancel-button-student"
                      onClick={() => handleCancelAppointment(appointment.id)}
                    >
                      Cancel
                    </button>
                  </p>
                  {/* Add more appointment details if needed */}
                </div>
              ))}
            </div>
          </div>

          {/*Code for the popup that displays when user trys to schedule appointment*/}
          {/* DONT MESS W IT :) */}
          {showScheduleModal && (
            <div className="modal">
              <h3>Schedule an appointment with {selectedTutor.first_name} {selectedTutor.last_name}</h3>
              <input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} />
              <input type="time" value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} />
              <button onClick={handleScheduleAppointment}>Confirm Appointment</button>
              <button class="cancel-button" onClick={() => setShowScheduleModal(false)}>Cancel</button>
              <p>Please select a one hour slot</p>
            </div>
          )}
          {/* DONT MESS W IT :) */}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
