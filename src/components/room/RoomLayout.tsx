import Background from "@/lib/background";
import { Outlet } from "react-router";
import StompSocket from "@/lib/StompSocket";

export default function RoomLayout() {
  return (
    <div className="relative min-h-screen flex items-center justify-center text-white">
      <Background />
      <StompSocket />
      <Outlet />
    </div>
  );
}
