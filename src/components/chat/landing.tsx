import { useContext } from "react";
import { GoSidebarCollapse } from "react-icons/go";
import { profileContext } from "@/contexts/profile";
export default function Landing() {
  const { setUser } = useContext(profileContext);
  return (
    <div className="w-full h-full">
      <div className="flex flex-row items-center gap-2 p-3 ">
        <button
          onClick={() => setUser((x) => ({ ...x, collapse: !x.collapse }))}
          className="p-2 rounded-xl hover:bg-gray-700 text-md "
        >
          <GoSidebarCollapse className="text-xl text-[#e5e5e5]" />
        </button>
        <h1 className="text-[#e5e5e5]  font-bold">Xchat</h1>
      </div>
      <div className="w-full h-screen flex flex-col items-center justify-center text-[#838383]">
        <h1 className="text-4xl font-bold mb-4">Welcome to XChat</h1>
        <p className="text-lg mb-8">
          Secure Communications,{" "}
          <span className="text-green-600">end-to-end encrypted</span>
        </p>
      </div>
    </div>
  );
}
