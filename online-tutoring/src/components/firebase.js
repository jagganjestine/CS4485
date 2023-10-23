// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB8zytC5xoZqScK-aIrmr_90Gfly8RRG3o",
  authDomain: "online-tutoring-e6a08.firebaseapp.com",
  projectId: "online-tutoring-e6a08",
  storageBucket: "online-tutoring-e6a08.appspot.com",
  messagingSenderId: "557888095740",
  appId: "1:557888095740:web:e413917b69178cd3579e79",
  measurementId: "G-2GTZYXNWKB",
  databaseURL: "https://online-tutoring-e6a08-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const storage = getStorage()

const firebase = {
  app,
  analytics,
  auth,
  storage
};
const database = getDatabase(app);

export default firebase;
