import { useContext, useEffect, useRef, useState } from "react";
import { IoIosMic } from "react-icons/io";
import { ImPhoneHangUp } from "react-icons/im";
import { BsFillCameraVideoFill } from "react-icons/bs";
import { BsFillCameraVideoOffFill } from "react-icons/bs";
import { IoMicOffSharp } from "react-icons/io5";
import { webrtcContext } from "@/contexts/webrtc";
import { api } from "@/lib/utils";
import type { userInterface } from "@/lib/types";
import { profileContext } from "@/contexts/profile";

export default function VideoCall() {
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const remoteStreamRef = useRef<MediaStream>(new MediaStream());
  const playedRef = useRef<boolean>(false);
  const [accepted, setAccepted] = useState(false);
  const { data, setData } = useContext(webrtcContext);
  const { user } = useContext(profileContext);
  const [callData, setCallData] = useState<{
    caller: userInterface;
    callee: userInterface;
  }>();

  const toggleMute = () => {
    const track = streamRef.current!.getAudioTracks()[0];
    console.log("Toggling audio . Current state:", track.enabled);
    track.enabled = !track.enabled;
    setMuted(!track.enabled);
  };

  const toggleVideo = () => {
    const track = streamRef.current!.getVideoTracks()[0];
    console.log("Toggling video. Current state:", track.enabled);
    track.enabled = !track.enabled;
    setVideoOff(!track.enabled);
  };

  useEffect(() => {
    if (data.callScreen === "outgoing" && data.pc) {
      data.pc.ontrack = (event) => {
        const track = event.track;
        console.log("Received remote track:", event);

        if (
          !remoteStreamRef.current.getTracks().some((t) => t.id === track.id)
        ) {
          remoteStreamRef.current.addTrack(track);
        }

        if (remoteRef.current && !remoteRef.current.srcObject) {
          remoteRef.current.srcObject = remoteStreamRef.current;
        }

        if (!playedRef.current && remoteRef.current) {
          remoteRef.current.play().catch(() => {});
          playedRef.current = true;
        }
      };
      localVideoRef.current!.srcObject = data.localStream;
      streamRef.current = data.localStream;
    }
  }, [data.callScreen, data.pc, data.localStream]);

  useEffect(() => {
    async function getUserData() {
      if (!data.callerId || !data.calleeId) return;
      try {
        const responseCaller = await api.get(
          "/user/getUserById/" + data.callerId
        );
        const responseCallee = await api.get(
          "/user/getUserById/" + data.calleeId
        );
        console.log("Caller Data:", responseCaller.data);
        console.log("Callee Data:", responseCallee.data);
        setCallData({
          caller: responseCaller.data,
          callee: responseCallee.data,
        });
      } catch (error) {
        console.log("Error fetching user data:", error);
        return;
      }
    }
    getUserData();
  }, [data.callerId, data.calleeId]);

  const handleCall = async (status: "accepted" | "declined") => {
    if (status === "declined") {
      console.log("Declining call with data:", data);
      setAccepted(false);
      if (user.sendMessage) {
        user.sendMessage("/app/signal/action", {
          receiver: data.callerId,
          sender: user.id,
          status: "declined",
        });
      }
    } else {
      setAccepted(true);
      //console.log("Accepting call with data:", data);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localVideoRef.current!.srcObject = stream;
      streamRef.current = stream;
      console.log("Local stream set:", data.pc);
      if (data.pc) {
        data.pc.ontrack = (event) => {
          //console.log("Received remote track:", event);

          const track = event.track;

          if (
            !remoteStreamRef.current.getTracks().some((t) => t.id === track.id)
          ) {
            remoteStreamRef.current.addTrack(track);
          }

          if (remoteRef.current && !remoteRef.current.srcObject) {
            remoteRef.current.srcObject = remoteStreamRef.current;
          }

          if (!playedRef.current && remoteRef.current) {
            remoteRef.current.play().catch(() => {});
            playedRef.current = true;
          }
        };

        // .then is done to ensure that the remote description is set before adding ice
        await data.pc
          .setRemoteDescription(
            new RTCSessionDescription({
              sdp: data.sdp,
              type: data.type,
            })
          )
          .then(() => {
            setData((x) => ({ ...x, status: "connected" }));
          });

        stream.getTracks().forEach((track) => {
          data.pc?.addTrack(track, stream);
        });
        const answer = await data.pc.createAnswer();
        await data.pc.setLocalDescription(answer);
        if (user.sendMessage) {
          user.sendMessage("/app/signal/answer", {
            sdp: answer.sdp,
            type: answer.type,
            receiver: data.callerId,
            sender: user.id,
          });
          user.sendMessage("/app/signal/action", {
            receiver: data.callerId,
            sender: user.id,
            status: "accepted",
          });
        }
      }
    }
  };

  return (
    <>
      {data.callScreen == "incoming" ? (
        accepted ? (
          <div className="relative h-full w-full bg-black">
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <video
                ref={remoteRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted={true}
              className="absolute top-4 right-4 w-32 h-44 rounded-xl object-cover border border-gray-700"
            />

            <div className="absolute top-6 left-6 text-white">
              <p className="text-lg font-medium">
                {callData?.caller.username == user.username
                  ? callData?.callee.username
                  : callData?.caller.username}
              </p>
              <p className="text-sm text-gray-400">Video call</p>
            </div>

            <div className="absolute bottom-10 w-full flex justify-center gap-6">
              <button
                onClick={toggleMute}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white ${
                  muted ? "bg-gray-600" : "bg-gray-800"
                }`}
              >
                {muted ? (
                  <IoMicOffSharp className="text-2xl" />
                ) : (
                  <IoIosMic className="text-2xl" />
                )}
              </button>

              <button
                onClick={() => setAccepted((x) => !x)}
                className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-400 flex items-center justify-center text-white text-xl"
              >
                {<ImPhoneHangUp className="text-2xl" />}
              </button>

              <button
                onClick={toggleVideo}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white ${
                  videoOff ? "bg-gray-600" : "bg-gray-800"
                }`}
              >
                {videoOff ? (
                  <BsFillCameraVideoOffFill className="text-2xl" />
                ) : (
                  <BsFillCameraVideoFill className="text-2xl" />
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full w-full bg-black flex flex-col items-center justify-center text-white">
            <img
              src={callData?.caller.profilePicture || "/defaultProfile.png"}
              alt="caller"
              className="w-28 h-28 rounded-full mb-6"
            />

            <h2 className="text-xl font-medium">{callData?.caller.username}</h2>
            <p className="text-gray-400 mt-1">{data.callScreen + " ....."}</p>

            <div className="flex gap-12 mt-16">
              <button
                onClick={() => handleCall("declined")}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-400 flex items-center justify-center text-white text-xl"
              >
                {<ImPhoneHangUp className="text-2xl" />}
              </button>
              <button
                onClick={() => handleCall("accepted")}
                className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-400 flex items-center justify-center text-xl"
              >
                <BsFillCameraVideoFill className="text-2xl text-white" />
              </button>
            </div>
          </div>
        )
      ) : (
        data.callScreen == "outgoing" && (
          <div className="relative h-full w-full bg-black">
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <video
                ref={remoteRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted={true}
              className="absolute top-4 right-4 w-32 h-44 rounded-xl object-cover border border-gray-700"
            />

            <div className="absolute top-6 left-6 text-white">
              <p className="text-lg font-medium">
                {callData?.caller.username == user.username
                  ? callData?.callee.username
                  : callData?.caller.username}
              </p>
              <p className="text-sm text-gray-400">Video call</p>
            </div>

            <div className="absolute bottom-10 w-full flex justify-center gap-6">
              <button
                onClick={toggleMute}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white ${
                  muted ? "bg-gray-600" : "bg-gray-800"
                }`}
              >
                {muted ? (
                  <IoMicOffSharp className="text-2xl" />
                ) : (
                  <IoIosMic className="text-2xl" />
                )}
              </button>

              <button
                onClick={() => setAccepted((x) => !x)}
                className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-400 flex items-center justify-center text-white text-xl"
              >
                {<ImPhoneHangUp className="text-2xl" />}
              </button>

              <button
                onClick={toggleVideo}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white ${
                  videoOff ? "bg-gray-600" : "bg-gray-800"
                }`}
              >
                {videoOff ? (
                  <BsFillCameraVideoOffFill className="text-2xl" />
                ) : (
                  <BsFillCameraVideoFill className="text-2xl" />
                )}
              </button>
            </div>
          </div>
        )
      )}
    </>
  );
}
