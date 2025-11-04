import React, { useState } from 'react';
import { messageContext } from './messages';
import type { messageInterface } from '../lib/types';
export default function MessageProvider({ children }: { children: React.ReactNode }) {
    const [messages,setMessages] = useState<messageInterface[]>([])
  return (
    <messageContext.Provider value={{ messages, setMessages }}>
      {children}
    </messageContext.Provider>
  );
}