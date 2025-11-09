import ProfileProvider from "./contexts/profileProvider";
import AppLayout from "./layout/AppLayout";
import CurrentProvider from "./contexts/currentprovider";
import UiProvider from "./contexts/notificationProvider";
import Auth from "./components/auth/auth";
import { createBrowserRouter, RouterProvider } from "react-router";
import NotificationProvider from "./contexts/notificationProvider";
import MessageProvider from "./contexts/messageProvider";

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
  ]);
  return (
    <UiProvider>
      <ProfileProvider>
        <MessageProvider>
          <NotificationProvider>
            <CurrentProvider>
              <MessageProvider>
                <RouterProvider router={router} />
              </MessageProvider>
            </CurrentProvider>
          </NotificationProvider>
        </MessageProvider>
      </ProfileProvider>
    </UiProvider>
  );
}

export default App;
