import React, { useEffect, useState } from 'react'
import { db, auth, storage} from "../firebase";
import{ref, getDownloadURL, uploadBytes} from 'firebase/storage';
import {collection,query,where,onSnapshot, addDoc, Timestamp, orderBy, setDoc, doc, updateDoc, getDoc, getDocs} from "firebase/firestore";
import User from '../components/User';
import MessageForm from '../components/MessageForm';
import Messages from '../components/Messages';
import defaultDP from '../profile.png';
import VideoCalls from '../components/Videocall';



export default  function Home() {
  const [users, setUsers] = useState([]);
  const [chat, setChat] = useState("");
  const [text, setText] = useState('');
  const [img, setImg] = useState("");
  const [msgs, setMsgs] = useState([]);
  const [openVideoCallContainer, setOpenVideoCallContainer] = useState(false);
  const [callingUser, setCallingUser] = useState(null);
  const [isCaller, setIsCaller] = useState(false);
  

  // user who is running the app

  
  let user1 = (auth.currentUser ?  auth.currentUser.uid : null);
  
  useEffect(() => {
    user1 = auth.currentUser.uid;
    const usersRef = collection(db, "users");
    
    // create a query object
    const q = query(usersRef, where("uid", "not-in", [(user1) ? (user1) : (null)]));
    
    // execute the query with realtime listner

      const sub = onSnapshot(usersRef, (QuerySnapshot) => {
      let users = [];
      let isVideoCallOn = false;
      QuerySnapshot.forEach((doc) => {
        const user = doc.data();
        if(user.callingTo) isVideoCallOn=true;
        if(user.uid!==user1){
          users.push(doc.data());
        }
      });
      if(!isVideoCallOn) setOpenVideoCallContainer(false);
      for(let i =0;i<users.length;i++){
        if(users[i].callingTo && users[i].callingTo===user1){
          const callingUser = users.find((u)=>u.uid===users[i].uid);
          setCallingUser(callingUser);
          setOpenVideoCallContainer(true);
        }
      }
      setUsers(users);
    });
    
    return () => sub();

    

  

  }, []);

  useEffect(() => {

    const user2 = chat.uid;
    const id = user1>user2 ? user2 + user1 : user1 + user2;

    if(chat.id!==0){
    const msgsRef = collection(db, "message", id, "chat");
    const q = query(msgsRef, orderBy("createdAt", "asc"));

    const mssgSnap = onSnapshot(q, (querySnapshot) => {
      let msgs = [];
      querySnapshot.forEach((doc) => {
        msgs.push(doc.data());
      });
      setMsgs(msgs);
    });

   
    return () => mssgSnap();
  }


  },[chat]);
  

  // function for selecting user and acitvating the chat

  const selectUser =  async (user) => {
    setChat(user);
    const user2 = user.uid;
    const id = user1>user2 ? user2 + user1 : user1 + user2;

    

    

    await updateDoc(doc(db, "lastMssg", id), {

      unread: false

    })



  
  }



  // function for sending message and saving it on firestorage

  const sendMessage = async () => {
    

    // user friend
    const user2 = chat.uid;

    // making unique identifier for sotring mssg of two users
    const id  = user1>user2 ? (user2 + user1) : (user1 + user2);

    let url;

    if(img){
      const imgRef = ref(storage, `images/${new Date().getTime()} - ${img.name} `);
      const snap = await uploadBytes(imgRef, img);
      const imgLink = await getDownloadURL(ref(storage, snap.ref.fullPath));
      url = imgLink;
    }
 
    await addDoc(collection(db, "message", id, "chat"), {
      text,
      from: user1,
      to: user2,
      createdAt: Timestamp.fromDate(new Date()),
      media: url ? url : ""
    })


 

    // making new collection for the latest send mssg b/w two users

    await setDoc(doc(db, "lastMssg", id), {
      text,
      from: user1,
      to: user2,
      createdAt: Timestamp.fromDate(new Date()),
      media: url || "",
      unread: true,
    });


    setText("");
    setImg("");

  }

if(!user1){
  return (null);
}

const startCall = async () =>{  
  setOpenVideoCallContainer(true);
  updateUser(user1, chat.uid);
  setIsCaller(true);
 
}

const endCall = async () =>{
  setOpenVideoCallContainer(false);
  setIsCaller(false);
  for(let i =0; i<users.length;i++){
    if(users[i].callingTo){
      await updateUser(users[i].uid,null);
    }
  }
  await updateUser(user1,null);
  
}


const updateUser = async (userId,callingTo) => {
  try {
    // Reference to the user document
    const userDocRef = doc(db, "users", userId);

    // Update the document with new data
    await updateDoc(userDocRef, {callingTo:callingTo });

  } catch (error) {
    console.error("Error updating user: ", error);
  }
}

const generateCallIdFromUsers = (callerId, receiverId) => {
  return `${callerId}_${receiverId}`;
}
  
    return (
      <div className='home_container'>
      {openVideoCallContainer && <VideoCalls isCaller={isCaller}  callId={generateCallIdFromUsers(user1,chat.uid)} recieverName={chat.name} callingUser={callingUser} userId={user1} onClose={() => endCall()}/>}
        <div className="users_container" style={{margin:"5px"}}>
          {users.map(user => <User key = {user.uid} user = {user} user1 ={user1} chat ={chat} selectUser = {selectUser}/>)}
        </div>
        <div className= {`messages_container ${!chat ? "empty" : null}`}   >
          {chat ? (
            <>
          <div className="messages_user" style = {{backgroundColor: "#f0f2f5"}} >
          <div className='user-info'>
          <span><img src={chat.avatar||defaultDP} alt="" /></span>
            <span><h3>{chat.name}</h3></span>
          </div>
          <div onClick={()=>startCall()} className='video-call-icon'>
            <span  className="material-symbols-outlined">video_call</span>
          </div>
          </div>
          <div className="messages" >
            {msgs.length ? (msgs.map((msg,i)=> (
               <Messages key = {i} msg = {msg} user1 = {user1} /> 
          ))) : (null)}
           
      
          
          <MessageForm text = {text} setText = {setText} sendMessage={sendMessage} img = {img} setImg = {setImg}/>
          </div>
          
          </>) : <div className="wp no_conv"><h3 className ='no_conv'> Select a user to start conversation </h3>
          
            <h2>Chatty</h2>
           </div> }
        </div>
      </div>
    )
  }
 
  

