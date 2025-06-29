import React, { useCallback, useEffect, useState } from 'react'
import useStream from '../provider/StreamProvide'
import useSocket from '../provider/SocketProvider';
import PeerService from '../services/PeerService';
import { useParams } from 'react-router-dom';

function VideoCall() {

  const { stream, setStream } = useStream();
  const { roomId } = useParams();
  const [remoteStream, setRemoteStream] = useState();
  const { client } = useSocket();

  const sendStreams = useCallback(async () => {
    if (!stream) {
      console.log("Stream not available when trying to send tracks", stream);
      return;
    }
    console.log("stream sent ");
    for (const track of stream.getTracks()) {
      PeerService.peer.addTrack(track, stream);
    }
  }, [stream]);

  const handleStartHandshake = useCallback(async (roomId) => {
    const offer = await PeerService.getOffer();
    console.log("start handshaking  ");

    client.emit("sendOffer", { offer, roomId });
  }, [client]);



  const handleOffer = useCallback(async ({ roomId, offer }) => {
    console.log("Offer came ", stream);
    const answer = await PeerService.getAnswer(offer);
    client.emit("sendAnswer", { roomId, answer });
    sendStreams();
    PeerService.peer.addEventListener("track", async (ev) => {
      const remoteStre = ev.streams;
      setRemoteStream(remoteStre[0]);
      console.log(remoteStre);

    });
  }, [client]);


  const handleAnswer = useCallback(
    async ({ roomId, answer }) => {
      console.log("got answer ");

      await PeerService.setRemoteDescription(answer);
      sendStreams();
      PeerService.peer.addEventListener("track", async (ev) => {
        const remoteStre = ev.streams;
        setRemoteStream(remoteStre[0]);
        console.log(remoteStre);

      });
    },
    [sendStreams]
  );

  useEffect(() => {
    if (!client) return;


    client.on("startHandshake", handleStartHandshake);
    client.on("offer", handleOffer);
    client.on("answer", handleAnswer);
    client.emit("join-personalRoom", roomId)


    return () => {

      client.off("startHandshake", handleStartHandshake);
      client.off("offer", handleOffer);
      client.off("answer", handleAnswer);
    };
  }, [client]);

  useEffect(() => {
    console.log("thid ran ");

    PeerService.peer.addEventListener("track", async (ev) => {
      const remoteStre = ev.streams;
      setRemoteStream(remoteStre[0]);
      console.log(remoteStre);

    });
  }, [stream, client, handleOffer, handleAnswer]);


  return (
    <div>VideoCall</div>
  )
}

export default VideoCall