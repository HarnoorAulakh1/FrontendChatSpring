import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { IoIosMic } from "react-icons/io";
import { ImPhoneHangUp } from "react-icons/im";
import { BsFillCameraVideoFill } from "react-icons/bs";
import { BsFillCameraVideoOffFill } from "react-icons/bs";
import { IoMicOffSharp } from "react-icons/io5";
import { webrtcContext } from "@/contexts/webrtc";
import { api } from "@/lib/utils";
import type { callInterface, userInterface } from "@/lib/types";
import { profileContext } from "../../contexts/profile";
import type { StompSubscription } from "@stomp/stompjs";

export default function VideoCall() {
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const { data, setData } = useContext(webrtcContext);
  const { user } = useContext(profileContext);
  const [callData, setCallData] = useState<{
    caller: userInterface;
    callee: userInterface;
  }>();

  useEffect(() => {
    setMuted(false);
    setVideoOff(false);
  }, [data.callScreen, data.pc, data.localStream, data.remoteStream]);

  const toggleMute = () => {
    const track = streamRef.current!.getAudioTracks()[0];
    //console.log("Toggling audio . Current state:", track.enabled);
    track.enabled = !track.enabled;
    setMuted(!track.enabled);
  };

  const toggleVideo = () => {
    const track = streamRef.current!.getVideoTracks()[0];
    //console.log("Toggling video. Current state:", track.enabled);
    track.enabled = !track.enabled;
    setVideoOff(!track.enabled);
  };

  // To end call and reset the states and streams
  const endCall = useCallback(
    (status: string, relay: boolean) => {
      console.log(
        "Ending call safely...",
        data.localStream,
        data.remoteStream,
        localVideoRef.current,
        streamRef.current,
        remoteRef.current,
        remoteStreamRef.current,
      );
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          stream.getTracks().forEach((track) => track.stop());
        })
        .catch(() => {});
      if (status === "ended") {
        if (streamRef.current && localVideoRef.current) {
          console.log("Stopping local stream tracks...");
          streamRef.current.getTracks().forEach((track) => {
            track.stop();
          });
          localVideoRef.current.srcObject = null;
          streamRef.current = null;
        }
        if (remoteRef.current) {
          remoteRef.current.srcObject = null;
          remoteRef.current.load();
        }
        remoteStreamRef.current?.getTracks().forEach((t) => t.stop());
        remoteStreamRef.current = null;
      } else {
        if (data.localStream) {
          console.log("Stopping local stream tracks...");
          data.localStream.getTracks().forEach((track) => {
            track.stop();
          });
        }
        if (data.remoteStream) {
          console.log("Stopping remote stream tracks...");
          data.remoteStream.getTracks().forEach((track) => {
            track.stop();
          });
        }
      }

      if (data.pc) {
        data.pc.onicecandidate = null;
        data.pc.ontrack = null;
        data.pc.oniceconnectionstatechange = null;
        data.pc.onconnectionstatechange = null;
        data.pc.getSenders().forEach((sender) => {
          try {
            data.pc?.removeTrack(sender);
          } catch {
            console.log("Error removing sender track");
          }
        });

        data.pc.close();
        data.pc = null;
      }

      remoteStreamRef.current = null;

      setData((x) => ({
        ...x,
        pc: null,
        status: "disconnected",
        sdp: "",
        type: {} as RTCSdpType,
        callScreen: "",
        callerId: "",
        calleeId: "",
        localStream: null,
        remoteStream: null,
        accepted: false,
      }));
      if (user.sendMessage && relay) {
        user.sendMessage("/app/signal/action", {
          sender: user.id,
          receiver: user.id === data.callerId ? data.calleeId : data.callerId,
          status: status,
        });
      }

      console.log("Call fully disconnected");
    },
    [data, setData, user],
  );

  //Set the remote and local Stream on successfull connection

  useEffect(() => {
    if (
      (data.callScreen === "outgoing" || data.callScreen === "incoming") &&
      data.remoteStream != null &&
      data.pc &&
      data.accepted
    ) {
      localVideoRef.current!.srcObject = data.localStream;
      remoteRef.current!.srcObject = data.remoteStream;
      streamRef.current = data.localStream;
      remoteStreamRef.current = data.remoteStream;
      // console.log(
      //   "Local stream st for outgoing cal:",
      //   data.localStream,
      //   "Remote stream:",
      //   data.remoteStream,
      // );
    }
  }, [
    data.callScreen,
    data.pc,
    data.localStream,
    data.remoteStream,
    data.accepted,
  ]);

  // To get Caller-Caller data and to subscribe to call end/decline messages

  useEffect(() => {
    async function getUserData() {
      if (!data.callerId || !data.calleeId) return;
      try {
        const responseCaller = await api.get(
          "/user/getUserById/" + data.callerId,
        );
        const responseCallee = await api.get(
          "/user/getUserById/" + data.calleeId,
        );
        // console.log("Caller Data:", responseCaller.data);
        // console.log("Callee Data:", responseCallee.data);
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
    let sub1: StompSubscription | null;
    if (user.subscribe) {
      sub1 = user.subscribe("/user/topic/action", (message: callInterface) => {
        console.log("Action message received:", message);
        if (message.status === "ended" || message.status === "declined")
          endCall(message.status, false);
      });
    }

    return () => {
      if (sub1) {
        sub1.unsubscribe();
      }
    };
  }, [data.callerId, data.calleeId, user, user.subscribe, user.id, endCall]);

  // Handle the incoming call offer and answer
  const handleCall = async (status: "accepted" | "declined") => {
    if (status === "declined") {
      console.log(
        "Declining call...",
        localVideoRef.current,
        streamRef.current,
        remoteRef.current,
        remoteStreamRef.current,
      );
      console.log("Declining call with data:", data);
      setData((x) => ({
        ...x,
        accepted: false,
      }));
      endCall("declined", true);
    } else {
      setData((x) => ({
        ...x,
        accepted: true,
      }));
      //console.log("Accepting call with data:", data);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setData((x) => ({
        ...x,
        localStream: stream,
      }));
      console.log("Local stream set:", data.remoteStream);
      if (data.pc) {
        await data.pc
          .setRemoteDescription(
            new RTCSessionDescription({
              sdp: data.sdp,
              type: data.type,
            }),
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
      {(data.callScreen == "incoming" || data.callScreen == "outgoing") &&
        (data.accepted ? (
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
                onClick={() => endCall("ended", true)}
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
              src={
                callData?.caller.username == user.username
                  ? callData?.callee.profilePicture
                  : callData?.caller.profilePicture || "/defaultProfile.png"
              }
              alt="caller"
              className="w-28 h-28 rounded-full mb-6"
            />

            <h2 className="text-xl font-medium">
              {callData?.caller.username == user.username
                ? callData?.callee.username
                : callData?.caller.username}
            </h2>
            <p className="text-gray-400 mt-1">{data.callScreen + " ....."}</p>

            <div className="flex gap-12 mt-16">
              <button
                onClick={() => handleCall("declined")}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-400 flex items-center justify-center text-white text-xl"
              >
                {<ImPhoneHangUp className="text-2xl" />}
              </button>
              {data.callScreen === "incoming" && (
                <button
                  onClick={() => handleCall("accepted")}
                  className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-400 flex items-center justify-center text-xl"
                >
                  <BsFillCameraVideoFill className="text-2xl text-white" />
                </button>
              )}
            </div>
          </div>
        ))}
    </>
  );
}
