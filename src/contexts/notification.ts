import type { notificationInterface } from "@/lib/types";
import { createContext } from "react";

export const notificationContext = createContext<{
  notifications: notificationInterface[];
  notify: React.Dispatch<React.SetStateAction<notificationInterface[]>>;
}>({
  notifications: [],
  notify: () => {},
});
