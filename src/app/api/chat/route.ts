import { auth } from "@/lib/auth";
import { anthropic } from "@/lib/claude";
import { getChatSystemPrompt } from "@/lib/chat-system-prompt";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";

const requestSchema = z.object({
  message: z.string().min(1).max(5000),
});

const tools: Anthropic.Tool[] = [
  {
    name: "subscribe_topic",
    description: "Subscribe the user to a topic for their daily brief",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Topic name" },
        category: { type: "string", description: "Category" },
        keywords: {
          type: "array",
          items: { type: "string" },
          description: "Search keywords for news aggregation",
        },
        priority: {
          type: "number",
          description: "Priority 1-10 (optional, defaults to 5)",
        },
      },
      required: ["name", "category", "keywords"],
    },
  },
  {
    name: "unsubscribe_topic",
    description: "Remove a topic subscription",
    input_schema: {
      type: "object",
      properties: {
        topicId: { type: "string", description: "Topic ID to unsubscribe from" },
      },
      required: ["topicId"],
    },
  },
  {
    name: "list_subscriptions",
    description: "List the user's current topic subscriptions",
    input_schema: { type: "object", properties: {} },
  },
];

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { message } = requestSchema.parse(body);

    // Load user's chat history (last 20 messages)
    const chatHistory = await prisma.chatMessage.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    chatHistory.reverse(); // oldest first

    // Load user's current subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: session.user.id },
      include: { topic: true },
      orderBy: { createdAt: "desc" },
    });

    const existingSubscriptions = subscriptions.map((sub) => ({
      id: sub.topic.id,
      name: sub.topic.name,
      category: sub.topic.category,
    }));

    // Save user message
    await prisma.chatMessage.create({
      data: {
        userId: session.user.id,
        role: "user",
        content: message,
      },
    });

    // Build conversation for Claude
    const messages: Anthropic.MessageParam[] = [
      ...chatHistory.map(
        (msg): Anthropic.MessageParam => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })
      ),
      {
        role: "user",
        content: message,
      },
    ];

    // Stream response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const toolResults: Array<{ name: string; result: unknown }> = [];

          const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 2048,
            system: getChatSystemPrompt(existingSubscriptions),
            messages,
            tools,
            stream: true,
          });

          for await (const event of response) {
            if (event.type === "content_block_delta") {
              if (event.delta.type === "text_delta") {
                const text = event.delta.text;
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: "text", text })}\n\n`)
                );
              }
            } else if (event.type === "content_block_start") {
              if (event.content_block.type === "tool_use") {
                const toolName = event.content_block.name;
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: "tool_start", name: toolName })}\n\n`
                  )
                );
              }
            } else if (event.type === "message_delta") {
              if (event.delta.stop_reason === "tool_use") {
                // Handle tool use - we need to get the full message first
                // For now, we'll handle tools in a non-streaming way
              }
            }
          }

          // Check if we need to handle tool calls
          // Since streaming with tool use is complex, we'll make a second call if needed
          const fullMessage = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 2048,
            system: getChatSystemPrompt(existingSubscriptions),
            messages,
            tools,
          });

          // Handle tool calls
          if (fullMessage.stop_reason === "tool_use") {
            for (const block of fullMessage.content) {
              if (block.type === "tool_use") {
                const toolName = block.name;
                const toolInput = block.input as Record<string, unknown>;

                let toolResult: unknown = null;

                if (toolName === "subscribe_topic") {
                  const name = toolInput.name as string;
                  const category = toolInput.category as string;
                  const keywords = toolInput.keywords as string[];
                  const priority = (toolInput.priority as number) || 5;

                  // Create or find topic
                  let topic = await prisma.topic.findFirst({
                    where: {
                      name,
                      category,
                    },
                  });

                  if (!topic) {
                    topic = await prisma.topic.create({
                      data: {
                        name,
                        category,
                        keywords,
                      },
                    });
                  }

                  // Create subscription
                  await prisma.subscription.upsert({
                    where: {
                      userId_topicId: {
                        userId: session.user.id,
                        topicId: topic.id,
                      },
                    },
                    create: {
                      userId: session.user.id,
                      topicId: topic.id,
                      priority,
                    },
                    update: { priority },
                  });

                  toolResult = { success: true, topicId: topic.id, topicName: name };

                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({
                        type: "tool_result",
                        name: toolName,
                        result: toolResult,
                      })}\n\n`
                    )
                  );
                } else if (toolName === "unsubscribe_topic") {
                  const topicId = toolInput.topicId as string;

                  await prisma.subscription.deleteMany({
                    where: {
                      userId: session.user.id,
                      topicId,
                    },
                  });

                  toolResult = { success: true };

                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({
                        type: "tool_result",
                        name: toolName,
                        result: toolResult,
                      })}\n\n`
                    )
                  );
                } else if (toolName === "list_subscriptions") {
                  const subs = await prisma.subscription.findMany({
                    where: { userId: session.user.id },
                    include: { topic: true },
                    orderBy: { createdAt: "desc" },
                  });

                  toolResult = subs.map((sub) => ({
                    id: sub.topic.id,
                    name: sub.topic.name,
                    category: sub.topic.category,
                    priority: sub.priority,
                  }));

                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({
                        type: "tool_result",
                        name: toolName,
                        result: toolResult,
                      })}\n\n`
                    )
                  );
                }

                toolResults.push({ name: toolName, result: toolResult });
              }
            }
          }

          // Extract text content from the response
          const assistantText = fullMessage.content
            .filter((block) => block.type === "text")
            .map((block) => (block.type === "text" ? block.text : ""))
            .join("");

          // Save assistant message
          await prisma.chatMessage.create({
            data: {
              userId: session.user.id,
              role: "assistant",
              content: assistantText,
              metadata:
                toolResults.length > 0
                  ? JSON.parse(JSON.stringify({ tools: toolResults }))
                  : undefined,
            },
          });

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
          controller.close();
        } catch (error) {
          console.error("Chat API error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message: "Failed to process message" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
