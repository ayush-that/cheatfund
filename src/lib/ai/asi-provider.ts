import { OpenAIProvider, createOpenAI, openai } from "@ai-sdk/openai";
import { customProvider } from "ai";

export const ASI_ONE_MODELS = [
  "asi1-mini",
  "asi1-fast",
  "asi1-extended",
  "asi1-agentic",
  "asi1-fast-agentic",
  "asi1-extended-agentic",
  "asi1-graph",
] as const;

export type AsiOneModelId = (typeof ASI_ONE_MODELS)[number];

const createAsi = (
  options: {
    apiKey?: string;
    baseURL?: string;
  } = {},
): OpenAIProvider => {
  return createOpenAI({
    baseURL: options.baseURL ?? "https://api.asi1.ai/v1",
    apiKey: options.apiKey ?? process.env.ASI1_API_KEY,
  });
};

const asi = createAsi();

export const asiProvider = customProvider({
  languageModels: {
    "asi1-mini": asi.chat("asi1-mini"),
    "asi1-fast": asi.chat("asi1-fast"),
    "asi1-extended": asi.chat("asi1-extended"),
    "asi1-agentic": asi.chat("asi1-agentic"),
    "asi1-fast-agentic": asi.chat("asi1-fast-agentic"),
    "asi1-extended-agentic": asi.chat("asi1-extended-agentic"),
    "asi1-graph": asi.chat("asi1-graph"),
  },

  fallbackProvider: openai,
});
