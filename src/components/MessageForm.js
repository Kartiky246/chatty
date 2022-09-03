import React from 'react'
import Attachment from './svg/Attachment';
import Send from './svg/Send';

export default function MessageForm({ sendMessage, text, setText, setImg }) {
  return (
    <form className = 'message_form'>
        <label htmlFor="img">
            <Attachment/>
        </label>
        <input type = "file" id = "img" accept ='image/*' style={{display: "none"}} onChange = {(e) => setImg(e.target.files[0])}/>
        <div>
            <input type="text" placeholder='Send a message' value = {text} onChange = {(e) => setText(e.target.value)} />
        </div>
        <div>
            <Send sendMessage={sendMessage}/>
        </div>
    </form>
  )
}
