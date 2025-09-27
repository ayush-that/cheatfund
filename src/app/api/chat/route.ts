import { asiProvider } from "~/lib/ai/asi-provider";
import { streamText, UIMessage, convertToModelMessages } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: asiProvider.languageModel("asi1-mini"),
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
