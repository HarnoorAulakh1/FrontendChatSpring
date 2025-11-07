import { IoIosSend } from "react-icons/io";
import { IoIosCall } from "react-icons/io";
import { FaVideo } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";
import { useContext, useEffect, useRef, useState } from "react";
import { messageContext } from "../../contexts/messages";
import { currentContext } from "@/contexts/current";
import Landing from "./landing";
import { profileContext } from "@/contexts/profile";
import type { messageInterface } from "@/lib/types";
import { formatTime } from "@/lib/utils";
import { api } from "@/lib/utils";
import { FaFileAlt } from "react-icons/fa";
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import { GoSidebarCollapse } from "react-icons/go";

import useNotify from "@/hooks/useNotify";
import type { StompSubscription } from "node_modules/@stomp/stompjs/esm6/stomp-subscription";
import { TypingLoader } from "@/lib/loader";

export default function ChatArea() {
  const {
    current: { profilePicture, username, id, isGroup },
  } = useContext(currentContext);

  return (
    <div className="w-full h-full rounded-2xl p-3">
      <div className=" rounded-2xl w-full h-full">
        {username ? (
          <Messaging
            id={id}
            isGroup={isGroup}
            profilePicture={profilePicture}
            username={username}
          />
        ) : (
          <Landing />
        )}
      </div>
    </div>
  );
}

function Messaging({
  id,
  profilePicture,
  username,
  isGroup,
}: {
  id: string;
  profilePicture: string;
  username: string;
  isGroup?: boolean;
}) {
  const startRef = useRef<HTMLDivElement>(null);
  const { messages, setMessages } = useContext(messageContext);
  const [length, setLength] = useState(0);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const { user, setUser } = useContext(profileContext);
  const { addNotification } = useNotify();
  const [file, setFile] = useState<File>();
  useEffect(() => {
    setTimeout(() => {
      if (startRef.current)
        startRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 200);
  }, [messages]);
  useEffect(() => {
    const handleNewMessage = async (message: messageInterface) => {
      console.log("New message received:", message);
      try {
        const response = await api.post(
          `/message/markAsRead?sender=${user.id}&receiver=${id}&readBy=${user.id}&time=${message.created_At}`
        );
        console.log("Marked messages as read:", response.data);
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
      if (message.sender == id && message.receiver == user.id)
        setMessages((prev) => [...prev, message]);
    };

    function handleTyping(data: {
      sender: string;
      receiver: string;
      description: string;
    }) {
      console.log("Typing event received:", data);
      if (data.sender == id) {
        if (data.description == "typing") setTypingIndicator(true);
        else setTypingIndicator(false);
      }
    }

    let sub = null,
      sub1 = null;
    if (user.subscribe) {
      sub = user.subscribe("/user/topic/messages", handleNewMessage);
      sub1 = user.subscribe("/user/topic/typing", handleTyping);
    }
    // socket.on("message_read",)
    return () => {
      if (sub != null) sub.unsubscribe();
      if (sub1 != null) sub1.unsubscribe();
    };
  }, [setMessages, user.subscribe, user.id, id]);

  useEffect(() => {
    if (length == 1) {
      user.sendMessage("/app/typing", {
        sender: user.id,
        receiver: id,
        description: "typing",
      });
    }
    const timeoutId = setTimeout(() => {
      if (length > 0) {
        user.sendMessage("/app/typing", {
          sender: user.id,
          receiver: id,
          description: "stopped",
        });
        setLength(0);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [length, id, user]);

  useEffect(() => {
    async function getMessages() {
      try {
        const response = await api.get(
          `/message/getMessages?sender=${user.id}&receiver=${id}`
        );
        if (response.status === 200) {
          const data = response.data;
          setMessages(data);
        } else {
          console.error("Failed to fetch messages");
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    }

    if (id && user.id) getMessages();
  }, [id, user.id, setMessages, isGroup]);

  async function sendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    (e.target as HTMLFormElement).reset();
    const content = formData.get("content") as string;
    const form = new FormData();
    const newMessage: messageInterface = {
      sender: user.id,
      receiver: id,
      created_At: new Date().toISOString(),
      content,
    };
    let newMessage1 = {
      sender: user.id,
      receiver: id,
      content,
      file: {
        type: "",
        name: "",
        link: "",
      },
    };
    if (file && file.type) {
      newMessage.file = {
        type: file.type.split("/")[0],
        name: file.name,
        link: URL.createObjectURL(file),
      };
      newMessage1 = {
        ...newMessage1,
        file: {
          type: file.type.split("/")[0],
          name: file.name,
          link: "",
        },
      };
      form.append("file", file);
    }
    form.append("message", JSON.stringify(newMessage1));
    console.log("Sending message:", newMessage1);

    const response = await api.post("/message/send", form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    if (response.status !== 200) {
      addNotification({
        title: "Failed to send message",
        description: "There was an error sending your message.",
        type: "error",
      });
      return;
    }
    setMessages((x) => [...x, newMessage]);
    setFile({} as File);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const fileInput = e.target;
    if (fileInput.files && fileInput.files.length > 0) {
      const selectedFile = fileInput.files[0];
      setFile(selectedFile);
    }
  }
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-row items-center gap-2 p-3 ">
        <button
          onClick={() => setUser((x) => ({ ...x, collapse: !x.collapse }))}
          className="p-2 rounded-xl hover:bg-gray-700 text-md "
        >
          <GoSidebarCollapse className="text-xl text-[#e5e5e5]" />
        </button>
        <h1 className="text-[#e5e5e5]  font-bold">Xchat</h1>
      </div>
      <div className="flex flex-row bg-[#0a0a0a] rounded-t-2xl items-center justify-between p-3 border-b border-gray-700">
        <div className="flex flex-row items-center gap-4">
          {profilePicture != "NULL" ? (
            <img
              src={profilePicture}
              className="w-15 h-15 bg-gray-500 rounded-full"
            ></img>
          ) : (
            <div className="w-12 h-12 bg-gray-500 rounded-full flex justify-center items-center"></div>
          )}
          <span className="text-lg font-semibold">{username}</span>
        </div>
        <div className="flex flex-row items-center gap-2">
          <button className="p-2 rounded-xl hover:bg-gray-700">
            <IoIosCall className="text-xl" />
          </button>
          <button className="p-2 rounded-xl hover:bg-gray-700">
            <FaVideo className="text-xl" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 bg-[#0a0a0a]">
        <div className="flex flex-col gap-2">
          {messages.map((message, index) => (
            <Message
              key={index}
              message={message.content}
              file={message.file}
              time={message.created_At}
              isSender={message.sender == user.id}
              readBy={message.isRead}
              receiver={message.receiverEm?.id}
            />
          ))}
          {typingIndicator && <TypingLoader />}
          <div ref={startRef} className=" w-full h-4"></div>
        </div>
      </div>
      <form
        onSubmit={(e) => sendMessage(e)}
        className="p-3 border-t border-gray-700 bg-[#0a0a0a] rounded-b-2xl"
      >
        <div className="flex flex-row  items-center">
          <div className="w-full gap-2 flex flex-row items-center">
            <label
              htmlFor="fileUpload"
              className="hover:bg-gray-700 p-2 rounded-lg"
            >
              <FaPlus />
              <input
                id="fileUpload"
                onChange={(e) => handleFileUpload(e)}
                type="file"
                className="hidden"
              />
            </label>
            <input
              name="content"
              type="text"
              onChange={() => setLength((x) => x + 1)}
              className="flex-1 p-2 bg-gray-800 text-white rounded-xl outline-none"
              placeholder="Type a message..."
            />
            <button className="p-2 text-white rounded-lg hover:bg-blue-700">
              <IoIosSend className="text-xl" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
function Message({
  message,
  file,
  time,
  isSender,
  readBy,
  receiver,
}: {
  message: string;
  file?: {
    type: string;
    name: string;
    link: string;
  };
  time: string;
  isSender: boolean;
  readBy:
    | {
        user: string;
        readAt: Date;
      }[]
    | undefined;
  receiver?: string;
}) {
  const { user } = useContext(profileContext);
  const [time1] = useState<string>(formatTime(time));
  const { current } = useContext(currentContext);
  const [isRead, setRead] = useState(
    readBy && readBy.length > 0 && readBy.some((read) => read.user === receiver)
  );
  useEffect(() => {
    const handleMessageRead = (data: {
      sender: string;
      receiver: string;
      time: string;
    }) => {
      console.log("Message read event received:", data);
      if (new Date(data.time).toISOString() >= new Date(time).toISOString()) {
        setRead(true);
      }
    };
    let sub1: StompSubscription | null;
    if (!isRead && user.subscribe)
      sub1 = user.subscribe("/user/topic/markAsRead", handleMessageRead);
    return () => {
      if (sub1 != null) sub1.unsubscribe();
    };
  }, [user.subscribe, user.id, time, receiver, isRead]);
  return (
    <div
      className={`flex flex-col  items-center ${
        isSender
          ? "bg-green-800 text-white self-end"
          : "bg-gray-800 text-white self-start"
      } rounded-lg max-w-[30rem] min-w-[5rem]`}
    >
      <div
        className={`flex flex-col gap-4 ${
          isSender
            ? "bg-green-800 text-white self-end"
            : "bg-gray-800 text-white self-start"
        } p-2 rounded-lg max-w-xs`}
      >
        <div className="flex flex-row items-center gap-2">
          <p>{message}</p>
        </div>
        {file?.link && file.link.length > 0 && (
          <div className="flex flex-col gap-2 items-center">
            {file.type == "image" ? (
              <a
                href={file.link}
                className="text-blue-400 hover:underline "
                target="_blank"
              >
                {file.link && <img src={file.link} alt="" />}
              </a>
            ) : (
              <a
                href={file.link}
                className="text-blue-400 hover:underline cursor-pointer"
                target="_blank"
              >
                <div className="flex justify-center cursor-pointer items-center">
                  <FaFileAlt className="text-[3rem] text-gray-300" />
                </div>
              </a>
            )}
            <span className="text-xs text-gray-200">{file.name}</span>
          </div>
        )}
      </div>
      <div className="flex flex-row justify-end w-full mr-2">
        <p
          className={`${isSender ? "text-[#d0d0d0]" : "text-gray-400"} text-xs`}
        >
          {time1}
        </p>
        {isSender && (
          <div className="flex flex-row  gap-0">
            <IoCheckmarkDoneOutline
              className={` ${
                isRead && !current.isGroup ? "text-blue-400" : "text-gray-400"
              }`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
