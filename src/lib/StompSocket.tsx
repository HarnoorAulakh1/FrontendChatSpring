import { useState, useRef, useContext, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { profileContext } from "@/contexts/profile";
import { useCallback } from "react";

export default function useStompClient() {
  const [subs, setSubs] = useState<
    { destination: string; callback: (body: any) => void }[]
  >([]);
  const { user, setUser } = useContext(profileContext);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const sendMessage = useCallback((destination: string, body: any) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination,
        body: JSON.stringify(body),
      });
    } else {
      console.warn("⚠️ Not connected, message not sent");
    }
  }, []);

  const disconnect = useCallback(() => {
    clientRef.current?.deactivate();
  }, []);

  const subscribe = useCallback((destination: string, callback: any) => {
    setSubs((prev) => [...prev, { destination, callback }]);
    if (clientRef.current?.connected) {
      return clientRef.current.subscribe(destination, (message) =>
        callback(JSON.parse(message.body))
      );
    }
  }, []);

  const onConnect = useCallback(() => {
    console.log("✅ Connected");
    setConnected(true)
  }, []);

  const onReconnect = useCallback((stompClient: Client) => {
    console.log("✅ Connected");
    setConnected(true)
    subs.forEach((sub) => {
      stompClient.subscribe(sub.destination, (msg) =>
        sub.callback(JSON.parse(msg.body))
      );
    });
  }, [subs]);

  useEffect(() => {
    if (connected) return;
    const socket = new SockJS(`http://localhost:4000/ws?username=${user.id}`);

    const stompClient = new Client({
      webSocketFactory: () => socket,
    });

    stompClient.onConnect = () => onConnect();

    stompClient.onWebSocketClose = () => {
      console.log("❌ Connection lost");
      setConnected(false);
    };

    stompClient.activate();
    clientRef.current = stompClient;

    return () => {
      console.log("🔌 Cleaning up...");
      if (!connected) stompClient.deactivate();
    };
  }, [user.id,onConnect]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null;
    if (!connected && clientRef.current) {
      interval = setInterval(() => {
        console.log("🔄 Attempting to reconnect...");
        clientRef.current = new Client({
          webSocketFactory: () =>
            new SockJS(`http://localhost:4000/ws?username=${user.id}`),
        });
        clientRef.current.onConnect = () => onReconnect(clientRef.current!);
        clientRef.current.activate();
        if (clientRef.current.connected) {
          console.log("✅ Reconnected");
          return;
        }
      }, 5000);
    }
    return () => {
      if (clientRef.current && interval != null) {
        clearInterval(interval);
      }
    };
  }, [connected, user.id, onConnect]);

  useEffect(() => {
    setUser((x) => ({
      ...x,
      sendMessage,
      subscribe,
      disconnect,
    }));
  }, [sendMessage, subscribe, disconnect, setUser,connected]);

  // sendMessage("/app/connect", { content: "Hello, World!" });

  return <div></div>;
}
