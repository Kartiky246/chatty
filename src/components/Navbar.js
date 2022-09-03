import React from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {signOut} from 'firebase/auth';
import{auth,db} from '../firebase';
import{doc, updateDoc} from 'firebase/firestore';
import { useContext } from 'react';
import {authContext} from '../context/Auth';




export default function Navbar() {

  const {online ,setOnline} = useContext(authContext);

 
  const navigate = useNavigate();

  const out = async () => {
    await updateDoc(doc(db,"users", auth.currentUser.uid), {
      isOnline: false
    })

    await signOut(auth);
    setOnline(false);
    navigate('/login');

  }
  return (
    <nav>
        <h2>
            <Link to ="/">Chatty</Link>
        </h2>
        <div>

            {online ? <>
            <Link to ="/profile">Profile</Link>
            <Link to = "/" onClick={out}>Log Out</Link>
            </>:<>
            <Link to ="/register">Register</Link>
            <Link to = "/login" >Log In</Link>
            </>}
            
        </div>
      
    </nav>
  )
}
