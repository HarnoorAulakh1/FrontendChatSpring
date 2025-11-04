import ChatArea from "@/components/chat/chatArea";
import SideBar from "@/components/sidebar";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import { api } from "../lib/utils";
import { profileContext } from "@/contexts/profile";
import { useState } from "react";
import Loader from "@/lib/loader";
import useNotify from "@/hooks/useNotify";
import type { notificationInterface } from "@/lib/types";

export default function AppLayout() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(profileContext);
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();
  useEffect(() => {
    async function check() {
      setLoading(false);
      try {
        const response = await api.get("/auth/checkLogin");
        if (response.status == 200) {
          const data = response.data;
          setUser((x) => {
            return {
              ...x,
              id: data.id,
              username: data.username,
              email: data.email,
              name: data.name,
              profilePicture: data.profilePicture,
              isOnline: data.isOnline,
            };
          });
        }
      } catch (err) {
        console.error(err);
        navigate("/");
        setLoading(true);
      }
      setLoading(true);
    }
    check();
    
  }, [navigate, setUser]);


  useEffect(() => {
    async function handle() {
      try {
        const response = await api.get(
          "/notification/getNotifications/" + user.id
        );
        console.log(response.data);
        if (response.status == 200) {
          let data = response.data;
          data = data.map((notification: notificationInterface) => {
            return {
              ...notification,
              popup: false,
            };
          });
          notify((x) => {
            return [...x, ...data];
          });
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    }
    if (user.id) handle();
  }, [notify, user.id]);
  return (
    <div className="bg-[#171717] text-[#e5e5e5] flex flex-row w-full h-[100%] overflow-y-hidden">
      {loading ? (
        <>
          <SideBar />
          <ChatArea />
        </>
      ) : (
        <Loader />
      )}
    </div>
  );
}
