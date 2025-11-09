import React, { useState } from "react";
import { profileContext } from "./profile";
import type { userInterface } from "../lib/types";
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
    subscribe: () => null,
    disconnect: () => {},
    collapse: false,       

  });
  return (
    <profileContext.Provider value={{ user, setUser }}>
      {children}
    </profileContext.Provider>
  );
}
