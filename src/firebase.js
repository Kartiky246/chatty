import { initializeApp } from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import {getStorage} from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCHunPiag_Tiw8yaLvZn1LrbO8l30_44pQ",
  authDomain: "chatty-85d17.firebaseapp.com",
  projectId: "chatty-85d17",
  storageBucket: "chatty-85d17.appspot.com",
  messagingSenderId: "554525489774",
  appId: "1:554525489774:web:c9586464d5b4334dff047f"
};






// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


export {auth,db,storage};


