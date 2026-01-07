import { api } from "@/lib/utils";
import { useState } from "react";
import { useNavigate } from "react-router";

export function CreateRoom() {
  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!roomName.trim()) return;
    try {
      const response = await api.post("/room/create", { name: roomName });
      if (response.status !== 200) return;
      const id = response.data.message;
      setRoomId(id);
      setCopied(false);
    } catch (err) {
      console.error(err);
      return;
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-md z-10 bg-black/50 backdrop-blur-xl rounded-2xl p-8 shadow-xl">
      <h2 className="text-xl font-semibold">Create Room</h2>
      <p className="mt-1 text-sm text-white/70">
        Enter a room name to generate a shareable room ID
      </p>

      <input
        type="text"
        placeholder="Room name"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        className="mt-4 w-full rounded-lg bg-white/10 px-4 py-3 outline-none ring-1 ring-white/20 focus:ring-2 focus:ring-indigo-400 placeholder:text-white/40"
      />

      <button
        onClick={handleCreate}
        className="mt-4 w-full rounded-lg bg-indigo-500 py-3 font-medium hover:bg-indigo-600 transition"
      >
        Generate Room ID
      </button>

      {roomId && (
        <div className="mt-5 rounded-lg bg-black/30 px-2 py-3 flex items-center justify-between">
          <span className="font-mono text-sm">{roomId}</span>

          <button
            onClick={copyToClipboard}
            className="ml-3 text-sm text-indigo-300 hover:cursor-pointer hover:text-indigo-200"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}

export function JoinRoom() {
  const navigate = useNavigate();
  const [roodId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const handle = async() => {
    if (!roodId.trim() || !username.trim()) return;
    try{
        const response=await api.post("/room/join", { id: roodId, name: username });
        if(response.status==200) 
            navigate("/room/chat");
    }
    catch(err){
        console.error(err);
        return;
    }
  };
  return (
    <div>
      <div className="relative z-10 w-[420px] bg-black/50 backdrop-blur-xl rounded-2xl p-8 shadow-xl">
        <h1 className="text-xl font-semibold mb-5 text-center">Join Room</h1>

        <div className="space-y-4 mb-6">
          <input
            type="text"
            placeholder="Room ID"
            onChange={(e)=>setRoomId(e.target.value)}
            className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
          />

          <input
            type="text"
            placeholder="Username"
            onChange={(e)=>setUsername(e.target.value)}
            className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>

        <button
          onClick={() => handle()}
          className="w-full hover:cursor-pointer rounded-lg bg-white text-black py-3 text-sm font-medium hover:bg-white/90 transition"
        >
          Join Room
        </button>
      </div>
    </div>
  );
}
