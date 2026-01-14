import { createContext } from "react";


export const webrtcContext = createContext<{
  data: {
    pc: RTCPeerConnection | null;
    sdp: RTCSessionDescriptionInit | null;
    candidate: RTCIceCandidateInit | null;
  };
  setData: React.Dispatch<React.SetStateAction<{
    pc: RTCPeerConnection | null;
    sdp: RTCSessionDescriptionInit | null;
    candidate: RTCIceCandidateInit | null;
  }>>;
}>({
    data: {
        pc: null,
    sdp: null,
    candidate: null,
    },
  setData: () => {},
});
