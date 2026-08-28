import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import { MODELS, PROVIDERS } from "./utils/providers.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.APP_PORT || 5173;

app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "dist")));

/* =========================================================
   HELPERS
========================================================= */

function githubHeaders() {
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "EburnieSite",
  };
}

async function githubRequest(url) {
  const response = await fetch(url, {
    headers: githubHeaders(),
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return {
    response,
    data,
  };
}

function decodeGithubContent(content) {
  return Buffer.from(
    content.replace(/\n/g, ""),
    "base64"
  ).toString("utf8");
}

/* =========================================================
   HEALTH
========================================================= */

app.get("/api/health", (_req, res) => {
  res.status(200).send({
    ok: true,
    service: "EburnieSite",
    provider: "deepseek",
    providerConfigured: Boolean(
      process.env.DEEPSEEK_API_KEY
    ),
    model:
      process.env.DEEPSEEK_MODEL ||
      "deepseek-v4-flash",
  });
});

/* =========================================================
   GITHUB PUBLIC PROJECT LOADER
========================================================= */

/**
 * Load a public GitHub repository.
 *
 * GET /api/github/load/:owner/:repo
 *
 * No authentication required.
 */
app.get(
  "/api/github/load/:owner/:repo",
  async (req, res) => {
    try {
      const { owner, repo } = req.params;

      if (!owner || !repo) {
        return res.status(400).send({
          ok: false,
          message: "Invalid GitHub repository.",
        });
      }

      const cleanOwner = String(owner).trim();
      const cleanRepo = String(repo)
        .trim()
        .replace(/\.git$/, "");

      const url =
        `https://api.github.com/repos/` +
        `${encodeURIComponent(cleanOwner)}/` +
        `${encodeURIComponent(cleanRepo)}/contents/index.html`;

      const result = await githubRequest(url);

      if (!result.response.ok) {
        return res.status(result.response.status).send({
          ok: false,
          message:
            result.data?.message ||
            "Unable to load the GitHub repository.",
        });
      }

      if (!result.data?.content) {
        return res.status(404).send({
          ok: false,
          message:
            "index.html was not found in this repository.",
        });
      }

      const html = decodeGithubContent(
        result.data.content
      );

      res.status(200).send({
        ok: true,
        html,
        repository: `${cleanOwner}/${cleanRepo}`,
        path: `${cleanOwner}/${cleanRepo}`,
        repoUrl:
          `https://github.com/${cleanOwner}/${cleanRepo}`,
        url:
          `https://${cleanOwner}.github.io/${cleanRepo}/`,
      });
    } catch (error) {
      console.error(
        "GitHub load error:",
        error
      );

      res.status(500).send({
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to load GitHub project.",
      });
    }
  }
);

/**
 * Backward-compatible remix endpoint.
 *
 * GET /api/remix/:owner/:repo
 */
app.get(
  "/api/remix/:owner/:repo",
  async (req, res) => {
    try {
      const { owner, repo } = req.params;

      if (!owner || !repo) {
        return res.status(400).send({
          ok: false,
          message: "Invalid GitHub repository.",
        });
      }

      const cleanOwner = String(owner).trim();
      const cleanRepo = String(repo)
        .trim()
        .replace(/\.git$/, "");

      const url =
        `https://api.github.com/repos/` +
        `${encodeURIComponent(cleanOwner)}/` +
        `${encodeURIComponent(cleanRepo)}/contents/index.html`;

      const result = await githubRequest(url);

      if (!result.response.ok) {
        return res.status(result.response.status).send({
          ok: false,
          message:
            result.data?.message ||
            "Unable to load GitHub project.",
        });
      }

      if (!result.data?.content) {
        return res.status(404).send({
          ok: false,
          message:
            "index.html was not found in this repository.",
        });
      }

      const html = decodeGithubContent(
        result.data.content
      );

      res.status(200).send({
        ok: true,
        html,
        path: `${cleanOwner}/${cleanRepo}`,
        isOwner: false,
        repoUrl:
          `https://github.com/${cleanOwner}/${cleanRepo}`,
        url:
          `https://${cleanOwner}.github.io/${cleanRepo}/`,
      });
    } catch (error) {
      console.error(
        "GitHub remix error:",
        error
      );

      res.status(500).send({
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to load GitHub project.",
      });
    }
  }
);

/* =========================================================
   DEEPSEEK AI
========================================================= */

app.post("/api/ask-ai", async (req, res) => {
  const {
    prompt,
    html,
    previousPrompt,
    provider = "deepseek",
    model,
  } = req.body;

  if (!prompt) {
    return res.status(400).send({
      ok: false,
      message: "Missing required fields.",
    });
  }

  if (!model) {
    return res.status(400).send({
      ok: false,
      message: "Missing model field.",
    });
  }

  const selectedModel = MODELS.find(
    (item) =>
      item.value === model ||
      item.label === model
  );

  if (!selectedModel) {
    return res.status(400).send({
      ok: false,
      message: "Invalid model selected.",
    });
  }

  if (
    !selectedModel.providers.includes(provider) &&
    provider !== "auto"
  ) {
    return res.status(400).send({
      ok: false,
      openSelectProvider: true,
      message:
        `The selected model does not support ` +
        `the ${provider} provider.`,
    });
  }

  const tokensUsed =
    (prompt?.length || 0) +
    (previousPrompt?.length || 0) +
    (html?.length || 0);

  const selectedProvider =
    PROVIDERS.deepseek;

  if (
    tokensUsed >= selectedProvider.max_tokens
  ) {
    return res.status(400).send({
      ok: false,
      openSelectProvider: true,
      message:
        `Context is too long. ` +
        `${selectedProvider.name} allows ` +
        `${selectedProvider.max_tokens} max tokens.`,
    });
  }

  const apiKey =
    process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return res.status(500).send({
      ok: false,
      message:
        "DEEPSEEK_API_KEY is not configured.",
    });
  }

  res.setHeader(
    "Content-Type",
    "text/plain; charset=utf-8"
  );
  res.setHeader(
    "Cache-Control",
    "no-cache"
  );
  res.setHeader(
    "Connection",
    "keep-alive"
  );

  let completeResponse = "";

  try {
    const messages = [
      {
        role: "system",
        content: `
ONLY USE HTML, CSS AND JAVASCRIPT.

If you want to use an icon, make sure to import the required library first.

Create the best UI possible using HTML, CSS and JavaScript.

MAKE IT FULLY RESPONSIVE.

Use TailwindCSS whenever possible. If you need custom CSS, you may use it as well.

If TailwindCSS is used, make sure to import it in the HTML head:

<script src="https://cdn.tailwindcss.com"></script>

Create modern, polished, professional and unique interfaces.

ALWAYS RETURN THE RESULT AS A SINGLE COMPLETE HTML FILE.

The response must contain the complete website code and nothing outside the HTML document.
        `.trim(),
      },

      ...(previousPrompt
        ? [
            {
              role: "user",
              content: previousPrompt,
            },
          ]
        : []),

      ...(html
        ? [
            {
              role: "assistant",
              content:
                `The current code is: ${html}`,
            },
          ]
        : []),

      {
        role: "user",
        content: prompt,
      },
    ];

    const deepSeekModel =
      process.env.DEEPSEEK_MODEL ||
      "deepseek-v4-flash";

    const response = await fetch(
      "https://api.deepseek.com/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Authorization:
            `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: deepSeekModel,
          messages,
          stream: true,
          max_tokens: 131000,
        }),
      }
    );

    if (!response.ok) {
      const errorText =
        await response.text();

      throw new Error(
        `DeepSeek API error (${response.status}): ${errorText}`
      );
    }

    if (!response.body) {
      throw new Error(
        "DeepSeek returned an empty response body."
      );
    }

    const reader =
      response.body.getReader();

    const decoder =
      new TextDecoder();

    let buffer = "";
    let finished = false;

    while (!finished) {
      const { value, done } =
        await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, {
        stream: true,
      });

      const lines =
        buffer.split("\n");

      buffer =
        lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();

        if (
          !trimmed ||
          !trimmed.startsWith("data:")
        ) {
          continue;
        }

        const data =
          trimmed.slice(5).trim();

        if (data === "[DONE]") {
          finished = true;
          break;
        }

        try {
          const parsed =
            JSON.parse(data);

          const chunk =
            parsed.choices?.[0]?.delta
              ?.content;

          if (!chunk) {
            continue;
          }

          let newChunk = chunk;

          if (chunk.includes("</html>")) {
            newChunk =
              newChunk.replace(
                /<\/html>[\s\S]*/,
                "</html>"
              );
          }

          completeResponse +=
            newChunk;

          res.write(newChunk);

          if (
            completeResponse.includes(
              "</html>"
            )
          ) {
            finished = true;
            break;
          }
        } catch {
          // Ignore incomplete SSE chunks.
        }
      }
    }

    res.end();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "An error occurred while processing your request.";

    if (
      message.includes(
        "exceeded your monthly included credits"
      )
    ) {
      if (!res.headersSent) {
        return res.status(402).send({
          ok: false,
          openProModal: true,
          message,
        });
      }

      return res.end();
    }

    if (!res.headersSent) {
      return res.status(500).send({
        ok: false,
        message,
      });
    }

    res.end();
  }
});

/* =========================================================
   FRONTEND FALLBACK
========================================================= */

app.get("*", (_req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      "dist",
      "index.html"
    )
  );
});

/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, () => {
  console.log(
    `EburnieSite server is running on port ${PORT}`
  );
});