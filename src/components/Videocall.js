import React, { useEffect, useRef } from "react";
import { onSnapshot, addDoc, collection, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import "./VideoCall.css";

const VideoCall = ({ 
  onClose,
  callingUser,
  recieverName,
  isCaller,
  userId,
  callId
}) => {
    debugger;
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pc = useRef(null);

  useEffect(() => {
    // Initialize the PeerConnection
    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.current.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    pc.current.onicecandidate = async (event) => {
      if (event.candidate) {
        console.log("Generated ICE Candidate:", event.candidate);
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
            await pc.current.setRemoteDescription(
              new RTCSessionDescription(data.content)  // Set remote offer
            );
            const localStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true,
            });
            localStream.getTracks().forEach((track) =>
              pc.current.addTrack(track, localStream)
            );
            localVideoRef.current.srcObject = localStream;

            const answer = await pc.current.createAnswer();
            await pc.current.setLocalDescription(answer);
            // Send answer to Firestore
            await addDoc(collection(db, "signaling", callId, "messages"), {
              senderId: userId,
              type: "answer",
              content: {
                type: pc.current.localDescription.type,  // "offer" or "answer"
                sdp: pc.current.localDescription.sdp     // The SDP string
              },
              timestamp: Date.now(),
            });
          }

          if (data.type === "answer" && data.senderId !== userId) {
            await pc.current.setRemoteDescription(
              new RTCSessionDescription(data.content)  // Set remote answer
            );
          }

          if (data.type === "candidate" && data.senderId !== userId) {
            await pc.current.addIceCandidate(new RTCIceCandidate(data.content));  // Add ICE Candidate
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
    localVideoRef.current.srcObject = localStream;
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
            <p>{`Calling ${recieverName}`}</p>
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
