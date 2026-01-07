import { useState, useRef, useContext, useEffect } from "react";
import { Client, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { profileContext } from "@/contexts/profile";
import { useCallback } from "react";
import Cookies from  "js-cookie";


export default function useStompClient() {
  const [subs, setSubs] = useState<
    {
      destination: string;
      callback: (body: any) => void;
      subId: StompSubscription;
    }[]
  >([]);
  //const token=Cookies.get("JWT_TOKEN");
  const { user, setUser } = useContext(profileContext);
  const connectingRef = useRef(false);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const [retry, setRetryCount] = useState(-1);
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

  const subscribe = useCallback(
    (
      destination: string,
      callback: (body: any) => void
    ): StompSubscription | null => {
      if (clientRef.current?.connected) {
        const sub = clientRef.current.subscribe(destination, (message) =>
          callback(JSON.parse(message.body))
        );
        setSubs((prev) => [...prev, { destination, callback, subId: sub }]);
        return sub;
      }
      return null;
    },
    []
  );

  const onConnect = useCallback(() => {
    //console.log("✅ Connected");
    setConnected(true);
  }, []);

  const onReconnect = useCallback(
    (stompClient: Client) => {
      subs.forEach((sub) => {
        stompClient.subscribe(sub.destination, (msg) =>
          sub.callback(JSON.parse(msg.body))
        );
      });
    },
    [subs]
  );

  useEffect(() => {
    if (connected) return;
    const socket = new SockJS(`http://localhost:4000/ws`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
    });

    stompClient.onConnect = () => onConnect();

    stompClient.onWebSocketClose = () => {
      setConnected(true);
      setRetryCount((prev) => prev + 1);
      setConnected(false);
    };

    stompClient.activate();
    clientRef.current = stompClient;

    return () => {
      //console.log("🔌 Cleaning up...");
      if (!connected) stompClient.deactivate();
    };
  }, [user.id, onConnect,Cookies]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    console.log(
      `Connection status: ${connected ? "Connected" : "Disconnected"}`
    );
    if (
      !connected &&
      retry >= 0 &&
      retry < 10 &&
      connectingRef.current === false
    ) {
      connectingRef.current = true;
      console.log(`⏳ Scheduling reconnect attempt #${retry + 1} in 3s...`);
      timeout = setTimeout(() => {
        console.log("🔄 Attempting to reconnect...");

        if (clientRef.current) {
          try {
            clientRef.current.deactivate();
          } catch (err) {
            console.warn("Error deactivating old client:", err);
          }
        }
        const client = new Client({
          webSocketFactory: () =>
            new SockJS(`http://localhost:4000/ws`),
        });

        // If connected successfully
        client.onConnect = () => {
          console.log("✅ STOMP reconnected successfully");
          setConnected(true);
          setRetryCount(0); // reset retries
          clientRef.current = client;
          onReconnect(client);
          connectingRef.current = false;
        };

        // If connection closes unexpectedly
        client.onWebSocketClose = () => {
          console.warn("❌ STOMP connection closed");
          setConnected(false);
          setRetryCount((prev) => prev + 1);
          connectingRef.current = false;
        };

        client.onStompError = (frame) => {
          console.error("STOMP error:", frame.headers["message"]);
          client.deactivate();
          setConnected(false);
          setRetryCount((prev) => prev + 1);
        };
        client.activate();
        clientRef.current = client;
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [connected, user.id, retry]);

  useEffect(() => {
    setUser((x) => ({
      ...x,
      sendMessage,
      disconnect,
      subscribe,
    }));
  }, [sendMessage, subscribe, disconnect, setUser, connected]);

  // sendMessage("/app/connect", { content: "Hello, World!" });

  return <div></div>;
}
