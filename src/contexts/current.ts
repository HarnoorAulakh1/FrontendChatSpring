import { createContext } from "react";
import type { userInterface } from "../lib/types";

export const currentContext = createContext<{
  current: {
    id: string;
    name: string;
    username: string;
    profilePicture: string;
    isGroup: boolean;
    numberOfMembers?: number;
    isOnline?: boolean;
    members?: userInterface[];
  };
  setCurrent: React.Dispatch<
    React.SetStateAction<{
      id: string;
      name: string;
      username: string;
      profilePicture: string;
      numberOfMembers?: number;
      isGroup: boolean;
      members?: userInterface[];
    }>
  >;
}>({
  current: {
    id: "",
    name: "",
    username: "",
    profilePicture: "",
    numberOfMembers: 1,
    isGroup: false,
    members: [],
  },
  setCurrent: () => {},
});
