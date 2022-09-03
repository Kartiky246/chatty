import Img from '../profile.png';
import React, { useEffect, useState } from "react";
import { onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";



export default function User({user, selectUser, user1, chat}) {

  const user2 = user?.uid;
  
  const [data, setData] = useState("");

  useEffect(() => {
    const id = user1 > user2 ? `${user2 + user1}` : `${user1 + user2}`;
    


    let sub = onSnapshot(doc(db, "lastMssg", id), (doc) => {
      setData(doc.data());
      
    });
    return () => sub();
  }, []);







  return (
    
    <div className={`user_wrapper ${chat.name === user.name && "selected_user"}`} onClick={() => selectUser(user)} >
      <div className="user_info">
        <div className="user_detail">
            <img src={user.avatar || Img} alt="avatar" className='avatar' />
            <h4>{user.name}</h4>
            
            
        </div>
        <div className={`user_status ${user.isOnline ? "online" : "offline"}`}>

        </div>
      
             

      </div>

    
        {
                data?.from !== user1 ? (<div className= {`lastMssgDisplay  ${data?.unread ? "unread" : "read"}  `} >{data?.text}</div>) : (<div className='lastMssgDisplay'> <em>me: </em> {data?.text}</div>)
                
              }
        
       
      
      <hr />
    </div>
    
  )
}
