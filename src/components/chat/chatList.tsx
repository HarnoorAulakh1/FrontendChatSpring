import type {
  messageInterface,
  notificationInterface,
  userInterface,
} from "@/lib/types";
import { useEffect, useState, useContext } from "react";
import { api } from "@/lib/utils";
import { profileContext } from "@/contexts/profile";
import { formatTime } from "@/lib/utils";

import { currentContext } from "@/contexts/current";
import Loading from "@/lib/loader";
export default function ChatList({
  search,
  collapse,
}: {
  search?: string;
  collapse?: boolean;
}) {
  const [friends, setFriends] = useState<userInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredFriends, setFilteredFriends] = useState<userInterface[]>([]);
  useEffect(() => {
    const filtered = friends.filter((user) =>
      user.username.toLowerCase().includes((search || "").toLowerCase())
    );
    setFilteredFriends(filtered);
  }, [search, friends]);
  const { user } = useContext(profileContext);
  useEffect(() => {
    const add_friend = async (data: notificationInterface) => {
      if (data.type != "friend_reqt") return;
      const response = await api.get("/user/getUserById/" + data.sender);
      if (response.status == 200) {
        const userData = response.data;
        setFriends((prev) => [...prev, userData]);
      }
    };
    if (!user.subscribe) return;
    let sub1 = null;
    sub1 = user.subscribe("/topic/notifications", add_friend);
    return () => {
      if (sub1 != null) sub1.unsubscribe();
    };
  }, [user.subscribe]);
  useEffect(() => {
    async function fetchFriends() {
      setLoading(true);
      try {
        const response = await api.get("/user/getFriends/" + user.id);
        if (response.status == 200) {
          const data = response.data;
          setFriends(data);
        } else {
          console.error("Failed to fetch friends");
        }
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
      setLoading(false);
    }
    fetchFriends();
  }, [user.id]);
  return (
    <div className="flex flex-col gap-1 h-max ">
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <Loading />
        </div>
      ) : filteredFriends.length > 0 ? (
        filteredFriends.map((friend) => (
          <ChatListItem key={friend.id} user1={friend} collapse={collapse} />
        ))
      ) : (
        <></>
      )}
    </div>
  );
}

function ChatListItem({
  user1,
  collapse,
}: {
  user1: userInterface;
  collapse?: boolean;
}) {
  const [preview, setPreview] = useState("");
  const [time, setTime] = useState("...");
  const [isOnline, setIsOnline] = useState(false);
  const { user } = useContext(profileContext);
  const { id, username, profilePicture, name } = user1;
  const { current, setCurrent } = useContext(currentContext);
  const [unread, setUnread] = useState<number>(0);
  useEffect(() => {
    const handleOnlineStatus = (data: { sender: string }) => {
      if (data.sender == user1.id) {
        setIsOnline(true);
      }
    };
    const handleOfflineStatus = (data: { sender: string }) => {
      if (data.sender == user1.id) {
        setIsOnline(false);
      }
    };

    const handleMessagePreview = (message: messageInterface) => {
      if (message.sender == id || message.receiver == id) {
        const content = message.content;
        setPreview(
          content.substring(0, 20) + (content.length > 20 ? "..." : "")
        );
        setTime(formatTime(message.created_At));
        if (message.sender !== user.id && current.id != id)
          setUnread((prev) => prev + 1);
      }
    };
    if (!user.subscribe) return;
    const sub1 = user.subscribe("/user/topic/connected", handleOnlineStatus);
    const sub2 = user.subscribe(
      "/user/topic/disconnected",
      handleOfflineStatus
    );
    const sub3 = user.subscribe("/user/topic/preview", handleMessagePreview);
    return () => {
      if (sub1 != null) {
        sub1.unsubscribe();
      }
      if (sub2 != null) {
        sub2.unsubscribe();
      }
      if (sub3 != null) {
        sub3.unsubscribe();
      }
    };
  }, [username, current.id, id, user.id, user.subscribe, user1.id]);
  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const response = await api.get(
          "/user/getPreview?sender=" + id + "&receiver=" + user.id
        );
        if (response.status == 200) {
          const data = response.data;
          if (data && data.id) {
            const temp = formatTime(data.created_At);
            setTime(temp);
          }
          const content = data.content;
          if (content && content.length > 20)
            setPreview(
              content.substring(0, 20) + (content.length > 20 ? "..." : "")
            );
          else setPreview(content);
        }
      } catch (error) {
        console.error("Error fetching preview:", error);
        setPreview("No messages yet ...");
      }
    };
    async function checkOnlineStatus() {
      try {
        const response = await api.get("/user/isOnline/" + id);
        if (response.status == 200) {
          const data = response.data;
          setIsOnline(data.isOnline);
        }
      } catch (error) {
        console.error("Error checking online status:", error);
      }
    }
    async function checkUnread() {
      try {
        const response = await api.get(
          `/message/getUnreadCount?sender=${id}&receiver=${user.id}&readBy=${user.id}`
        );
        if (response.status == 200) {
          const data = response.data;
          console.log("Unread count data:", data);
          if (data) {
            setUnread(data);
          }
        }
      } catch (error) {
        console.error("Error checking unread messages:", error);
      }
    }
    checkUnread();
    checkOnlineStatus();
    fetchPreview();
  }, [id, user.id]);
  async function setCurrrentChat() {
    try {
      await api.post(
        `/message/markAsRead?sender=${user.id}&receiver=${id}&readBy=${
          user.id
        }&time=${new Date().toISOString()}`
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
    setUnread(0);
    setCurrent(() => {
      return {
        id: id,
        username: username,
        profilePicture: profilePicture,
        name: name,
        isOnline: isOnline,
        isGroup: false,
      };
    });
  }
  return (
    <div
      onClick={setCurrrentChat}
      className="flex flex-row items-center gap-2 p-2 group hover:bg-[#454545] rounded-lg cursor-pointer"
    >
      <div className="flex flex-row items-end justify-center">
        {profilePicture != "NULL" ? (
          <div className="w-12 h-12 bg-gray-500 rounded-full flex justify-center items-center">
            <img
              src={profilePicture}
              className="w-12 h-12 bg-gray-500 rounded-full"
            ></img>
          </div>
        ) : (
          <div className="w-12 h-12 bg-gray-500 rounded-full flex justify-center items-center"></div>
        )}
        <div
          className={`rounded-full w-2 h-2 ${
            isOnline == true ? "bg-green-500" : ""
          }`}
        >
          {isOnline}
        </div>
      </div>
      {!collapse && (
        <div className="flex flex-col w-full">
          <div className="flex flex-row justify-between">
            <span className="text-sm font-semibold">{username}</span>
            <p
              className={`text-sm text-gray-500 transition-all duration-150  group-hover:translate-x-[-1rem]`}
            >
              {time}
            </p>
          </div>
          <div className="flex flex-row justify-between w-full">
            <span className="text-xs text-gray-400">{preview}</span>{" "}
            {unread != 0 && (
              <div className="rounded-full w-5 h-5 text-center bg-green-500 text-black text-sm">
                {unread}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
