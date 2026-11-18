'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { createBrowserClient } from '@/lib/supabase/client';
import MessageList from './MessageList';
import type { Message } from '@/lib/types';

export default function ChatPanel({ bookingId, userId }: { bookingId: string; userId: string }) {
  const supabase = useMemo(() => createBrowserClient(), []);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    supabase
      .from('messages')
      .select('*')
      .eq('booking_id', bookingId)
      .order('seq')
      .then(({ data }) => setMessages((data as Message[]) ?? []));

    const channel = supabase.channel(`chat:${bookingId}`);
    channel
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        setMessages((prev) => [...prev, payload as Message]);
      })
      .subscribe();
    channelRef.current = channel;
  }, [bookingId, supabase]);

  async function send() {
    const body = text.trim();
    if (!body) return;
    const message = {
      booking_id: bookingId,
      sender_id: userId,
      body,
      seq: messages.length + 1,
      created_at: new Date().toISOString(),
    };
    await supabase.from('messages').insert(message);
    await channelRef.current?.send({ type: 'broadcast', event: 'message', payload: message });
    setMessages((prev) => [...prev, message as Message]);
    setText('');
  }

  return (
    <section className="chat">
      <MessageList messages={messages} />
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a message"
      />
      <button onClick={async () => { await send(); }}>Send</button>
    </section>
  );
}
