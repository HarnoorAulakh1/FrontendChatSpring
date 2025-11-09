import React, { useState } from "react";
import { profileContext } from "./profile";
import type { userInterface } from "../lib/types";
import type { StompSubscription } from "@stomp/stompjs";
export default function ProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<userInterface>({
    id: "",
    username: "",
    name: "",
    email: "",
    profilePicture: "",
    isOnline: false,
    sendMessage: () => {},
    subscribe: () => {
      return {} as StompSubscription | undefined;
    },
    disconnect: () => {},
    collapse: false,       

  });
  return (
    <profileContext.Provider value={{ user, setUser }}>
      {children}
    </profileContext.Provider>
  );
}
