import React, {useState } from "react";
import { webrtcContext } from "./webrtc";
export default function WebrtcProvider({
  children,
}: {
  children: React.ReactNode;
}) {
    const [data, setData] = useState<{
        pc: RTCPeerConnection | null;
    sdp: RTCSessionDescriptionInit | null;
    candidate: RTCIceCandidateInit | null;
  }>({
    pc: null,
    sdp: null,
    candidate: null,
  });
  return (
    <webrtcContext.Provider value={{ data, setData }}>
      {children}
    </webrtcContext.Provider>
  );
}
