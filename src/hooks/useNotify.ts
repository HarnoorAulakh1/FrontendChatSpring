import { useContext } from "react";
import { notificationContext } from "../contexts/notification";

export default function useNotify() {
  const { notify } = useContext(notificationContext);
  function addNotification({
    title,
    description,
    type,
    time,
    sender,
    receiver,
    popup=false,
    _id = Math.random().toString(36).substring(2, 15),
  }: {
    title: string;
    description: string;
    type: string;
    time?: number;
    sender?: string;
    receiver?: string;
    popup?: boolean;
    _id?: string;
  }) {
    console.log("Adding notification:", {
      title,
      description,});
    const newNotification = {
      title,
      description,
      type,
      time: time || 3000,
      sender,
      receiver,
      popup,
      _id,
    };
    notify((prev) => {
      return [...prev, newNotification];
    });
  }
  return {
    addNotification,
    notify,
  };
}
