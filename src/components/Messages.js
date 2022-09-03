import React, { useEffect, useRef} from 'react'
import Moment from 'react-moment';




export default function Messages({msg, user1}) {

  const scrollRef = useRef();

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
   
  }, [msg]);



  return (
   
    <div className={`message_wrapper ${msg.from===user1 ? "own" : ""}` } ref={scrollRef} >
      <p className={msg.from === user1 ? "me" : "friend" }>
        {msg.media ? <img src={msg.media} alt={msg.text} /> : null }
        {msg.text}
        <br />
        <small>
            <Moment fromNow>{msg.createdAt.toDate()}</Moment>
        </small>
      </p>
    </div>
    
  )
}
