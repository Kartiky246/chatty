import { initializeApp } from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import {getStorage} from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCz3D99n5lqrt8nuMJOqI0FvrYoIvpuJLc",
  authDomain: "chatty-836d0.firebaseapp.com",
  projectId: "chatty-836d0",
  storageBucket: "chatty-836d0.appspot.com",
  messagingSenderId: "540067435834",
  appId: "1:540067435834:web:3f4585e792b00115136c03"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


export {auth,db,storage};