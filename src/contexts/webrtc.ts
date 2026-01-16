import { createContext } from "react";

export const webrtcContext = createContext<{
  data: {
    pc: RTCPeerConnection | null;
    status: string;
    sdp: string;
    type: RTCSdpType;
    callScreen: string;
    callerId: string;
    calleeId: string;
    localStream: MediaStream;
    remoteStream: MediaStream;
  };
  setData: React.Dispatch<
    React.SetStateAction<{
      pc: RTCPeerConnection | null;
      status: string;
      sdp: string;
      type: RTCSdpType;
      callScreen: string;
      callerId: string;
      calleeId: string;
      localStream: MediaStream;
      remoteStream: MediaStream;
    }>
  >;
}>({
  data: {
    pc: null,
    status: "disconnected",
    type: {} as RTCSdpType,
    sdp: "",
    callScreen: null,
    callerId: "",
    calleeId: "",
    localStream: new MediaStream(),
    remoteStream: new MediaStream(),
  },
  setData: () => {},
});
