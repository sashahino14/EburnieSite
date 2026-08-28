import classNames from "classnames";
import { useState } from "react";
import { toast } from "sonner";
import { Github } from "lucide-react";

import Loading from "../loading/loading";
import { Auth } from "../../../utils/types";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

function LoadButton({
  auth,
  setHtml,
}: {
  auth?: Auth;
  setHtml: (html: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");

  const loadRepository = async () => {
    if (!url.trim()) {
      toast.error("Please enter a GitHub repository.");
      return;
    }

    setLoading(true);

    try {
      let repository = url.trim();

      repository = repository
        .replace(/^https?:\/\/github\.com\//, "")
        .replace(/^github\.com\//, "")
        .replace(/^\/+|\/+$/g, "");

      const parts = repository.split("/").filter(Boolean);

      if (parts.length < 2) {
        toast.error(
          "Please enter a valid GitHub repository URL or owner/repository."
        );
        setLoading(false);
        return;
      }

      const owner = parts[0];
      const repo = parts[1].replace(/\.git$/, "");

      const res = await fetch(
        `/api/github/load/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
      );

      const data = await res.json();

      if (res.ok && data.ok) {
        if (data.html) {
          setHtml(data.html);
        }

        toast.success("GitHub project loaded successfully.");

        setOpen(false);
      } else {
          toast.error(
          data.message || "Failed to load the GitHub repository."
        );
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "An error occurred while loading the repository.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={classNames("max-md:hidden", {
        "border-r border-gray-700 pr-5": auth,
      })}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="underline hover:text-white cursor-pointer text-xs lg:text-sm text-gray-300"
          >
            Load GitHub
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="p-0 overflow-hidden !bg-neutral-900"
          align="end"
        >
          <header className="flex items-center text-sm px-4 py-3 border-b gap-2 bg-neutral-950 border-neutral-800 font-semibold text-neutral-200">
            <span className="text-xs bg-neutral-700 text-white rounded-full pl-1.5 pr-2.5 py-0.5 flex items-center justify-start gap-1.5">
              <Github className="size-4" />
              GitHub
            </span>

            Load Project
          </header>

          <main className="px-4 pt-3 pb-4 space-y-3">
            <p className="text-sm text-neutral-300 bg-neutral-300/15 border border-neutral-300/15 rounded-md px-3 py-2">
              Load an existing project from a GitHub repository and continue
              editing it in EburnieSite.
            </p>

            <label className="block">
              <p className="text-muted-foreground text-sm mb-1.5">
                GitHub Repository
              </p>

              <Input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/username/project"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    loadRepository();
                  }
                }}
              />

              <p className="text-xs text-neutral-500 mt-1.5">
                Example: username/project
              </p>
            </label>

            <div className="pt-2 text-right">
              <Button
                size="sm"
                variant="default"
                disabled={loading || !url.trim()}
                onClick={loadRepository}
              >
                <Github className="size-3.5 mr-1.5" />
                Load project

                {loading && <Loading />}
              </Button>
            </div>
          </main>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default LoadButton;