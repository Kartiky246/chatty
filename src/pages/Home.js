import React, { useEffect, useState } from 'react'
import { db, auth, storage} from "../firebase";
import{ref, getDownloadURL, uploadBytes} from 'firebase/storage';
import {collection,query,where,onSnapshot, addDoc, Timestamp, orderBy, setDoc, doc, updateDoc, getDoc, getDocs} from "firebase/firestore";
import User from '../components/User';
import MessageForm from '../components/MessageForm';
import Messages from '../components/Messages';
import defaultDP from '../profile.png';




export default  function Home() {
  const [users, setUsers] = useState([]);
  const [chat, setChat] = useState("");
  const [text, setText] = useState('');
  const [img, setImg] = useState("");
  const [msgs, setMsgs] = useState([]);
  

  // user who is running the app

  
  let user1 = (auth.currentUser ?  auth.currentUser.uid : null);
  
  useEffect(() => {
    user1 = auth.currentUser.uid;
    const usersRef = collection(db, "users");
    
    // create a query object
    const q = query(usersRef, where("uid", "not-in", [(user1) ? (user1) : (null)]));
    
    // execute the query with realtime listner

      const sub = onSnapshot(q, (QuerySnapshot) => {
      let users = [];
      QuerySnapshot.forEach((doc) => {
        users.push(doc.data());
      });
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


  
    return (
      <div className='home_container'>
        <div className="users_container" style={{margin:"5px"}}>
          {users.map(user => <User key = {user.uid} user = {user} user1 ={user1} chat ={chat} selectUser = {selectUser}/>)}
          
          
        </div>

        <div className= {`messages_container ${!chat ? "empty" : null}`}   >
          {chat ? (
            <>
          <div className="messages_user" style = {{backgroundColor: "#f0f2f5"}} >
            <span><img src={chat.avatar||defaultDP} alt="" /></span>
            <span><h3>{chat.name}</h3></span>
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
 
  

