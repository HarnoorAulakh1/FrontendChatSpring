import { IoIosSend } from "react-icons/io";
import { IoIosCall } from "react-icons/io";
import { FaVideo } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";
import { useContext, useEffect, useRef, useState } from "react";
import { messageContext } from "../../contexts/message";
import { currentContext } from "@/contexts/current";
import Landing from "./landing";
import { profileContext } from "@/contexts/profile";
import type { messageInterface } from "@/lib/types";
import { formatTime } from "@/lib/utils";
import { api } from "@/lib/utils";
import { FaFileAlt } from "react-icons/fa";
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import { GoSidebarCollapse } from "react-icons/go";
import type { StompSubscription } from "node_modules/@stomp/stompjs/esm6/stomp-subscription";
import { TypingLoader } from "@/lib/loader";
import { webrtcContext } from "@/contexts/webrtc";

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
  const [messages, setMessages] = useState<messageInterface[]>([]);
  const [length, setLength] = useState(0);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const { user, setUser } = useContext(profileContext);
  const { setMessage } = useContext(messageContext);
  const [file, setFile] = useState<File>();
  const { data, setData } = useContext(webrtcContext);
  const remoteStreamRef = useRef<MediaStream>(new MediaStream());
  const playedRef = useRef<boolean>(false);

  // function handleUserGesture() {
  //   console.log("User gesture detected");
  //   // Try to play remote video now
  //   if (remoteRef.current) remoteRef.current.muted = !remoteRef.current.muted;
  //   //remoteRef.current?.play().catch(() => {});
  // }

  useEffect(() => {
    if (data.status == "disconnected") {
      playedRef.current = false;
      remoteStreamRef.current.getTracks().forEach((t) => t.stop());
      remoteStreamRef.current = new MediaStream();
    }
  }, [data.status]);
  async function createOffer() {
    console.log("Creating offer to", id);
    if (user.sendMessage) {
      user.sendMessage("/app/signal/sendIncoming", {
        sender: user.id,
        receiver: id,
        status: "calling",
      });
    }
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        {
          urls: "turn:free.expressturn.com:3478",
          username: "000000002086098388",
          credential: "ueJtH+gb9wfnfmMonIu9q2tPlxU=",
        },
      ],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        if (user.sendMessage)
          user.sendMessage("/app/signal/ice", {
            candidate: event.candidate,
            receiver: id,
            sender: user.id,
          });
      }
    };
    pc.ontrack = (event) => {
      const track = event.track;
      console.log("Received remote track:", event, playedRef.current);

      if (!remoteStreamRef.current.getTracks().some((t) => t.id === track.id)) {
        remoteStreamRef.current.addTrack(track);
      }

      if (!playedRef.current) {
        console.log("Playing remote stream for the first time");
        setData((x) => ({
          ...x,
          remoteStream: remoteStreamRef.current,
        }));
        playedRef.current = true;
      }
    };
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setData((x) => ({
      ...x,
      pc,
      status: "connecting",
      callScreen: "outgoing",
      callerId: user.id,
      calleeId: id,
      localStream: stream,
    }));
    //localRef.current!.srcObject = stream;
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });
    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    await pc.setLocalDescription(offer);
    if (user.sendMessage)
      user.sendMessage("/app/signal/offer", {
        sdp: offer.sdp,
        type: offer.type,
        receiver: id,
        sender: user.id,
      });
  }

  useEffect(() => {
    setTimeout(() => {
      if (startRef.current)
        startRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 200);
  }, [messages]);
  useEffect(() => {
    const handleNewMessage = async (message: messageInterface) => {
      try {
        await api.post(
          `/message/markAsRead?sender=${user.id}&receiver=${id}&readBy=${user.id}&time=${message.created_At}`,
        );
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
      if (message.sender == id && message.receiver == user.id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    function handleTyping(data: {
      sender: string;
      receiver: string;
      description: string;
    }) {
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
  }, [setMessages, user.subscribe, user.id, id, user]);

  useEffect(() => {
    if (length == 1 && user.sendMessage) {
      user.sendMessage("/app/typing", {
        sender: user.id,
        receiver: id,
        description: "typing",
      });
    }
    const timeoutId = setTimeout(() => {
      if (length > 0 && user.sendMessage) {
        user.sendMessage("/app/typing", {
          sender: user.id,
          receiver: id,
          description: "stopped",
        });
        setLength(0);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [length, id, user, user.sendMessage]);

  useEffect(() => {
    async function getMessages() {
      try {
        const response = await api.get(
          `/message/getMessages?sender=${user.id}&receiver=${id}&roomId=`,
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
    //console.log("New Message preview:", newMessage);
    setMessage({ ...newMessage, created_At: new Date().toISOString() });
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
    <div className="w-full h-full flex flex-col">
      {/* <div className="flex flex-col gap-4">
        <h1 className="text-2xl"> Video stream</h1>
        <div className="flex flex-row justify-center gap-2 rounded-2xl w-[30%] h-[50%] z-20 absolute">
          <video
            ref={localRef}
            autoPlay
            playsInline
            muted
            style={{ width: "400px", borderRadius: "12px", height: "300px" }}
          />
          <video
            ref={remoteRef}
            playsInline
            muted
            style={{ width: "400px", borderRadius: "12px", height: "300px" }}
          />
        </div>
      </div> */}

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

          <button
            onClick={createOffer}
            className="p-2 rounded-xl hover:bg-gray-700"
          >
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
  const [isRead, setRead] = useState(
    readBy &&
      readBy.length > 0 &&
      readBy.some((read) => read.user === receiver),
  );
  useEffect(() => {
    const handleMessageRead = (data: {
      sender: string;
      receiver: string;
      time: string;
    }) => {
      if (new Date(data.time).toISOString() >= new Date(time).toISOString()) {
        setRead(true);
      }
    };
    let sub1: StompSubscription | null | undefined;
    if (!isRead && user.subscribe)
      sub1 = user.subscribe("/user/topic/markAsRead", handleMessageRead);
    return () => {
      if (sub1 != null) sub1.unsubscribe();
    };
  }, [user.subscribe, user.id, time, receiver, isRead, user]);
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
              className={` ${isRead ? "text-blue-400" : "text-gray-400"}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
