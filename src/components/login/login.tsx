import { useLocalStorage } from "react-use";
import { defaultHTML } from "./../../../utils/consts";

function Login({
  html,
  children,
}: {
  html?: string;
  children?: React.ReactNode;
}) {
  const [, setStorage] = useLocalStorage("html_content");

  const handleClick = async () => {
    if (html !== defaultHTML) {
      setStorage(html);
    }

    try {
      const request = await fetch("/api/login");
      const res = await request.json();

      if (res?.redirectUrl) {
        window.open(res.redirectUrl, "_blank");
      }
    } catch (error) {
      console.error("GitHub login error:", error);
    }
  };

  return (
    <>
      <header className="flex items-center text-sm px-4 py-3 border-b gap-2 bg-neutral-950 border-neutral-800 font-semibold text-neutral-200">
        <span className="text-xs bg-gray-700 text-white rounded-full px-1.5 py-0.5 flex items-center justify-center gap-1.5">
          REQUIRED
        </span>

        Login with GitHub
      </header>

      <main className="px-4 py-4 space-y-3">
        {children}

        <button
          onClick={handleClick}
          className="w-full cursor-pointer rounded-md bg-white text-black px-4 py-2.5 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-5"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.167 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.455-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.607.069-.607 1.004.071 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.646.349-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.944 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844a9.56 9.56 0 0 1 2.504.337c1.909-1.294 2.748-1.025 2.748-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.844-2.339 4.688-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .268.18.579.688.481A10.001 10.001 0 0 0 22 12C22 6.477 17.523 2 12 2Z"
              clipRule="evenodd"
            />
          </svg>

          Continue with GitHub
        </button>
      </main>
    </>
  );
}

export default Login;