import axios from "axios";
//https://api.aulakh.site/

const url=import.meta.env.VITE_PRODUCTION || "http://localhost:8000";

export const api = axios.create({
  baseURL: url,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export function formatTime(created_at: string): string {
    const isoString = created_at;
    const date = new Date(isoString);
    
    const time = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return time;
}

