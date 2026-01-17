import type { webrtcInterface } from "@/lib/types";
import { createContext } from "react";

export const webrtcContext = createContext<{
  data: webrtcInterface;
  setData: React.Dispatch<React.SetStateAction<webrtcInterface>>;
}>({
  data: {
    pc: null,
    status: "disconnected",
    type: {} as RTCSdpType,
    accepted: false,
    sdp: "",
    callScreen: "",
    callerId: "",
    calleeId: "",
    localStream: null,
    remoteStream: null,
  },
  setData: () => {},
});
