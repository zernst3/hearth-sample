'use client';

import type { Message } from '@/lib/types';

export default function MessageList({ messages }: { messages: Message[] }) {
  const newestFirst = [...messages].reverse();
  return (
    <ul className="messages">
      {newestFirst.map((message, index) => (
        <li key={index}>
          {message.body}
          {message.created_at ? (
            <time dateTime={message.created_at}>
              {new Date(message.created_at).toLocaleTimeString()}
            </time>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
