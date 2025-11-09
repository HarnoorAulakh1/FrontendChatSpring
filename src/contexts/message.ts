import { createContext } from "react";
import type { messageInterface } from "../lib/types";

export const messageContext = createContext<{
  message: messageInterface;
  setMessage: React.Dispatch<React.SetStateAction<messageInterface>>;
}>({
  message: {} as messageInterface,
  setMessage: () => {},
});
