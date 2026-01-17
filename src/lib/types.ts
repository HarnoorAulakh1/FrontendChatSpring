import type { StompSubscription } from "@stomp/stompjs";

export interface userInterface {
  id: string;
  username: string;
  password?: string;
  name: string;
  email: string;
  profilePicture: string;
  isOnline: boolean;
  sendMessage?: (destination: string, body: any) => void;
  subscribe?: (
    destination: string,
    callback: (body: any) => void
  ) => StompSubscription | null;
  disconnect?: () => void;
  collapse?: boolean;
}

export interface callInterface {
  sender: string;
  receiver: string;
  status: "accepted" | "declined" | "busy" | "calling" | "ended";
}

export interface iceInterface {
  candidate: {
    candidate: string;
    sdpMid: string | null;
    sdpMLineIndex: number | null;
    usernameFragment?: string | undefined;
  } | null;
}

export interface offerInterface {
  sender: string;
  receiver: string;
  sdp: string;
  type: RTCSdpType;
}

export interface webrtcInterface {
    pc: RTCPeerConnection | null;
    status: string;
    accepted: boolean;
    sdp: string;
    type: RTCSdpType;
    callScreen: string;
    callerId: string;
    calleeId: string;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
  }

export interface messageInterface {
  id?: string;
  sender: string;
  receiver: string;
  roomId?: string;
  senderEm?: userInterface;
  receiverEm?: userInterface;
  file?: {
    type: string;
    name: string;
    link: string;
  };
  group?: string;
  content: string;
  created_At: string;
  isRead?: {
    user: string;
    readAt: Date;
  }[];
}

export interface roomMember {
  id: string;
  username: string;
}

export interface notificationInterface {
  id: string;
  sender?: string;
  receiver?: string;
  group?: string;
  title: string;
  description: string;
  type: string;
  time: number;
  popup?: boolean;
}

export interface groupInterface {
  id: string;
  name: string;
  logo: string;
  members: string[];
  admins: string[];
}
