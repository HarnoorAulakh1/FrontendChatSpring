import React, { useEffect, useState } from "react";
import { notificationContext } from "./notification";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { IoMdPersonAdd } from "react-icons/io";
import type { notificationInterface } from "../lib/types";
import { profileContext } from "./profile";
import { useContext } from "react";
import type { StompSubscription } from "@stomp/stompjs";

export default function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, notify] = useState<notificationInterface[]>([]);
  const { user } = useContext(profileContext);
  useEffect(() => {
    const handle = (data: notificationInterface) => {
      notify((prev) => [...prev, data]);
    };
    let sub1: StompSubscription | null | undefined;
    if (user.subscribe)
    sub1 = user.subscribe("/user/topic/notifications", handle);

    // socket.on("receive_friend_request", handle);
    // socket.on("friend_request_accepted", handle);
    // socket.on("receive_group_request", handle);
    // socket.on("group_request_accepted", handle);
    return () => {
      if (sub1) {
        console.log("Unsubscribing from notifications",sub1);
        sub1.unsubscribe();}
    };
  }, [user.subscribe, user]);

  return (
    <notificationContext.Provider value={{ notifications, notify }}>
      {children}
      <div className="flex flex-col justify-center items-center z-999 fixed top-5 md:top-2 left-[10%] md:left-[40%]">
        {notifications.map(
          (item, index) =>
            item != undefined && (
              <Tab
                key={index}
                title={item.title}
                description={item.description}
                type={item.type}
                time={item.time}
                popup={item.popup}
              />
            )
        )}
      </div>
    </notificationContext.Provider>
  );
}

function Tab({
  title,
  description,
  type,
  time,
  popup = true,
}: {
  title: string;
  description: string;
  type: string;
  time?: number;
  popup?: boolean;
}) {
  const [visible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, time || 3000);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {visible && popup && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full flex justify-center items-center"
          >
            <div className="backdrop-blur-lg bg-white/30 border border-white/20 shadow-lg rounded-2xl px-4 py-3 flex items-center gap-3 max-w-md w-full">
              <Icon type={type} />
              <div className="flex flex-col text-sm text-black/90">
                <span className="font-semibold">{title}</span>
                <span className="text-xs text-black/70">{description}</span>
              </div>
              <button
                onClick={() => setVisible(false)}
                className="ml-auto text-xs text-black/50 hover:text-black"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Icon({ type }: { type: string }) {
  return (
    <>
      {type == "success" ? (
        <div className="bg-green-500 text-white rounded-full p-3"></div>
      ) : type == "error" ? (
        <div className="bg-red-500 text-white rounded-full p-2"></div>
      ) : (
        <IoMdPersonAdd className="text-2xl text-green-500" />
      )}
    </>
  );
}
