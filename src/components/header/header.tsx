import { ReactNode } from "react";
import { Eye, MessageCircleCode } from "lucide-react";

import Logo from "@/assets/eburniesite-elephant-512.png";

import { Button } from "./../../components/ui/button";
import classNames from "classnames";

const TABS = [
  {
    value: "chat",
    label: "Chat",
    icon: MessageCircleCode,
  },
  {
    value: "preview",
    label: "Preview",
    icon: Eye,
  },
];

function Header({
  tab,
  onNewTab,
  children,
}: {
  tab: string;
  onNewTab: (tab: string) => void;
  children?: ReactNode;
}) {
  return (
    <header className="border-b bg-white border-slate-200 dark:bg-neutral-950 dark:border-neutral-800 px-3 lg:px-6 py-2.5 grid grid-cols-3 sticky top-0 z-20">
      <div className="flex items-center justify-start gap-3">
        <h1 className="text-slate-900 dark:text-white text-lg lg:text-xl font-bold flex items-center justify-start">
          <img
            src={Logo}
            alt="EburnieSite Logo"
            className="h-7 w-auto lg:h-8 mr-2 object-contain"
          />

          <span>EburnieSite</span>

          <span className="font-mono bg-blue-600 text-white rounded-full text-xs ml-2 px-1.5 py-0.5">
            v2
          </span>
        </h1>
      </div>

      <div className="flex items-center justify-center gap-1">
        {TABS.map((item) => (
          <Button
            key={item.value}
            variant={tab === item.value ? "secondary" : "ghost"}
            className={classNames(
              "transition-colors duration-200",
              {
                "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700":
                  tab === item.value,
                "text-slate-600 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400":
                  tab !== item.value,
              }
            )}
            size="sm"
            onClick={() => onNewTab(item.value)}
          >
            <item.icon className="size-4" />
            <span className="hidden md:inline">{item.label}</span>
          </Button>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3">
        {children}
      </div>
    </header>
  );
}

export default Header;
