import { useContext, useEffect, useRef, useState } from "react";
import { api, formatTime } from "../../lib/utils";
import type { messageInterface, roomMember } from "../../lib/types";
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import { FaFileAlt } from "react-icons/fa";
import StompSocket from "../../lib/StompSocket";
import { useNavigate } from "react-router";
import { profileContext } from "../../contexts/profile";
import { IoIosCall, IoIosSend } from "react-icons/io";
import { FaPlus, FaVideo } from "react-icons/fa6";
import { TypingLoader } from "../../lib/loader";

export default function RoomChat() {
  const [member, setMember] = useState<roomMember>();
  const [roomId, setRoomId] = useState<string>("");
  const [roomName, setRoomName] = useState<string>("");
  const [file, setFile] = useState<File>({} as File);
  const [messages, setMessages] = useState<messageInterface[]>([]);
  const { user } = useContext(profileContext);
  const [typingIndicator, setTypingIndicator] = useState<boolean>(false);
  const [length, setLength] = useState<number>(0);
  const startRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetch() {
      try {
        const response = await api.get("/auth/checkLogin");
        if (response.status === 200) {
          const data = response.data;
          console.log("Token data= ", data);
          setMember({
            id: data.memberId,
            username: data.username,
          });
          setRoomId(data.roomId);
          setRoomName(data.roomName);
        }
      } catch (err) {
        navigate("/room");
        console.error(err);
      }
    }
    fetch();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (startRef.current)
        startRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 200);
  }, [messages]);
  useEffect(() => {
    const handleNewMessage = async (message: messageInterface) => {
      console.log("Received message:", message);
      if (message.roomId == roomId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    function handleTyping(data: {
      sender: string;
      receiver: string;
      description: string;
    }) {
      if (data.sender == member?.id) {
        if (data.description == "typing") setTypingIndicator(true);
        else setTypingIndicator(false);
      }
    }

    let sub = null,
      sub1 = null;
    if (user.subscribe) {
      console.log("Subscribing to messages and typing topics");
      sub = user.subscribe("/user/topic/messages", handleNewMessage);
      sub1 = user.subscribe("/user/topic/typing", handleTyping);
    }
    // socket.on("message_read",)
    return () => {
      if (sub != null) sub.unsubscribe();
      if (sub1 != null) sub1.unsubscribe();
    };
  }, [setMessages, user.subscribe, roomId, member?.id,user]);

  useEffect(() => {
    if (length == 1 && user.sendMessage) {
      user.sendMessage("/app/typing", {
        sender: member?.id,
        receiver: "",
        description: "typing",
      });
    }
    const timeoutId = setTimeout(() => {
      if (length > 0 && user.sendMessage) {
        user.sendMessage("/app/typing", {
          sender: member?.id,
          receiver: "",
          roomId: roomId,
          description: "stopped",
        });
        setLength(0);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [length, member?.id, user, user.sendMessage]);

  useEffect(() => {
    async function getMessages() {
      try {
        const response = await api.get(
          `/message/getMessages?roomId=${roomId}&sender=&receiver=`
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

    if (member?.id) getMessages();
  }, [member?.id, user.id, setMessages]);

  async function sendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    (e.target as HTMLFormElement).reset();
    const content = formData.get("content") as string;
    const form = new FormData();
    const newMessage: messageInterface = {
      sender: member?.id || "",
      receiver: "",
      created_At: new Date().toISOString(),
      content,
    };
    let newMessage1 = {
      sender: member?.id || "",
      receiver: "",
      roomId: roomId,
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
    //console.log("New Message preview:", newMessage);
    form.append("message", JSON.stringify(newMessage1));
    setFile({} as File);
    await api.post("/message/send", form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    setMessages((x) => [...x, newMessage]);
  }
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const fileInput = e.target;
    if (fileInput.files && fileInput.files.length > 0) {
      const selectedFile = fileInput.files[0];
      setFile(selectedFile);
    }
  }
  return (
    <div className="fixed  w-full h-full z-20">
        <StompSocket />
      <div className="w-full h-full flex flex-col">
        <div className="flex flex-row items-center gap-2 p-3 ">
          <h1 className="text-[#e5e5e5]  font-bold">Xchat</h1>
        </div>
        <div className="flex flex-row bg-[#0a0a0a] z-20 rounded-t-2xl items-center justify-between p-3 border-b border-gray-700">
          <div className="flex flex-row items-center gap-4">
            <span className="text-lg font-semibold">{roomName}</span>
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
                senderEm={message.senderEm}
                file={message.file}
                time={message.created_At}
                isSender={message.sender == member?.id}
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
    </div>
  );
}

function Message({
  message,
  file,
  time,
  isSender,
  senderEm,
}: {
  message: string;
  file?: {
    type: string;
    name: string;
    link: string;
  };
  time: string;
  isSender: boolean;
    senderEm?: { id: string; username: string
        }
}) {
  const [time1] = useState<string>(formatTime(time));
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
        <div className="flex flex-col items-start gap-2">
            <p className="text-sm text-[#919191]">{isSender?"YOU":senderEm?.username}</p>
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
            <IoCheckmarkDoneOutline className={"text-gray-400"} />
          </div>
        )}
      </div>
    </div>
  );
}
