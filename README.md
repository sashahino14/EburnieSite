---
title: DeepSite
emoji: 🐳
colorFrom: blue
colorTo: blue
sdk: docker
pinned: true
app_port: 5173
license: mit
short_description: Generate any application with DeepSeek
models:
  - deepseek-ai/DeepSeek-V3-0324
  - deepseek-ai/DeepSeek-R1-0528
# ── OAuth settings ────────────────────────────────────────────────
hf_oauth: true                       # enable “Sign-in with HF”
hf_oauth_expiration_minutes: 480     # keep session tokens 8 h
hf_oauth_scopes:                     # default is openid profile
  - write-repos
---

# DeepSite 🐳

DeepSite is a coding platform powered by DeepSeek AI, designed to make coding smarter and more efficient. Tailored for developers, data scientists, and AI engineers, it integrates generative AI into your coding projects to enhance creativity and productivity.

---

## Sign-in with Hugging Face

> The first time you open the Space you’ll see a “Sign-in with HF” button.  
> Accept the permissions prompt and you’ll be redirected back to DeepSite authenticated.

**Redirect URL**

```
https://tommytracx-deepsite.hf.space/auth/login
```

Add this URL to:

1. **Space variables**  
   `REDIRECT_URI=https://tommytracx-deepsite.hf.space/auth/login`
2. **OAuth app → Authorization callback URLs**

Required secrets (Settings → Secrets):

| Name | Value |
|------|-------|
| `OAUTH_CLIENT_ID` | client ID from your OAuth app |
| `OAUTH_CLIENT_SECRET` | client secret from your OAuth app |
| `DEFAULT_HF_TOKEN` | personal access token (scope: read) |

---

## Running locally

Clone the repo and provide the same variables in a local `.env` file:

```bash
APP_PORT=5173
OAUTH_CLIENT_ID=…
OAUTH_CLIENT_SECRET=…
DEFAULT_HF_TOKEN=…
REDIRECT_URI=http://localhost:5173/auth/login
```

Then build and run the Docker image:

```bash
docker build -t deepsite .
docker run -p 5173:5173 --env-file .env deepsite
```

The app will be available at <http://localhost:5173> and the OAuth flow will work against Hugging Face just like in the hosted Space.
