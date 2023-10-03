import { initializeApp } from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import {getStorage} from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDbX3CWWkUlcp18egJqw-XKZOM460huNLQ",
  authDomain: "chatty-17768.firebaseapp.com",
  projectId: "chatty-17768",
  storageBucket: "chatty-17768.appspot.com",
  messagingSenderId: "197300896016",
  appId: "1:197300896016:web:dcbdf4b676a1796bad2595"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


export {auth,db,storage};


