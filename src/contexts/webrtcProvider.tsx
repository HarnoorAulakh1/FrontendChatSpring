import React, { useContext, useEffect, useState } from "react";
import { webrtcContext } from "./webrtc";
import { profileContext } from "./profile";
import type { StompSubscription } from "@stomp/stompjs";
import type {
  callInterface,
  iceInterface,
  offerInterface,
  webrtcInterface,
} from "@/lib/types";
import VideoCall from "../components/webrtc/videoCall";
export default function WebrtcProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<webrtcInterface>({
    pc: null,
    status: "disconnected",
    accepted: false,
    sdp: "",
    type: {} as RTCSdpType,
    callScreen: "",
    callerId: "",
    calleeId: "",
    localStream: new MediaStream(),
    remoteStream: new MediaStream(),
  });

  const { user } = useContext(profileContext);
  const [iceQueue, setIceQueue] = useState<RTCIceCandidate[]>([]);
  const remoteStreamRef = React.useRef<MediaStream>(new MediaStream());
  const playedRef = React.useRef<boolean>(false);

  useEffect(() => {
    if (data.status == "disconnected") {
      playedRef.current = false;
      remoteStreamRef.current.getTracks().forEach((t) => t.stop());
      remoteStreamRef.current = new MediaStream();
    }
  }, [data.status]);

  useEffect(() => {
    console.log("WebRTC Provider: Setting up subscriptions");
    let sub1: StompSubscription | null = null,
      sub2: StompSubscription | null = null,
      sub3: StompSubscription | null = null;
    function handleIncomingCall(sender: string) {
      console.log("Handling incoming call from:", data);
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          {
            urls: "turn:free.expressturn.com:3478",
            username: "000000002086098388",
            credential: "ueJtH+gb9wfnfmMonIu9q2tPlxU=",
          },
        ],
      });
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          if (user.sendMessage)
            user.sendMessage("/app/signal/ice", {
              candidate: event.candidate,
              receiver: sender,
              sender: user.id,
            });
        }
      };
      pc.ontrack = (event) => {
        const track = event.track;
        console.log("Received remote track:", event, playedRef.current);

        if (
          !remoteStreamRef.current.getTracks().some((t) => t.id === track.id)
        ) {
          remoteStreamRef.current.addTrack(track);
        }

        if (!playedRef.current) {
          console.log("Playing remote stream for the first time");
          setData((x) => ({
            ...x,
            remoteStream: remoteStreamRef.current,
          }));
          playedRef.current = true;
        }
      };

      console.log("Incoming call from:", pc);
      return {
        pc: pc,
        status: "connecting",
        callScreen: "incoming",
        calleeId: user.id,
        callerId: sender,
      };
    }
    async function handleOffer(data1: offerInterface) {
      setData((x) => ({
        ...x,
        callScreen: "incoming",
        sdp: data1.sdp,
        type: data1.type,
        callerId: data1.sender,
        calleId: data1.receiver,
      }));
      console.log("Received offer:", data1);
    }
    async function acceptAnswer(data1: offerInterface) {
      console.log("received answer");
      if (data.pc) {
        data.pc.setRemoteDescription(
          new RTCSessionDescription({
            sdp: data1.sdp,
            type: data1.type,
          }),
        );
        setData((x) => ({
          ...x,
          status: "connected",
          accepted: true,
        }));
      }
    }

    if (user.id && user.subscribe) {
      sub1 = user.subscribe(
        "/user/topic/incoming",
        (message: callInterface) => {
          console.log("Incoming call message received:", message);
          setData((prev) => {
            if (prev.status === "disconnected") {
              const a: {
                pc: RTCPeerConnection;
                status: string;
                callScreen: string;
                callerId: string;
                calleeId: string;
              } = handleIncomingCall(message.sender);
              console.log("handleIncomingCall returned:", a);
              return {
                ...prev,
                ...a,
              };
            }
            return prev;
          });
        },
      );
      sub2 = user.subscribe(
        "/user/topic/offer",
        async (message: offerInterface) => {
          handleOffer(message);
        },
      );
      sub3 = user.subscribe(
        "/user/topic/answer",
        async (message: offerInterface) => {
          acceptAnswer(message);
        },
      );
    }
    return () => {
      if (sub1) sub1.unsubscribe();
      if (sub2) sub2.unsubscribe();
      if (sub3) sub3.unsubscribe();
    };
  }, [user, user.subscribe, data.pc]);

  useEffect(() => {
    let sub1: StompSubscription | null = null;
    async function setIce(data1: iceInterface) {
      //console.log("ICE candidate data received:", data1);
      try {
        if (!data1.candidate) return;
        //console.log("Raw candidate received:", data1.candidate);

        const candidateInit: RTCIceCandidateInit = {
          candidate: data1.candidate.candidate,
          sdpMid: data1.candidate.sdpMid ?? null,
          sdpMLineIndex: data1.candidate.sdpMLineIndex ?? null,
          usernameFragment: data1.candidate.usernameFragment ?? undefined,
        };
        //console.log("Parsed candidate:", candidateInit);
        if (
          candidateInit.candidate != null &&
          candidateInit.sdpMid != null &&
          candidateInit.sdpMLineIndex != null &&
          candidateInit.usernameFragment != null
        ) {
          const candidate = new RTCIceCandidate(candidateInit);
          setIceQueue((prev) => [...prev, candidate]);
          //console.log("Received ICE candidate:", candidate);
        }
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    }
    if (user.id && user.subscribe) {
      sub1 = user.subscribe("/user/topic/ice", (message: iceInterface) => {
        setIce(message);
      });
    }
    return () => {
      if (sub1) sub1.unsubscribe();
    };
  }, [user, user.subscribe, setIceQueue]);

  useEffect(() => {
    //console.log("adding ICE candidate successfully", iceQueue, data.pc);
    async function addIce() {
      if (data.pc && data.status == "connected") {
        for (const iceCandidate of iceQueue) {
          await data.pc.addIceCandidate(iceCandidate);
          //console.log("Added queued ICE candidate:", iceCandidate);
        }
        setIceQueue([]);
        //console.log("Added ICE candidate successfully");
      }
    }
    if (iceQueue.length > 0) addIce();
  }, [data.pc, data.status, iceQueue]);

  return (
    <webrtcContext.Provider value={{ data, setData }}>
      <VideoCall />
      {children}
    </webrtcContext.Provider>
  );
}
