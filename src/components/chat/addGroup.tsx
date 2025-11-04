import { useEffect, useState, useContext } from "react";
import { api } from "@/lib/utils";
import type { userInterface } from "@/lib/types";
import { profileContext } from "@/contexts/profile";
import useNotify from "@/hooks/useNotify";

export default function AddGroup() {
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState([]);
  const { user } = useContext(profileContext);
  const { addNotification } = useNotify();
  const [checked, setChecked] = useState<string[]>([]);
  useEffect(() => {
    async function getUsers() {
      console.log("Fetching users for:", username);
      try {
        const response = await api.get("/user/getUsers/" + username);
        if (response.status === 200) setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }
    const timer = setTimeout(() => {
      if (username.length > 0) {
        getUsers();
      }
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, [username]);

  async function createGroup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const groupName = formData.get("username") as string;
    if (groupName.length < 3) {
      addNotification({
        title: "Group Name Too Short",
        description: "Group name must be at least 3 characters long.",
        type: "error",
        popup: true,
      });
      return;
    }
    const response = await api.post("/group/createGroup", {
      name:groupName,
      admin: user._id,
      members: checked,
    });
    if (response.status === 200) {
      const data = response.data;
      console.log("Group created successfully:", data);
      addNotification({
        title: "Group Created",
        description: `Group "${groupName}" created successfully.`,
        type: "success",
        popup: true,
      });
      setChecked([]);
      setUsername("");
      setUsers([]);
    }
    (e.target as HTMLFormElement).reset();
  }
  return (
    <div className="flex flex-row gap-2 px-2 w-full h-full items-center justify-center rounded-md bg-[#262626] text-[#e5e5e5]">
      {/* <img
        src="./teddy.avif"
        className="w-[30%] h-[80%] bg-gray-500 rounded-sm ml-5"
      ></img> */}
      <div className=" flex flex-col w-full h-full items-center pt-10">
        <form
          onSubmit={(e) => createGroup(e)}
          className="w-full  flex flex-col gap-5 relative max-w-sm h-full"
        >
          <div className="flex flex-col gap-2 text-sm">
            <label className="text-[#e5e5e5]">Group name</label>
            <input
              name="username"
              type="text"
              className="bg-[#262626] outline-none text-[#e5e5e5] focus:border-white border border-[#3f3f3f] rounded-md p-2 w-full"
              placeholder="Enter your username"
            />
          </div>
          <div className="text-sm">
            <label className="text-[#e5e5e5]">Add Members</label>
            <input
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              placeholder="Add friends by username"
              className="bg-[#262626] outline-none text-[#e5e5e5] focus:border-white border border-[#3f3f3f] rounded-md p-2 w-full"
            />
            <div className="w-full absolute h-[53%] overflow-y-scroll">
              <div className="flex flex-col gap-2 w-full">
                {users.length > 0 ? (
                  users.map((user: userInterface) => (
                    <Tab
                      key={user._id}
                      _id={user._id}
                      username={user.username}
                      name={user.name}
                      profilePicture={user.profilePicture}
                      setChecked={setChecked}
                      checked={checked.includes(user._id)}
                    />
                  ))
                ) : (
                  <div className="text-gray-400 text-center">
                    No users found
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="bg-[#e5e5e5] absolute bottom-5 w-full hover:bg-[#c9c8c8] cursor-pointer text-black rounded-md p-1"
          >
            Create
          </button>
        </form>
      </div>
    </div>
  );
}

function Tab({
  _id,
  username,
  name,
  profilePicture,
  setChecked,
  checked,
}: {
  _id: string;
  username: string;
  name?: string;
  profilePicture?: string;
  setChecked: React.Dispatch<React.SetStateAction<string[]>>;
  checked: boolean;
}) {
  return (
    <div className="relative flex flex-row w-full px-3 p-2 items-center gap-4 group hover:bg-[#454545] rounded-lg cursor-pointer">
      <input
        type="checkbox"
        className="accent-green-400"
        checked={checked}
        onChange={(e) =>
          setChecked((x) => {
            return e.target.checked
              ? [...x, _id]
              : x.filter((id) => id !== _id);
          })
        }
      />
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
    </div>
  );
}
