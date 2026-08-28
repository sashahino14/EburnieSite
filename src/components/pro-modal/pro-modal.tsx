import classNames from "classnames";
import { useLocalStorage } from "react-use";
import { defaultHTML } from "../../../utils/consts";

function ProModal({
  open,
  html,
  onClose,
}: {
  open: boolean;
  html: string;
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [, setStorage] = useLocalStorage("html_content");

  const handleContinue = () => {
    if (html !== defaultHTML) {
      setStorage(html);
    }

    onClose(false);
  };

  return (
    <>
      <div
        className={classNames(
          "h-screen w-screen bg-black/30 fixed left-0 top-0 z-40 backdrop-blur-[2px]",
          {
            "opacity-0 pointer-events-none": !open,
          }
        )}
        onClick={() => onClose(false)}
      />

      <div
        className={classNames(
          "absolute top-0 -translate-y-[calc(100%+16px)] right-0 z-40 w-96 max-w-[calc(100vw-24px)] bg-white border border-gray-200 rounded-lg shadow-xl transition-all duration-150 overflow-hidden",
          {
            "opacity-0 pointer-events-none": !open,
          }
        )}
      >
        <header className="flex items-center text-sm px-4 py-3 border-b border-gray-200 gap-2 bg-gray-50 font-semibold text-gray-800">
          <span className="bg-gradient-to-br from-sky-500 to-emerald-500 text-white text-xs font-bold rounded-lg px-2.5 py-1 shadow-sm">
            E
          </span>

          AI usage limit
        </header>

        <main className="px-4 pt-4 pb-4">
          <p className="text-gray-950 text-sm font-semibold">
            Your current AI usage limit has been reached.
          </p>

          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            EburnieSite uses DeepSeek to generate and modify your websites.
            Please check your server configuration or DeepSeek API usage before
            continuing.
          </p>

          <button
            type="button"
            onClick={handleContinue}
            className="mt-4 bg-black text-white cursor-pointer rounded-full py-2 px-3 text-sm font-medium w-full block text-center hover:bg-gray-800 transition duration-200 ease-in-out"
          >
            Continue
          </button>
        </main>
      </div>
    </>
  );
}

export default ProModal;