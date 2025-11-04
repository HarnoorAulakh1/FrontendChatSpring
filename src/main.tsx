import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { HeadProvider } from "react-head";
import { Title, Meta } from "react-head";

createRoot(document.getElementById("root")!).render(
  <HeadProvider>
    <Title>XChat - Real-Time Private Messaging</Title>
    <Meta
      name="description"
      content="XChat is a fast, secure, real-time chat platform built for modern communication."
    />
    <Meta
      name="keywords"
      content="chat, messaging, realtime chat, XChat, secure chat"
    />
    <Meta property="og:title" content="XChat - Real-Time Private Messaging" />
    <Meta
      property="og:description"
      content="Chat live with friends and colleagues on XChat - secure and fast."
    />
    <Meta
      property="og:image"
      content="https://xchat.example.com/og-image.png"
    />
    <Meta property="og:url" content="https://xchat.example.com" />
    <Meta name="twitter:card" content="summary_large_image" />
    <Meta name="twitter:title" content="XChat - Secure Messaging" />
    <Meta
      name="twitter:description"
      content="Chat instantly on XChat - the fastest and most secure chat platform."
    />
    <Meta
      name="twitter:image"
      content="https://xchat.example.com/twitter-image.png"
    />

    <App />
  </HeadProvider>
);
