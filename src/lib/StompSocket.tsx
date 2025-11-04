import { useState, useRef, useContext, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { profileContext } from "@/contexts/profile";
import type { userInterface } from "./types";

export default function useStompClient() {
  const [connected, setConnected] = useState(false);
  const { user, setUser } = useContext(profileContext);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    console.log("🔄 Initializing STOMP client…", user.id);
    const socket = new SockJS(`http://localhost:4000/ws?username=` + user.id);

    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
    });
    stompClient.onConnect = () => {
      console.log("STOMP client connected.");
      setUser((x: userInterface) => {
        return {
          ...x,
          sendMessage: sendMessage,
          subscribe: subscribe,
          disconnect: disconnect,
        };
      });
      setConnected(true);
    };
    stompClient.onStompError = (frame) => {
      console.error("STOMP error:", frame.headers["message"]);
      console.error("Details:", frame.body);
    };

    stompClient.activate();
    clientRef.current = stompClient;

    function sendMessage(destination: string, body: any) {
        console.log("Sending message to", destination, body);
      if (!connected && !clientRef.current) return;
      clientRef.current?.publish({
        destination: destination,
        body: JSON.stringify(body),
      });
    }

    function disconnect() {
      if (!connected && !clientRef.current) return;
      clientRef.current?.deactivate();
      setConnected(false);
    }

    function subscribe(destination: string, callback: (body: any) => void) {
      if (!connected && !clientRef.current) return;
      return clientRef.current?.subscribe(destination, (message) => {
        callback(JSON.parse(message.body));
      });
    }
    return () => {
      console.log("🔌 Deactivating STOMP client…");
      stompClient.deactivate();
    };
  }, [user.id]);

  // sendMessage("/app/connect", { content: "Hello, World!" });

  return <div></div>;
}
