import React, { useState } from "react";
import { currentContext } from "./current";
import type { userInterface } from "@/lib/types";
export default function ProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [current, setCurrent] = useState<{
    _id: string;
    name: string;
    username: string;
    profilePicture: string;
    numberOfMembers?: number;
    isGroup: boolean;
    members?: userInterface[];
  }>({
    _id: "",
    name: "",
    username: "",
    profilePicture: "",
    numberOfMembers: 1,
    isGroup: false,
    members: [],
  });
  return (
    <currentContext.Provider value={{ current, setCurrent }}>
      {children}
    </currentContext.Provider>
  );
}
