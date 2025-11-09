import React, { useState } from "react";
import { messageContext } from "./message";
import type { messageInterface } from "@/lib/types";

export default function MessageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [message, setMessage] = useState<messageInterface>({
    id: "",
    sender: "",
    receiver: "",
    content: "",
    created_At: "",
  });
  return (
    <messageContext.Provider value={{ message, setMessage }}>
      {children}
    </messageContext.Provider>
  );
}
