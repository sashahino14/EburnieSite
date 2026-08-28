export const PROVIDERS = {
  deepseek: {
    name: "DeepSeek",
    max_tokens: 131_000,
    id: "deepseek",
  },
};

export const MODELS = [
  {
    value: "deepseek-v4-flash",
    label: "DeepSeek V4 Flash",
    providers: ["deepseek"],
    autoProvider: "deepseek",
  },
  {
    value: "deepseek-v4-pro",
    label: "DeepSeek V4 Pro",
    providers: ["deepseek"],
    autoProvider: "deepseek",
  },
];
