import ProfileProvider from "./contexts/profileProvider";
import AppLayout from "./layout/AppLayout";
import UiProvider from "./contexts/notificationProvider";
import Auth from "./components/auth/auth";
import { createBrowserRouter, RouterProvider } from "react-router";
import NotificationProvider from "./contexts/notificationProvider";
import MessageProvider from "./contexts/messageProvider";
import { CreateRoom, JoinRoom } from "./components/room/createRoom";
import CurrentProvider from "./contexts/currentProvider";
import RoomLayout from "./components/room/RoomLayout";
import RoomChat from "./components/room/roomChat";
import WebrtcProvider from "./contexts/webrtcProvider";
function App() {
  const router = createBrowserRouter([
    // {
    //   path: "/",
    //   element: <Home />,
    // },
    {
      path: "/app",
      element: <AppLayout />,
    },
    {
      path: "/",
      element: <Auth />,
    },
    {
      path: "/room",
      element: <RoomLayout />,
      children: [
        {
          path: "",
          element: <JoinRoom />,
        },
        {
          path: "chat",
          element: <RoomChat />,
        },
        {
          path: "create",
          element: <CreateRoom />,
        },
      ],
    },
  ]);
  return (
    <UiProvider>
      <ProfileProvider>
        <MessageProvider>
          <NotificationProvider>
            <CurrentProvider>
                <WebrtcProvider>
                  <RouterProvider router={router} />
                </WebrtcProvider>
            </CurrentProvider>
          </NotificationProvider>
        </MessageProvider>
      </ProfileProvider>
    </UiProvider>
  );
}

export default App;
