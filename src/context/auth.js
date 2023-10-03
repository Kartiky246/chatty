import { createContext } from 'react';
import { useState, useEffect } from 'react';
import Loading from '../components/Loading';
import { auth } from '../firebase';




import React from 'react'

const authContext = createContext();




export default function Auth({children}) {

    const [online, setOnline] = useState(auth.currentUser);
    const [loading, setLoading] = useState(true);
  


    useEffect(() => {
      setTimeout(() => {
        setLoading(false);
        setOnline(auth.currentUser ? true: false)
      },1000)
      }, []);


     
     

      while(loading){
        return <Loading />;
      }

        return (
          <authContext.Provider value={{online, setOnline}}>
            {children}
          </authContext.Provider>
        )
      

}





export {authContext};
