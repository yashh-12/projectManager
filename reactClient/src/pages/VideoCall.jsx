import React, { useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaPhoneSlash,
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import useSocket from '../provider/SocketProvider';
import { useDispatch } from 'react-redux';
import { setLoaderFalse, setLoaderTrue } from '../store/uiSlice';

Modal.setAppElement('#root');

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];

export default function VideoCall({ userId, targetUserId }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { client: socket } = useSocket();

  const localRef = useRef();
  const remoteRef = useRef();

  const [stream, setStream] = useState(null);
  const [pc, setPc] = useState(null);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {


    const peer = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    setPc(peer);

    // Handle incoming track
    peer.ontrack = (e) => {
      if (remoteRef.current) {
        remoteRef.current.srcObject = e.streams[0];
      }
    };

    // Send ICE candidates
    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit('ice-candidate', {
          targetUserId,
          candidate: e.candidate,
        });
      }
    };

    // Get local stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((localStream) => {
        localRef.current.srcObject = localStream;
        setStream(localStream);

        localStream.getTracks().forEach((track) => {
          peer.addTrack(track, localStream);
        });

        // Initiate call
        socket.emit('call-user', {
          callerId: userId,
          targetUserId,
          roomId: `room_${projectId}`,
        });
      })
      .catch((err) => {
        console.error('Media error:', err);
      });

    // Listen for offer
    socket.on('offer', async ({ offer }) => {
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit('answer', { targetUserId, answer });
    });

    // Listen for answer
    socket.on('answer', async ({ answer }) => {
      await peer.setRemoteDescription(new RTCSessionDescription(answer));
    });

    // Listen for ICE candidate
    socket.on('ice-candidate', async ({ candidate }) => {
      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Failed to add ICE candidate', err);
      }
    });



    // Cleanup
    return () => {
      peer.close();
      stream?.getTracks().forEach((t) => t.stop());
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
    };
  }, []);

  const toggleMute = () => {
    stream?.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMuted((prev) => !prev);
  };

  const toggleVideo = () => {
    stream?.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setVideoOff((prev) => !prev);
  };

  const endCall = () => {
    pc?.close();
    stream?.getTracks().forEach((t) => t.stop());
    setIsOpen(false);
    navigate(`/projects/${projectId}/chat`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={endCall}
      style={{
        overlay: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
        content: {
          padding: 0,
          inset: 0,
          background: 'black',
          border: 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        },
      }}
    >
      <video
        ref={localRef}
        autoPlay
        muted
        playsInline
        style={{
          position: 'absolute',
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: 1,
        }}
      />
      <video
        ref={remoteRef}
        autoPlay
        playsInline
        style={{
          position: 'absolute',
          width: 200,
          height: 150,
          bottom: 100,
          right: 30,
          borderRadius: 10,
          zIndex: 2,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          display: 'flex',
          gap: 20,
          justifyContent: 'center',
          width: '100%',
          zIndex: 3,
        }}
      >
        <button
          onClick={toggleMute}
          style={{
            padding: 12,
            borderRadius: '50%',
            backgroundColor: muted ? 'red' : 'green',
            color: 'white',
            border: 'none',
            fontSize: 20,
          }}
        >
          {muted ? <FaMicrophoneSlash /> : <FaMicrophone />}
        </button>
        <button
          onClick={toggleVideo}
          style={{
            padding: 12,
            borderRadius: '50%',
            backgroundColor: videoOff ? 'gray' : 'blue',
            color: 'white',
            border: 'none',
            fontSize: 20,
          }}
        >
          {videoOff ? <FaVideoSlash /> : <FaVideo />}
        </button>
        <button
          onClick={endCall}
          style={{
            padding: 12,
            borderRadius: '50%',
            backgroundColor: 'darkred',
            color: 'white',
            border: 'none',
            fontSize: 20,
          }}
        >
          <FaPhoneSlash />
        </button>
      </div>
    </Modal>
  );
}
