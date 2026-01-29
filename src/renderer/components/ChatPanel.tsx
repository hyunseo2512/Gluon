import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import QuarkApi from '../services/api';
import '../styles/ChatPanel.css';

/**
 * AI 채팅 패널 컴포넌트
 */
function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Quark-v2');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 메시지 전송
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Create initial assistant message holder
      const assistantMessageId = (Date.now() + 1).toString();
      const initialAssistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '', // Start empty
        timestamp: new Date(),
        model: selectedModel,
      };

      setMessages((prev) => [...prev, initialAssistantMessage]);

      // Use Streaming API
      let fullContent = '';
      for await (const chunk of QuarkApi.chatStream(input, selectedModel)) {
        fullContent += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: fullContent }
              : msg
          )
        );
      }
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: `❌ 오류: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-panel">
      {/* 모델 선택 */}
      <div className="chat-header">
        <select
          className="model-select"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          disabled={isLoading}
        >
          <option value="Quark-v2">Quark-v2 (Latest)</option>
        </select>
      </div>

      {/* 메시지 목록 */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <h2>안녕하세요!</h2>
            <p>Quark AI 비서입니다. 무엇을 도와드릴까요?</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`message message-${message.role}`}>
              <div className="message-header">
                <span className="message-role">
                  {message.role === 'user' ? 'You' : 'Quark'}
                </span>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="message-content">{message.content}</div>
              {message.model && (
                <div className="message-model">모델: {message.model}</div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="message message-assistant">
            <div className="message-header">
              <span className="message-role">Quark</span>
            </div>
            <div className="message-content loading">
              <span className="loading-dot">●</span>
              <span className="loading-dot">●</span>
              <span className="loading-dot">●</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="input-container">
        <textarea
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요... (Shift+Enter: 줄바꿈)"
          disabled={isLoading}
          rows={3}
        />
        <button className="send-button" onClick={handleSend} disabled={isLoading || !input.trim()}>
          {isLoading ? '⏳' : '📤'} 전송
        </button>
      </div>
    </div>
  );
}

export default ChatPanel;
