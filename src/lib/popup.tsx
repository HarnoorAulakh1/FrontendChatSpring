import React, { useState } from "react";
import { RxCross2 } from "react-icons/rx";

export default function Popup({
  width,
  height,
  children,
  title,
  trigger,
}: {
  width?: string;
  height?: string;
  children: React.ReactNode;
  title?: string;
  trigger: React.ReactNode;
}) {
  const [popup, setUi] = useState<boolean>(false);
  return (
    <>
      <div
        onClick={() => {
          setUi((x) => {
            return !x;
          });
        }}
        className="w-max h-max"
      >
        {trigger}
      </div>
      {popup && (
        <div className="fixed flex justify-center items-center top-0 left-0 h-screen w-screen backdrop-blur-xs">
          <div
            onClick={() => {
              setUi((x) => {
                return !x;
              });
            }}
            className="fixed z-10 h-screen w-screen"
          ></div>
          <div className={`flex flex-col justify-center items-center z-20 ${height!=undefined?`h-[${height}]`:"md:h-[50%] h-[50%]"} ${width!=undefined?`w-[${width}]`:"w-[80%] md:w-[50%]"} bg-[#333333] rounded-xl`}>
            <div className="w-full flex items-center rounded-t-xl p-1 bg-gray-400">
              <div
                onClick={() => {
                  setUi((x) => {
                    return !x;
                  });
                }}
                className="rounded-full group cursor-pointer flex flex-col justify-center items-center w-max h-max p-[1px] bg-red-400 ml-1"
              >
                <RxCross2 className=" text-xs group-hover:text-black text-red-400 cursor-pointer" />
              </div>
              <h1 className="text-lg font-semibold w-full text-center text-black">
                {title || "Popup"}
              </h1>
            </div>
            <div className="bg-[#333333] rounded-b-xl flex flex-row justify-center  z-99 w-full h-full">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
