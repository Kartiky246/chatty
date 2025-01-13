import React, { useEffect, useRef } from "react";
import { onSnapshot, addDoc, collection, doc, setDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import "./VideoCall.css";

const VideoCall = ({ 
  onClose,
  callingUser,
  receiverName,
  isCaller,
  userId,
  callId
}) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pc = useRef(null);

  useEffect(() => {
    // Initialize the PeerConnection
    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.current.ontrack = (event) => {
        debugger;
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    pc.current.onicecandidate = async (event) => {
      if (event.candidate) {
        // Store candidate in Firestore
        await addDoc(collection(db, "signaling", callId, "messages"), {
          senderId: userId,
          type: "candidate",
          content: event.candidate.toJSON(),  // Store candidate as JSON
          timestamp: Date.now(),
        });
      }
    };

    // Cleanup on unmount
    return () => {
      if (pc.current) {
        pc.current.close();
      }
    };
  }, [callId, userId]);

  useEffect(() => {
    // Listen for signaling messages
    const unsubscribe = onSnapshot(
      collection(db, "signaling", callId, "messages"),
      (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          const data = change.doc.data();

          if (data.type === "offer" && data.senderId !== userId) {
            try {
              // Ensure remote description is set before creating answer
              await pc.current.setRemoteDescription(new RTCSessionDescription(data.content));


              // Now we can create an answer
              const localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
              });
              localStream.getTracks().forEach((track) =>
                pc.current.addTrack(track, localStream)
              );

              // Display the local stream (video)
              localVideoRef.current.srcObject = localStream;

              // Create an answer after remote description is set
              if (pc.current.signalingState === "have-remote-offer") {
                const answer = await pc.current.createAnswer();
                await pc.current.setLocalDescription(answer);  // Set the answer as local description
  
                // Send the answer back via Firestore
                await addDoc(collection(db, "signaling", callId, "messages"), {
                  senderId: userId,
                  type: "answer",
                  content: {
                    type: pc.current.localDescription.type,  // Answer type
                    sdp: pc.current.localDescription.sdp,    // Answer SDP string
                  },
                  timestamp: Date.now(),
                });
  
                console.log('Answer created and sent');
              }
             
            } catch (error) {
              console.error('Error during creating answer:', error);
            }
          }

          if (data.type === "answer" && data.senderId !== userId) {
            // When we receive an answer, we set it as remote description
            await pc.current.setRemoteDescription(new RTCSessionDescription(data.content));
          }

          if (data.type === "candidate" && data.senderId !== userId) {
            // Add the ICE candidate to the connection
            if (pc.current.remoteDescription) {
                await pc.current.addIceCandidate(new RTCIceCandidate(data.content));
            }
          }
        });
      }
    );

    return () => unsubscribe();
  }, [callId, userId]);

  const startCall = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localStream.getTracks().forEach((track) =>
      pc.current.addTrack(track, localStream)
    );
    localVideoRef.current.srcObject = localStream;

    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);

    // Create signaling document in Firestore
    await setDoc(doc(db, "signaling", callId), { startedAt: Date.now() });
    
    // Send offer to Firestore (only store type and sdp)
    await addDoc(collection(db, "signaling", callId, "messages"), {
      senderId: userId,
      type: "offer",
      content: {
        type: pc.current.localDescription.type,  // "offer"
        sdp: pc.current.localDescription.sdp     // SDP string
      },
      timestamp: Date.now(),
    });
  };

  const acceptCall = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localStream.getTracks().forEach((track) =>
      pc.current.addTrack(track, localStream)
    );
    localVideoRef.current.srcObject = localStream;  // Display local stream after accepting
  
    // Now set the remote description (received offer) before creating the answer
    try {
      const offerSnapshot = await getDocs(collection(db, "signaling", callId, "messages"));
      let offerData = null;
  
      // Find the offer in the messages collection
      offerSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.type === "offer" && data.senderId !== userId) {
          offerData = data.content;
        }
      });
  
      if (offerData) {
        // Set the remote description with the offer
        await pc.current.setRemoteDescription(new RTCSessionDescription(offerData));
        
        const answer = await pc.current.createAnswer();
        await pc.current.setLocalDescription(answer);  // Set the answer as local description
  
        // Send the answer back to signaling
        await addDoc(collection(db, "signaling", callId, "messages"), {
          senderId: userId,
          type: "answer",
          content: {
            type: pc.current.localDescription.type,  // "offer" or "answer"
            sdp: pc.current.localDescription.sdp,    // SDP string
          },
          timestamp: Date.now(),
        });
  
        console.log('Answer created and sent');
      } else {
        console.error("Cannot create an answer: remote offer not found.");
      }
    } catch (error) {
      console.error("Error during accepting call:", error);
    }
  };
  

  useEffect(() => {
    if (isCaller) {
      startCall();
    }
  }, [isCaller]);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ height: "55vh" }}>
        <button className="close-button" onClick={onClose}>
          ✖
        </button>

        {callingUser ? (
          <div className="incoming-call-popup">
            <p>{`Getting video call from ${callingUser.name}`}</p>
            <button className="accept-button" onClick={acceptCall}>
              Accept
            </button>
          </div>
        ) : (
          <div className="incoming-call-popup">
            <p>{`Calling ${receiverName}`}</p>
          </div>
        )}

        <div className="video-container">
          <video ref={localVideoRef} autoPlay playsInline muted />
          <video ref={remoteVideoRef} autoPlay playsInline />
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
