import { useEffect, useState, useContext } from "react";
import { IoMdPersonAdd } from "react-icons/io";
import useNotify from "@/hooks/useNotify";
import { api } from "@/lib/utils";
import type { userInterface } from "@/lib/types";
import { profileContext } from "@/contexts/profile";

export function AddFriend() {
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState([]);
  useEffect(() => {
    async function getUsers() {

      try {
        const response = await api.get("/user/getUsers/" + username);
        if (response.status === 200) setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }
    const timer = setTimeout(() => {
      if (username != null && username.length > 0) {
        getUsers();
      }
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, [username]);
  return (
    <div className="flex flex-row gap-2 px-2 w-full h-full items-center justify-center rounded-md bg-[#262626] text-[#e5e5e5]">
      {/* <img
        src="./teddy.avif"
        className="w-[20%] h-[80%] bg-gray-500 rounded-sm ml-5"
      ></img> */}
      <div className="flex flex-col w-full h-full items-center pt-10">
        <h1 className="text-2xl font-bold mb-4">Add Friend</h1>
        <form className="w-full relative max-w-sm h-full">
          <input
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            placeholder="Add friends by username"
            className="w-full text-md p-2 border  outline-none border-gray-300 rounded mb-4"
          />
          <div className="w-full absolute h-[70%] overflow-y-scroll">
            <div className="flex flex-col gap-2 w-full">
              {users.length > 0 ? (
                users.map((user: userInterface) => (
                  <Tab
                    key={user.id}
                    id={user.id}
                    username={user.username}
                    name={user.name}
                    profilePicture={user.profilePicture}
                  />
                ))
              ) : (
                <div className="text-gray-400 text-center">No users found</div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Tab({
  id,
  username,
  name,
  profilePicture,
}: {
  id: string;
  username: string;
  name?: string;
  profilePicture?: string;
}) {
  const { user } = useContext(profileContext);
  const { addNotification } = useNotify();
  function handle() {
    addNotification({
      id: Math.random().toString(36).substring(7),
      title: "Friend Request Sent",
      type: "info",
      description: `You have sent a friend request to ${username}`,
      popup: true,
    });
    if(user.sendMessage)
    user.sendMessage("/app/FriendReq", {
      sender: user.id,
      receiver: id,
    });
  }
  return (
    <div className="relative flex flex-row w-full px-3 p-2 items-center gap-4 group hover:bg-[#454545] rounded-lg cursor-pointer">
      {profilePicture != "NULL" ? (
        <img
          src={profilePicture}
          className="w-14 h-12 bg-gray-500 rounded-full"
        ></img>
      ) : (
        <div className="w-14 h-12 bg-gray-500 rounded-full flex justify-center items-center"></div>
      )}
      <div className="flex flex-col w-full">
        <span className="text-md font-semibold">{username}</span>
        <span className="text-sm text-gray-400">{name}</span>
      </div>
      <div
        onClick={() => handle()}
        className="absolute right-2 flex justify-center items-center"
      >
        <IoMdPersonAdd className="text-2xl text-gray-400 hover:text-blue-500 group-hover:text-white cursor-pointer" />
      </div>
    </div>
  );
}
