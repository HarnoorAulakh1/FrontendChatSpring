import { BsChatLeftDots } from "react-icons/bs";
import { useContext, useState } from "react";
import { api } from "../../lib/utils";
import useNotify from "../../hooks/useNotify";
import { profileContext } from "../../contexts/profile";
import { useNavigate } from "react-router";
import Loading from "../../lib/loader";

export default function Auth() {
  const [isLogin, setter] = useState(true);
  return (
    <div className="h-screen w-screen bg-[#262626] flex flex-col gap-8 items-center justify-center text-[#e5e5e5]">
      <div className="flex flex-row  gap-5 items-center">
        <div className="bg-[#e5e5e5] p-1 rounded-md">
          <BsChatLeftDots className="text-lg text-black" />
        </div>
        <h1 className="text-xl">XChat Inc.</h1>
      </div>
      {isLogin ? <Login setter={setter} /> : <Register setter={setter} />}
    </div>
  );
}

function Login({
  setter,
}: {
  setter: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { addNotification } = useNotify();
  const { setUser } = useContext(profileContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  async function handle(e: React.FormEvent<HTMLFormElement>) {
    setLoading(false);
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      if(!formData.get("username") || !formData.get("password")){
        addNotification({
          title: "Login Failed",
          description: "Please fill all the fields",
          type: "error",
          popup: true,
        });
        setLoading(true);
        return;
      }
      const reponse = await api.post("/auth/login", formData);
      const data = reponse.data;
      if (reponse.status == 200) {
        addNotification({
          title: "Login Successful",
          description: `You have successfully logged in as ${data.username}`,
          type: "success",
          popup: true,
        });
        setUser({
          id: data.id,
          username: data.username,
          email: data.email,
          name: data.name,
          profilePicture: data.profilePicture,
          isOnline: data.isOnline
        });
        navigate("/app");
      }
    } catch (err) {
      addNotification({
        id:"3231131",
        title: "Login Failed",
        description:
          err instanceof Error ? err.message : "An unknown error occurred",
        type: "error",
        popup: true,
      });
    }
    setLoading(true);
    (e.target as HTMLFormElement).reset();
  }
  return (
    <div className="bg-[#171717] flex flex-col justify-center px-8 rounded-xl w-[80%] md:w-[30%] h-[55%]">
      {loading ? (
        <>
          <h1 className="text-2xl font-bold w-full text-center text-[#e5e5e5]">
            Welcome back
          </h1>
          <h1 className="text-[#a1a1a1] text-sm w-full text-center">
            Login to your XChat Inc account
          </h1>
          <form
            onSubmit={(e) => handle(e)}
            className="flex flex-col gap-5 mt-3"
          >
            <div className="flex flex-col gap-2 text-sm">
              <label className="text-[#e5e5e5]">Username</label>
              <input
                name="username"
                type="text"
                className="bg-[#262626] outline-none text-[#e5e5e5] focus:border-white border border-[#3f3f3f] rounded-md p-2 w-full"
                placeholder="Enter your username"
              />
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex lfex-row items-center justify-between">
                <label className="text-[#e5e5e5] text-sm">Password</label>
                <p className="text-[#e5e5e5] text-sm hover:underline underline-offset-4 cursor-pointer">
                  Forgt your password?
                </p>
              </div>
              <div className="w-full rounded-md">
                <input
                  name="password"
                  type="password"
                  className={`bg-[#262626] outline-none text-[#e5e5e5] focus:border-white border border-[#3f3f3f]  rounded-md p-2 w-full`}
                  placeholder="Enter your password"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-[#e5e5e5] hover:bg-[#c9c8c8] cursor-pointer text-black rounded-md p-1"
            >
              Login
            </button>
            <p className="text-sm w-full text-center">
              Don't have an account?
              <span
                onClick={() => setter((x) => !x)}
                className="cursor-pointer underline underline-offset-4 ml-1"
              >
                Sign up
              </span>
            </p>
          </form>
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
}

function Register({
  setter,
}: {
  setter: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { addNotification } = useNotify();
  const [loading, setLoading] = useState(true);
  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("file", formData.get("profilePicture") as Blob);
    formData.append("user", JSON.stringify({
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      email: formData.get("email") as string,
      name: formData.get("name") as string,
    }));
    setLoading(false);
    try {
      const reponse = await api.post("/auth/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const data = reponse.data;
      if (reponse.status == 200) {
        addNotification({
          id: "3231131",
          title: "Signup Successful",
          description: data.message,
          type: "success",
          popup: true,
        });
      }
    } catch (err) {
      addNotification({
        title: "Login Failed",
        description:
          err instanceof Error ? err.message : "An unknown error occurred",
        type: "error",
        popup: true,
      });
    }
    setLoading(true);
    (e.target as HTMLFormElement).reset();
  }
  return (
    <div className="bg-[#171717] flex flex-col justify-center px-8 rounded-xl w-[80%] md:w-[30%] h-[75%]">
      {loading ? (
        <>
          <h1 className="text-2xl font-bold w-full text-center text-[#e5e5e5]">
            Welcome back
          </h1>
          <h1 className="text-[#a1a1a1] text-sm w-full text-center">
            Register to XChat Inc
          </h1>
          <form onSubmit={handle} className="flex flex-col gap-5 mt-3">
            <div className="flex flex-col gap-2 text-sm">
              <label className="text-[#e5e5e5]">Username</label>
              <input
                name="username"
                type="text"
                className="bg-[#262626] outline-none text-[#e5e5e5] focus:border-white border border-[#3f3f3f] rounded-md p-2 w-full"
                placeholder="Enter your username"
              />
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex lfex-row items-center justify-between">
                <label className="text-[#e5e5e5] text-sm">Password</label>
                <p className="text-[#e5e5e5] text-sm hover:underline underline-offset-4 cursor-pointer">
                  Forgt your password?
                </p>
              </div>
              <div className="w-full rounded-md">
                <input
                  name="password"
                  type="password"
                  className={`bg-[#262626] outline-none text-[#e5e5e5] focus:border-white border border-[#3f3f3f]  rounded-md p-2 w-full`}
                  placeholder="Enter your password"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <label className="text-[#e5e5e5]">Email</label>
              <input
                name="email"
                type="email"
                className="bg-[#262626] outline-none text-[#e5e5e5] focus:border-white border border-[#3f3f3f] rounded-md p-2 w-full"
                placeholder="Enter your username"
              />
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <label className="text-[#e5e5e5]">Name</label>
              <input
                name="name"
                type="text"
                className="bg-[#262626] outline-none text-[#e5e5e5] focus:border-white border border-[#3f3f3f] rounded-md p-2 w-full"
                placeholder="Enter your username"
              />
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <label
                htmlFor="profilePicture"
                className="text-[#e5e5e5] cursor-pointer  rounded-md bg-blue-500 w-max p-2"
              >
                Profile Picture
              </label>
              <input
                id="profilePicture"
                name="profilePicture"
                type="file"
                className="bg-[#262626] hidden outline-none text-[#e5e5e5] focus:border-white border border-[#3f3f3f] rounded-md p-2 w-full"
                placeholder="Enter your username"
              />
            </div>
            <button
              type="submit"
              className="bg-[#e5e5e5] hover:bg-[#c9c8c8] cursor-pointer text-black rounded-md p-1"
            >
              Signup
            </button>
            <p className="text-sm w-full text-center">
              Already have an account?
              <span
                onClick={() => setter((x) => !x)}
                className="cursor-pointer underline underline-offset-4 ml-1"
              >
                Login
              </span>
            </p>
          </form>
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
}
