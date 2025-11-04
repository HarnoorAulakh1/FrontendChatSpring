import { useNavigate } from "react-router";
export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-800">
      <h1 className="text-4xl font-bold text-white">Welcome to XCHAT</h1>
      <button
        onClick={() => navigate("/app")}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Get Started
      </button>
    </div>
  );
}
