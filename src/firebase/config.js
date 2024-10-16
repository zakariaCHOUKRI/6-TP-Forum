// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDrRi_Gbz87Buv3S_QF4AjCLJ9WvOEPXxc",
  authDomain: "tp6-forum-1e950.firebaseapp.com",
  projectId: "tp6-forum-1e950",
  storageBucket: "tp6-forum-1e950.appspot.com",
  messagingSenderId: "610510330781",
  appId: "1:610510330781:web:e75487b3e21062b89c6d74",
  measurementId: "G-SCBE0Y01K4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };