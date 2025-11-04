import { IoIosSearch } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { useContext, useState } from "react";
import ChatList from "./chat/chatList";
import { IoPersonAddSharp } from "react-icons/io5";
import Popup from "@/lib/popup";
import { AddFriend } from "./addFriend";
import { IoIosNotifications } from "react-icons/io";
import Notifications from "./notifications";
import { CiLogout } from "react-icons/ci";
import { api } from "@/lib/utils";
import { useNavigate } from "react-router";
import { MdOutlineGroups } from "react-icons/md";
import AddGroup from "./chat/addGroup";
import { profileContext } from "@/contexts/profile";

export default function SideBar() {
  const [focus, setFocus] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { user, setUser } = useContext(profileContext);

  async function logout() {
    user.disconnect();
    await api.get("/auth/logout");
    navigate("/");
  }
  return (
    <>
      <div
        className={`h-full md:hidden fixed z-999 transition-all   duration-50 ease-in-out overflow-hidden flex ${
          !user.collapse ? "w-full backdrop-blur-md" : "w-0 backdrop-blur-none"
        }`}
      >
        <div
          onClick={() => setUser((x) => ({ ...x, collapse: !x.collapse }))}
          className="w-full h-full absolute top-0 left-0 z-200"
        ></div>
        <div
          className={`transition-all duration-150 ease-in-out ${
            !user.collapse ? "w-[60%] p-3" : "w-0"
          } flex-col gap-4 h-full fixed z-999 md:hidden flex bg-[#0f0f0f]`}
        >
          <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between overflow-hidden">
            <h1 className="font-bold text-xl">Chats</h1>
            <div className="flex flex-row items-center ml-2">
              {!user.collapse && (
                <>
                  <button
                    onClick={logout}
                    className="p-2 rounded-xl hover:bg-gray-700 text-md"
                  >
                    <CiLogout className="text-xl text-[#e5e5e5]" />
                  </button>
                  <Popup
                    width="80%"
                    height="70%"
                    title="Create Group"
                    trigger={
                      <button className="p-2 rounded-xl hover:bg-gray-700 text-md">
                        <MdOutlineGroups />
                      </button>
                    }
                  >
                    <AddGroup />
                  </Popup>
                  <Popup
                    title="Add Friend"
                    trigger={
                      <button className="p-2 rounded-xl hover:bg-gray-700 text-md">
                        <IoPersonAddSharp />
                      </button>
                    }
                  >
                    <AddFriend />
                  </Popup>
                  <Popup
                    title="Notifications"
                    trigger={
                      <button className="p-2 rounded-xl hover:bg-gray-700 text-md">
                        <IoIosNotifications className="text-xl" />
                      </button>
                    }
                  >
                    <Notifications />
                  </Popup>
                </>
              )}
            </div>
          </div>
          {!user.collapse && (
            <div
              className={`flex flex-row rounded-md px-2 ${
                focus ? "border-white border-1" : ""
              } border-gray-700 border-1  items-center gap-2`}
            >
              <IoIosSearch className="text-xl" />
              <input
                onClick={() => setFocus(true)}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                value={search}
                type="text"
                className="w-full h-7 text-sm outline-none border-0"
                placeholder="Add a chat or search"
              />
              {focus && (
                <RxCross2
                  className="text-sm cursor-pointer text-black w-4 rounded-full bg-gray-300"
                  onClick={() => {
                    setFocus(false);
                    setSearch("");
                  }}
                />
              )}
            </div>
          )}
        </div>
        <div className="h-full flex flex-col overflow-y-auto">
          <ChatList search={search} collapse={user.collapse} />
        </div>
        </div>
      </div>

      <div
        className={`${
          user.collapse ? "w-0" : "w-[30%] p-3"
        }  flex-col gap-4 h-full md:flex hidden `}
      >
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between overflow-hidden">
            <h1 className="font-bold text-xl">Chats</h1>
            <div className="flex flex-row items-center ml-2">
              {!user.collapse && (
                <>
                  <button
                    onClick={logout}
                    className="p-2 rounded-xl hover:bg-gray-700 text-md"
                  >
                    <CiLogout className="text-xl text-[#e5e5e5]" />
                  </button>
                  <Popup
                    width="40%"
                    height="80%"
                    title="Create Group"
                    trigger={
                      <button className="p-2 rounded-xl hover:bg-gray-700 text-md">
                        <MdOutlineGroups />
                      </button>
                    }
                  >
                    <AddGroup />
                  </Popup>
                  <Popup
                    title="Add Friend"
                    trigger={
                      <button className="p-2 rounded-xl hover:bg-gray-700 text-md">
                        <IoPersonAddSharp />
                      </button>
                    }
                  >
                    <AddFriend />
                  </Popup>
                  <Popup
                    title="Notifications"
                    trigger={
                      <button className="p-2 rounded-xl hover:bg-gray-700 text-md">
                        <IoIosNotifications className="text-xl" />
                      </button>
                    }
                  >
                    <Notifications />
                  </Popup>
                </>
              )}
            </div>
          </div>
          {!user.collapse && (
            <div
              className={`flex flex-row rounded-md px-2 ${
                focus ? "border-white border-1" : ""
              } border-gray-700 border-1  items-center gap-2`}
            >
              <IoIosSearch className="text-xl" />
              <input
                onClick={() => setFocus(true)}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                value={search}
                type="text"
                className="w-full h-7 text-sm outline-none border-0"
                placeholder="Add a chat or search"
              />
              {focus && (
                <RxCross2
                  className="text-sm cursor-pointer text-black w-4 rounded-full bg-gray-300"
                  onClick={() => {
                    setFocus(false);
                    setSearch("");
                  }}
                />
              )}
            </div>
          )}
        </div>
        <div className="h-full flex flex-col overflow-y-auto">
          <ChatList search={search} collapse={user.collapse} />
          {/*  */}
        </div>
      </div>
    </>
  );
}
