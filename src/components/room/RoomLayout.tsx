import Background from "../../lib/background";
import { Outlet } from "react-router";

export default function RoomLayout() {
  return (
    <div className="relative min-h-screen flex items-center justify-center text-white">
      <Background />
      <Outlet />
    </div>
  );
}
