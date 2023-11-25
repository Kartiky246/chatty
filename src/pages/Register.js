import React from 'react'
import { useState } from 'react';
import {auth,db} from  '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {setDoc, doc, Timestamp} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import {authContext} from '../context/Auth';


export default function Register() {
  const {setOnline} = useContext(authContext);
  
    const navigate = useNavigate();
    const [data, setData] = useState({
        name:"",
        email:"",
        password:"",
        error:null,
        loading:false
    })

    const { name, email, password, error, loading} = data;
    

    const handleChange = (e) => {
            setData({...data, [e.target.name]:e.target.value})
    }

    

    
    const OnSubmit =   async(e) => {
            e.preventDefault();
            setData({...data, error:null, loading:true});
            
            if(!name||!email||!password){
                setData({...data,error:"All fields are mandatory!",loading:false})
                  
            }

            else{
            try {

              // will register user here
              const result = await createUserWithEmailAndPassword(auth, email, password);
              await setDoc(doc(db,"users", result.user.uid), {
                uid: result.user.uid,
                name,
                email,
                createdAt: Timestamp.fromDate(new Date()),
                isOnline: true
              });

              // Make Form UI empty by emptying all the fields in the form

              setData({
                name:"",
                email:"",
                password:"",
                error:null,
                loading:false
              })

              setOnline(true);
              
              navigate('/');

            } catch (error) {
              
              setData({...data, error:error.message, loading:false});
            }
          }
            
    }
   


  return (
    <section>
      <h3>Create An Account</h3>
      <form className='form' onSubmit={ OnSubmit}>
        <div className="input_container">
            <label htmlFor="name">Name</label>
            <input type="text" name = "name" value = {name} onChange={handleChange} />
        </div>
        <div className="input_container">
            <label htmlFor="email">E-mail</label>
            <input type="text" name = "email" value = {email} onChange={handleChange} />
        </div>
        <div className="input_container">
            <label htmlFor="password">Password</label>
            <input type="password" name = "password" value = {password} onChange={handleChange}  />
        </div>
        <div className="btn_container">
            
        {
            error?<p className='error'> {error}</p> : <p className='error' ></p> 
        }
       
            <button className="btn"  disabled ={loading}  >{loading? 'creating...':'Register'}</button>
       
      
        </div>
      
      </form>
    </section>
  )
}
