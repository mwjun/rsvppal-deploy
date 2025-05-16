// src/firebase.ts
import { initializeApp }       from "firebase/app";
import { getAuth }             from "firebase/auth";
import { getFirestore }        from "firebase/firestore";
// (You can also import getAnalytics if you want analytics later)

const firebaseConfig = {
  apiKey:            "AIzaSyDIUlFDDQ0vNnTIgXduRblNxsUHuXnMhHA",
  authDomain:        "rsvp-project-b89af.firebaseapp.com",
  projectId:         "rsvp-project-b89af",
  storageBucket:     "rsvp-project-b89af.appspot.com",
  messagingSenderId: "8036551723",
  appId:             "1:8036551723:web:4474c65ba205825774ae6e",
  measurementId:     "G-0EL15S95G1"        // optional
};


console.log("Firebase cfg:", firebaseConfig);
// Initialize the core Firebase SDK
const app = initializeApp(firebaseConfig);

// Initialize individual services
export const auth = getAuth(app);           // Firebase Authentication
export const db   = getFirestore(app);      // Cloud Firestore (database)

 