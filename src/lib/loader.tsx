export default function Loader() {
  return (
    <div className="flex items-center w-full justify-center h-full">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
    </div>
  );
}

export function TypingLoader() {
  return (
    <div
      className={`flex flex-row gap-2 bg-gray-800 text-white self-start p-3 rounded-lg max-w-xs`}
    >
      <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce delay-75"></div>
      <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce delay-150"></div>
      <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce delay-225"></div>
      <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce delay-300"></div>
    </div>
  );
}

export function TypingLoaderSmall() {
  return (
    <div
      className={`flex flex-row items-center gap-1 rounded-lg max-w-xs`}
    >
      <p>typing</p>
        <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce delay-75"></div>
        <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce delay-150"></div>
        <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce delay-225"></div>
    </div>
  );
}
