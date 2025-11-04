import { createContext } from "react";
import type { userInterface } from "../lib/types";
import type { StompSubscription } from "@stomp/stompjs";


export const profileContext = createContext<{
  user: {
    id: string;
    username: string;
    password?: string;
    name: string;
    email: string;
    profilePicture: string;
    isOnline: boolean;
    sendMessage: (destination: string, body: any) => StompSubscription;
    subscribe: (destination: string, callback: (body: any) => void) => StompSubscription;
    disconnect: () => void;
    collapse?: boolean;
  };
  setUser: React.Dispatch<React.SetStateAction<userInterface>>;
}>({
  user: {
    id: "",
    username: "johndoe",
    name: "John Doe",
    email: "",
    profilePicture: "https://example.com/profile.jpg",
    isOnline: true,
    sendMessage: () => {
      return {} as StompSubscription;
    },
    subscribe: () => {
      return {} as StompSubscription;
    },
    disconnect: () => {},
    password: "",
  },
  setUser: () => {},
});
