import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Loader2, TrendingUp, PieChart, Coins, Bot } from 'lucide-react';
import { aiService } from '../services/ai.service';
import { ChatMessage } from '../types/chat.types';

export default function Chat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Načítaj históriu chatu
  const { data: history } = useQuery({
    queryKey: ['chat-history'],
    queryFn: () => aiService.getChatHistory(50),
  });

  useEffect(() => {
    if (history) {
      setMessages(history.reverse());
    }
  }, [history]);

  // Scroll na koniec pri novej správe
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mutation pre odoslanie správy
  const sendMessageMutation = useMutation({
    mutationFn: aiService.chat,
    onSuccess: data => {
      // Pridaj assistant odpoveď do messages
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.message,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, newMessage]);
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMessageMutation.isPending) return;

    // Pridaj user správu do messages
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    // Odošli správu
    sendMessageMutation.mutate(message);
  };

  const quickActions = [
    { icon: PieChart, label: 'Analyzuj portfólio', prompt: 'Analyzuj moje portfólio a daj mi odporúčania' },
    { icon: TrendingUp, label: 'Trhové trendy', prompt: 'Aké sú aktuálne trhové trendy?' },
    { icon: Coins, label: 'Crypto analýza', prompt: 'Analyzuj moje crypto holdings' },
  ];

  const handleQuickAction = (prompt: string) => {
    setMessage(prompt);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">AI Finančný Poradca</h1>
        <p className="text-gray-600 mt-1">Opýtajte sa na čokoľvek ohľadne vašich financií</p>
      </div>

      {/* Quick Actions */}
      {messages.length === 0 && (
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">Rýchle akcie:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickAction(action.prompt)}
                className="card hover:shadow-md transition-shadow flex items-center gap-3 p-4"
              >
                <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
                  <action.icon size={20} />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 card overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Bot size={48} />
            <p className="mt-4">Začnite konverzáciu s AI poradcom</p>
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-4 ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-primary-100' : 'text-gray-500'}`}>
                {new Date(msg.createdAt).toLocaleTimeString('sk-SK', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {sendMessageMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-2">
              <Loader2 size={20} className="animate-spin text-primary-600" />
              <span className="text-gray-600">AI premýšľa...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Napíšte správu..."
          className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          disabled={sendMessageMutation.isPending}
        />
        <button
          type="submit"
          disabled={!message.trim() || sendMessageMutation.isPending}
          className="btn btn-primary px-6 flex items-center gap-2"
        >
          <Send size={20} />
          Odoslať
        </button>
      </form>
    </div>
  );
}
