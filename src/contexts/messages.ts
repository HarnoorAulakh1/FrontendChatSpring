import { createContext } from "react";
import type { messageInterface } from "../lib/types";

export const messageContext = createContext<{
  messages: messageInterface[];
  setMessages: React.Dispatch<React.SetStateAction<messageInterface[]>>;
}>({
  messages: [],
  setMessages: () => {},
});
