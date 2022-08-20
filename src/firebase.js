// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAH7rnREbJzqYX4q2t0k3i4sippOEvicCQ",
  authDomain: "react-messenger-86941.firebaseapp.com",
  databaseURL: "https://react-messenger.firebaseio.com",
  projectId: "react-messenger-86941",
  storageBucket: "react-messenger-86941.appspot.com",
  messagingSenderId: "931476108764",
  appId: "1:931476108764:web:077dc3e69bf06536c14b19"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
