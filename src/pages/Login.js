import React from 'react'
import { useState } from 'react';
import {auth,db} from  '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import {doc, updateDoc} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import {AuthContext} from '../context/Auth';






export default function Login() {
    const {setOnline} = useContext(AuthContext);

    const navigate = useNavigate();
    const [data, setData] = useState({
        
        email:"",
        password:"",
        error:null,
        loading:false
    })

    const {email, password, error, loading} = data;
    

    const handleChange = (e) => {
            setData({...data, [e.target.name]:e.target.value})
    }

    

   
    const OnSubmit =  async (e) => {
            e.preventDefault();
            setData({...data, error:null, loading:true})
            if(!email||!password){
                setData({...data,error:"All fields are mandatory!",loading:false})
                
                   
            }

            else{
            try {
              // will Log In user here
              const result = await signInWithEmailAndPassword(auth, email, password);
              await updateDoc(doc(db, "users", result.user.uid), {
                isOnline: true
              })
             

              // Make Form UI empty by emptying all the fields in the form

              setData({
                email:"",
                password:"",
                error:null,
                loading:false
              })

              setOnline(true);
              navigate('/');
              
              

            } catch (error) {
              console.log(error.message);
              setData({...data, error:error.message, loading:false})
            }
          }
            
    }

  return (
    <section>
      <h3>Log In to your Account</h3>
      <form className='form' onSubmit={ OnSubmit}>
        
        <div className="input_container">
            <label htmlFor="email">E-mail</label>
            <input type="text" name = "email" value = {email} onChange={handleChange} />
        </div>
        <div className="input_container">
            <label htmlFor="password">Password</label>
            <input type="text" name = "password" value = {password} onChange={handleChange}  />
        </div>
        <div className="btn_container">
            
        {
            error?<p className='error'> {error}</p> : <p className='error' ></p> 
        }
       
            <button className="btn"  disabled ={loading} >{loading? "Logging in...": "Log In"}</button>
       
      
        </div>
      
      </form>
    </section>
  )
}
