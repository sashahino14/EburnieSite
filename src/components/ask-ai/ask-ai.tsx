/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useRef } from "react";
import { RiSparkling2Fill } from "react-icons/ri";
import { GrSend } from "react-icons/gr";
import { defaultHTML } from "../../../utils/consts";
import classNames from "classnames";
import { toast } from "sonner";
import {
  useLocalStorage,
  useUpdateEffect,
} from "react-use";
import { ChevronDown } from "lucide-react";

import SuccessSound from "./../../assets/success.mp3";
import Settings from "../settings/settings";
import ProModal from "../pro-modal/pro-modal";
import { Button } from "../ui/button";

// @ts-expect-error not needed
import { MODELS } from "./../../../utils/providers";

function AskAI({
  html,
  setHtml,
  onScrollToBottom,
  isAiWorking,
  setisAiWorking,
  onNewPrompt,
  onSuccess,
}: {
  html: string;
  setHtml: (html: string) => void;
  onScrollToBottom: () => void;
  isAiWorking: boolean;
  onNewPrompt: (prompt: string) => void;
  setisAiWorking: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  onSuccess: (
    h: string,
    p: string
  ) => void;
}) {
  const refThink =
    useRef<HTMLDivElement | null>(null);

  const [prompt, setPrompt] =
    useState("");

  const [hasAsked, setHasAsked] =
    useState(false);

  const [previousPrompt, setPreviousPrompt] =
    useState("");

  const [provider, setProvider] =
    useLocalStorage(
      "provider",
      "auto"
    );

  const [model, setModel] =
    useLocalStorage(
      "model",
      MODELS[0].value
    );

  const [openProvider, setOpenProvider] =
    useState(false);

  const [providerError, setProviderError] =
    useState("");

  const [openProModal, setOpenProModal] =
    useState(false);

  const [think, setThink] =
    useState<string | undefined>(
      undefined
    );

  const [openThink, setOpenThink] =
    useState(false);

  const [isThinking, setIsThinking] =
    useState(true);

  const audio = new Audio(
    SuccessSound
  );

  audio.volume = 0.5;

  const callAi = async () => {
    if (
      isAiWorking ||
      !prompt.trim()
    ) {
      return;
    }

    setisAiWorking(true);
    setProviderError("");
    setThink("");
    setOpenThink(false);
    setIsThinking(true);

    let contentResponse = "";
    let lastRenderTime = 0;

    try {
      onNewPrompt(prompt);

      const request = await fetch(
        "/api/ask-ai",
        {
          method: "POST",
          body: JSON.stringify({
            prompt,
            provider,
            model,
            ...(html === defaultHTML
              ? {}
              : { html }),
            ...(previousPrompt
              ? { previousPrompt }
              : {}),
          }),
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

      if (!request.body) {
        throw new Error(
          "The AI returned an empty response."
        );
      }

      if (!request.ok) {
        let errorData: any = null;

        try {
          errorData =
            await request.json();
        } catch {
          errorData = null;
        }

        if (
          errorData?.openSelectProvider
        ) {
          setOpenProvider(true);
          setProviderError(
            errorData.message
          );
        } else if (
          errorData?.openProModal
        ) {
          setOpenProModal(true);
        } else {
          toast.error(
            errorData?.message ||
              "AI request failed."
          );
        }

        setisAiWorking(false);
        return;
      }

      const reader =
        request.body.getReader();

      const decoder =
        new TextDecoder("utf-8");

      const selectedModel =
        MODELS.find(
          (m: { value: string }) =>
            m.value === model
        );

      let contentThink:
        | string
        | undefined =
        undefined;

      const read = async (): Promise<void> => {
        const {
          done,
          value,
        } = await reader.read();

        if (done) {
          toast.success(
            "AI responded successfully"
          );

          setPreviousPrompt(
            prompt
          );

          setPrompt("");

          setisAiWorking(false);
          setHasAsked(true);

          audio.play().catch(() => {});

          const finalDoc =
            contentResponse.match(
              /<!DOCTYPE html>[\s\S]*<\/html>/
            )?.[0];

          if (finalDoc) {
            setHtml(finalDoc);
          }

          onSuccess(
            finalDoc ??
              contentResponse,
            prompt
          );

          return;
        }

        const chunk =
          decoder.decode(value, {
            stream: true,
          });

        contentResponse += chunk;

        if (
          selectedModel?.isThinker
        ) {
          const thinkMatch =
            contentResponse.match(
              /<think>[\s\S]*/
            )?.[0];

          if (
            thinkMatch &&
            !contentResponse.includes(
              "</think>"
            )
          ) {
            if (
              (contentThink?.length ??
                0) < 3
            ) {
              setOpenThink(true);
            }

            setThink(
              thinkMatch
                .replace(
                  "<think>",
                  ""
                )
                .trim()
            );

            contentThink += chunk;
          }
        }

        const newHtml =
          contentResponse.match(
            /<!DOCTYPE html>[\s\S]*/
          )?.[0];

        if (newHtml) {
          setIsThinking(false);

          let partialDoc =
            newHtml;

          if (
            !partialDoc.includes(
              "</html>"
            )
          ) {
            partialDoc +=
              "\n</html>";
          }

          const now =
            Date.now();

          if (
            now -
              lastRenderTime >
            300
          ) {
            setHtml(partialDoc);
            lastRenderTime = now;
          }

          if (
            partialDoc.length > 200
          ) {
            onScrollToBottom();
          }
        }

        await read();
      };

      await read();
    } catch (error: any) {
      setisAiWorking(false);

      toast.error(
        error?.message ||
          "An error occurred while contacting the AI."
      );
    }
  };

  useUpdateEffect(() => {
    if (refThink.current) {
      refThink.current.scrollTop =
        refThink.current.scrollHeight;
    }
  }, [think]);

  useUpdateEffect(() => {
    if (!isThinking) {
      setOpenThink(false);
    }
  }, [isThinking]);

  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-lg ring-[5px] focus-within:ring-sky-500/50 ring-transparent z-10 absolute bottom-3 left-3 w-[calc(100%-20px)] group">
      {think && (
        <div
          ref={refThink}
          className="w-full border-b border-neutral-700 relative overflow-hidden"
        >
          <header
            className="flex items-center justify-between px-5 py-2.5 group hover:bg-neutral-600/20 transition-colors duration-200 cursor-pointer"
            onClick={() => {
              setOpenThink(
                !openThink
              );
            }}
          >
            <p className="text-sm font-medium text-neutral-300 group-hover:text-neutral-200 transition-colors duration-200">
              {isThinking
                ? "AI is thinking..."
                : "AI's plan"}
            </p>

            <ChevronDown
              className={classNames(
                "size-4 text-neutral-400 group-hover:text-neutral-300 transition-all duration-200",
                {
                  "rotate-180":
                    openThink,
                }
              )}
            />
          </header>

          <main
            className={classNames(
              "overflow-y-auto transition-all duration-200 ease-in-out",
              {
                "max-h-[0px]":
                  !openThink,

                "min-h-[250px] max-h-[250px] border-t border-neutral-700":
                  openThink,
              }
            )}
          >
            <p className="text-[13px] text-neutral-400 whitespace-pre-line px-5 pb-4 pt-3">
              {think}
            </p>
          </main>
        </div>
      )}

      <div
        className={classNames(
          "w-full relative flex items-center justify-between pl-3.5 p-2 lg:p-2 lg:pl-4",
          {
            "animate-pulse":
              isAiWorking,
          }
        )}
      >
        {isAiWorking && (
          <div className="absolute bg-neutral-800 rounded-lg bottom-0 left-10 w-[calc(100%-92px)] h-full z-1 flex items-center justify-start max-lg:text-sm">
            <p className="text-neutral-400 font-code">
              AI is{" "}
              {isThinking
                ? "thinking"
                : "coding"}
              ...
            </p>
          </div>
        )}

        <RiSparkling2Fill className="size-5 text-neutral-400 group-focus-within:text-sky-500" />

        <input
          type="text"
          disabled={isAiWorking}
          className="w-full bg-transparent max-lg:text-sm outline-none px-3 text-white placeholder:text-neutral-400 font-code"
          placeholder={
            hasAsked
              ? "What do you want to ask AI next?"
              : "Ask AI anything..."
          }
          value={prompt}
          onChange={(e) =>
            setPrompt(
              e.target.value
            )
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              callAi();
            }
          }}
        />

        <div className="flex items-center justify-end gap-2">
          <Settings
            provider={
              provider as string
            }
            model={model as string}
            onChange={setProvider}
            onModelChange={setModel}
            open={openProvider}
            error={providerError}
            onClose={
              setOpenProvider
            }
          />

          <Button
            variant="pink"
            size="icon"
            disabled={
              isAiWorking ||
              !prompt.trim()
            }
            onClick={callAi}
          >
            <GrSend className="-translate-x-[1px]" />
          </Button>
        </div>
      </div>

      <ProModal
        html={html}
        open={openProModal}
        onClose={() =>
          setOpenProModal(false)
        }
      />
    </div>
  );
}

export default AskAI;