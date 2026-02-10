# Spec 06 — AI Chat Agent

## Goal
Build the conversational AI chat interface where users discover and subscribe to topics through natural conversation with Claude.

## Dependencies
- Spec 02 (authentication)
- Spec 03 (database schema)
- Spec 04 (shared UI components)

## Tasks

### 1. Create Claude Client

#### `src/lib/claude.ts`
```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export { anthropic };
```

### 2. Define Chat System Prompt

#### `src/lib/chat-system-prompt.ts`
The system prompt should instruct Claude to:
- Act as a friendly briefing assistant named "Brief"
- Help users discover topics they care about
- Ask probing questions about interests
- Suggest specific topics based on conversation
- When the user confirms interest, use a tool to subscribe them
- Provide a structured JSON response when topics are identified
- Keep conversation natural and engaging
- Reference the user's existing subscriptions to avoid duplicates

### 3. Create Chat API Route

#### `src/app/api/chat/route.ts`
- POST endpoint accepting `{ message: string }`
- Requires authentication
- Loads user's chat history from database
- Loads user's current subscriptions for context
- Sends conversation to Claude with system prompt
- Claude can use tools:
  - `subscribe_topic` — subscribe user to a topic
  - `unsubscribe_topic` — remove a subscription
  - `list_topics` — show available topics
  - `create_topic` — create a new custom topic
- Saves both user and assistant messages to database
- Streams response back to client

### 4. Build Chat UI

#### `src/app/chat/page.tsx`
- Full-height chat interface
- Message history loaded from database on mount
- Input area at bottom
- Auto-scroll to latest message

#### `src/components/chat/message-list.tsx`
- Renders chat messages
- Different styling for user vs assistant
- Markdown rendering for assistant messages
- Timestamp display

#### `src/components/chat/message-input.tsx`
- Text input with send button
- Enter to send, Shift+Enter for newline
- Loading state while waiting for response
- Character limit indicator

#### `src/components/chat/topic-action-card.tsx`
- Inline card shown when Claude subscribes/unsubscribes a topic
- Shows: topic name, action taken, confirmation
- Animated appearance

### 5. Implement Streaming

Use the Vercel AI SDK pattern or manual SSE streaming:
- Stream Claude's response token-by-token to the client
- Show typing indicator while streaming
- Handle tool calls mid-stream (subscribe/unsubscribe actions)
- Display action confirmations inline

### 6. Chat History

- Load previous messages on page mount
- Paginate older messages (load more on scroll up)
- Clear chat option

## Claude Tool Definitions

```typescript
const tools = [
  {
    name: "subscribe_topic",
    description: "Subscribe the user to a topic for their daily brief",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Topic name" },
        category: { type: "string", description: "Category" },
        keywords: { type: "array", items: { type: "string" }, description: "Search keywords" },
        priority: { type: "number", description: "Priority 1-10" }
      },
      required: ["name", "category", "keywords"]
    }
  },
  {
    name: "unsubscribe_topic",
    description: "Remove a topic subscription",
    input_schema: {
      type: "object",
      properties: {
        topicId: { type: "string", description: "Topic ID to unsubscribe from" }
      },
      required: ["topicId"]
    }
  },
  {
    name: "list_subscriptions",
    description: "List the user's current topic subscriptions",
    input_schema: { type: "object", properties: {} }
  }
];
```

## Acceptance Criteria
- [ ] Chat UI renders with message history
- [ ] User can send messages and receive streamed responses
- [ ] Claude can subscribe/unsubscribe topics via tools
- [ ] Topic actions are confirmed inline in the chat
- [ ] Messages are persisted to database
- [ ] Chat is authenticated (redirects if not signed in)
- [ ] Build passes
