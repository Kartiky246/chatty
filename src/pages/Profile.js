import React, { useEffect } from 'react'
import Img from "../profile.png";
import Camera from '../components/svg/Camera';
import Delete from "../components/svg/Delete";
import { useState } from 'react';
import { storage, db, auth } from '../firebase';
import { getDoc, doc, updateDoc } from "firebase/firestore";
import{ref, getDownloadURL, uploadBytes, deleteObject} from 'firebase/storage';
import { useNavigate } from "react-router-dom";


export default function Profile() {
    const [Image, setImage] = useState('');
    const [user, setUser] = useState();
    const navigate = useNavigate("");
    
    
    useEffect(()=>{
        // get the current active user
        getDoc(doc(db, "users", auth.currentUser.uid)).then((docSnap) => {
            if (docSnap.exists) {
              setUser(docSnap.data());
            }
          });
        
        if (Image) {
            // function for uploading the image
        const uploadImg = async () => {
            const imgRef = ref(
            storage,
            `avatar/${new Date().getTime()} - ${Image.name}`
            );

            try {
            if (user.avatarPath) {
                await deleteObject(ref(storage, user.avatarPath));
            }
            const snap = await uploadBytes(imgRef, Image);
            const url = await getDownloadURL(ref(storage, snap.ref.fullPath));
    
            await updateDoc(doc(db, "users", auth.currentUser.uid), {
                avatar: url,
                avatarPath: snap.ref.fullPath,
            });
    
            setImage("");
            } catch (err) {
            console.log(err.message);
            }
        };
        uploadImg();
        }

    }, [Image])

    // function for deleting the image

    const deleteImage = async () => {
        try {
          const confirm = window.confirm("Delete DP?");
          if (confirm) {
            await deleteObject(ref(storage, user.avatarPath));
    
            await updateDoc(doc(db, "users", auth.currentUser.uid), {
              avatar: "",
              avatarPath: "",
            });
            navigate("/");
          }
        } catch (err) {
          console.log(err.message);
        }
      };
  
      if(!user){
        return(null);
      }

  return (
      <div className='profile_background' >
    <section className="profile_container profile_section" > 
   
        <div className="img_container">
            <img src={(user) ? (user.avatar||Img):(Img)} alt="DP" />
            <div className="overlay">
                <div>
                    <label htmlFor="photo">
                        <Camera/>
                    </label>
                    {user&&user.avatar ? <Delete deleteImage={deleteImage} /> : null}
                    <input type="file" accept='image/*' id = 'photo' style={{display:"none"}} onChange={(e) => setImage(e.target.files[0])} />
                </div>
            </div>
        </div>
        <div className="text_container">
            <h3>{(user) ? (user.name):null}</h3>
            <p>{(user) ? (user.email):null}</p>
            <hr />
            <small>Joined on {(user) ? user.createdAt.toDate().toDateString() : null}</small>
        </div>
      
    </section>
      </div>
  )
}