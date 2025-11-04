// import type {
//   groupInterface,
//   messageInterface,
// } from "@/lib/types";
// import { useEffect, useState, useContext } from "react";
// import { api } from "@/lib/utils";
// import { profileContext } from "@/contexts/profile";
// import { formatTime } from "@/lib/utils";

// import { currentContext } from "@/contexts/current";

// export default function GroupList({
//   search,
//   collapse,
// }: {
//   search?: string;
//   collapse?: boolean;
// }) {
//   const [groups, setGroups] = useState<groupInterface[]>([]);
//   const [filteredGroups, setFilteredGroups] = useState<groupInterface[]>([]);
//   useEffect(() => {
//     const filtered = groups.filter((group) =>
//       group.name.toLowerCase().includes((search || "").toLowerCase())
//     );
//     setFilteredGroups(filtered);
//   }, [search, groups]);
//   const { user } = useContext(profileContext);
//   useEffect(() => {
//     const socket = user.socket;
//     if (!socket) return;
//     const add_group = (data: { group: groupInterface }) => {
//       console.log("New group added:", data.group);
//       setGroups((prev) => [...prev, data.group]);
//     };
//     socket.on("add_group", add_group);
//     return () => {
//       socket.off("add_group", add_group);
//     };
//   }, [user.socket]);
//   useEffect(() => {
//     async function fetchGroups() {
//       try {
//         const response = await api.get("/group/getGroups?userId=" + user._id);
//         if (response.status == 200) {
//           const data = response.data;
//           console.log("Fetched groups:", data);
//           setGroups(data);
//         } else {
//           console.error("Failed to fetch groups");
//         }
//       } catch (error) {
//         console.error("Error fetching groups:", error);
//       }
//     }
//     fetchGroups();
//   }, [user._id]);
//   return (
//     <div className="flex flex-col gap-1 h-full overflow-y-auto">
//       {filteredGroups.length > 0 &&
//         filteredGroups.map((group) => (
//           <ChatListItem key={group._id} group={group} collapse={collapse} />
//         ))}
//     </div>
//   );
// }

// function ChatListItem({
//   group,
//   collapse,
// }: {
//   group: groupInterface;
//   collapse?: boolean;
// }) {
//   const [preview, setPreview] = useState("");
//   const [time, setTime] = useState("...");
//   const { user } = useContext(profileContext);
//   const { _id, logo, name } = group;
//   const { current, setCurrent } = useContext(currentContext);
//   const [unread, setUnread] = useState<number>(0);
//   useEffect(() => {
//     const socket = user.socket;
//     if (!socket || !name) return;
//     // const handleOnlineStatus = (data: {
//     //   username: string;
//     //   isOnline: boolean;
//     // }) => {
//     //   if (data.username == username) {
//     //     setIsOnline(data.isOnline);
//     //   }
//     // };
//     const handleMessagePreview = (data: { message: messageInterface }) => {
//       if (data.message.group == _id) {
//         const content = data.message.content;
//         setPreview(
//           content.substring(0, 20) + (content.length > 20 ? "..." : "")
//         );
//         setTime(formatTime(data.message.created_at));
//         if (data.message.sender._id !== user._id && current._id != _id)
//           setUnread((prev) => prev + 1);
//       }
//     };
//     //socket.on("user_status", handleOnlineStatus);
//     socket.on("message_preview", handleMessagePreview);
//     return () => {
//       socket.off("message_preview", handleMessagePreview);
//       //socket.off("user_status", handleOnlineStatus);
//     };
//   }, [name, user.socket, current._id, _id, user._id]);
//   useEffect(() => {
//     const fetchPreview = async () => {
//       try {
//         const response = await api.get(
//           "/user/getPreview?sender=" + user._id + "&group=" + _id
//         );
//         if (response.status == 200) {
//           const data = response.data;
//           if (data && data._id) {
//             const temp = formatTime(data.created_at);
//             setTime(temp);
//           }
//           const content = data.content;
//           if (content && content.length > 20)
//             setPreview(
//               content.substring(0, 20) + (content.length > 20 ? "..." : "")
//             );
//           else setPreview(content);
//         }
//       } catch (error) {
//         console.error("Error fetching preview:", error);
//         setPreview("No messages yet ...");
//       }
//     };
//     async function checkUnread() {
//       try {
//         const response = await api.get(
//           `/message/getUnreadCount?readBy=${user._id}&group=${_id}` 
//         );
//         if (response.status == 200) {
//           const data = response.data;
//           if (data && data.count) {
//             setUnread(data.count);
//           }
//         }
//       } catch (error) {
//         console.error("Error checking unread messages:", error);
//       }
//     }
//     checkUnread();
//     fetchPreview();
//   }, [_id, user._id]);
//   async function setCurrrentChat() {
//     try {
//       await api.post(
//         `/message/markAsRead?readBy=${user._id}&group=${_id}&time=${new Date().toISOString()}`
//       );
//     } catch (error) {
//       console.error("Error marking messages as read:", error);
//     }
//     setUnread(0);
//     setCurrent(() => {
//       return {
//         _id: _id,
//         username: name,
//         profilePicture: logo,
//         name: name,
//         isGroup: true,
//       };
//     });
//   }
//   return (
//     <div
//       onClick={setCurrrentChat}
//       className="flex flex-row items-center gap-2 p-2 group hover:bg-[#454545] rounded-lg cursor-pointer"
//     >
//       <div className="flex flex-row items-end justify-center">
//         {logo != "NULL" ? (
//           <div className="w-12 h-12 bg-gray-500 rounded-full flex justify-center items-center">
//             <img
//               src={logo}
//               className="w-12 h-12 bg-gray-500 rounded-full"
//             ></img>
//           </div>
//         ) : (
//           <div className="w-12 h-12 bg-gray-500 rounded-full flex justify-center items-center"></div>
//         )}
//       </div>
//       {!collapse && (
//         <div className="flex flex-col w-full">
//           <div className="flex flex-row justify-between">
//             <span className="text-sm font-semibold">{name}</span>
//             <p
//               className={`text-sm text-gray-500 transition-all duration-150  group-hover:translate-x-[-1rem]`}
//             >
//               {time}
//             </p>
//           </div>
//           <div className="flex flex-row justify-between w-full">
//             <span className="text-xs text-gray-400">{preview}</span>{" "}
//             {unread != 0 && (
//               <div className="rounded-full w-5 h-5 text-center bg-green-500 text-black text-sm">
//                 {unread}
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
