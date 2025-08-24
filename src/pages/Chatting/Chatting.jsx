import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import './Chatting.css';

/** 더미 채팅 목록 */
const initialChatList = [
  { id: 101, name: '인덕이', lastMessageDate: '2025년 8월 3일' },
  { id: 102, name: '홍길동', lastMessageDate: '2025년 8월 2일' },
];

/** 더미 스레드(사용자별 메시지) */
const initialThreads = {
  101: [
    { id: 1, sender: '인덕이', text: '안녕하세요, 명함 보고 연락드렸습니다.', isMe: false },
    { id: 2, sender: '나', text: '네, 안녕하세요. 어떤 도움이 필요하신가요?', isMe: true },
    { id: 3, sender: '인덕이', text: '혹시 에어컨 필터 청소 비용이 궁금해서요.', isMe: false },
    { id: 4, sender: '나', text: '네, 자세한 내용은 채팅으로 안내해 드릴게요.', isMe: true },
  ],
  102: [
    { id: 1, sender: '홍길동', text: '안녕하세요!', isMe: false },
    { id: 2, sender: '나', text: '반갑습니다 🙌', isMe: true },
  ],
};

const ChattingPage = () => {
  const { userId } = useParams();               // /chat/:userId 지원
  const [searchParams] = useSearchParams();     // ?name=채부경
  const incomingName = searchParams.get('name') || '';

  const [chatList, setChatList] = useState(initialChatList);
  const [threads, setThreads] = useState(initialThreads);
  const [selectedChat, setSelectedChat] = useState(initialChatList[0] || null);

  const [input, setInput] = useState('');

 

  // URL로 들어온 상대가 있으면 자동 선택(없으면 임시 대화방 생성)
  useEffect(() => {
    if (!userId) return;
    const uid = Number(userId);
    const exists = chatList.find(c => c.id === uid);

    if (exists) {
      setSelectedChat(exists);
      return;
    }

    // 목록에 없으면 임시 대화방 생성
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');

    const newChat = {
      id: uid,
      name: incomingName || `상대(${uid})`,
      lastMessageDate: `${y}년 ${m}월 ${d}일`,
    };

    setChatList(prev => [newChat, ...prev]);
    setThreads(prev => (prev[uid] ? prev : { ...prev, [uid]: [] }));
    setSelectedChat(newChat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, incomingName]);

  // 현재 선택된 대화의 메시지
  const currentMessages = useMemo(() => {
    if (!selectedChat) return [];
    return threads[selectedChat.id] || [];
  }, [threads, selectedChat]);

  // 전송(로컬) — Enter 또는 버튼
  const handleSend = () => {
    if (!selectedChat || !input.trim()) return;
    const uid = selectedChat.id;
    const text = input.trim();

    setThreads(prev => {
      const old = prev[uid] || [];
      const nextId = (old[old.length - 1]?.id || 0) + 1;
      return { ...prev, [uid]: [...old, { id: nextId, sender: '나', text, isMe: true }] };
    });

    // 마지막 대화 날짜 갱신
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');

    setChatList(prev =>
      prev.map(c => (c.id === uid ? { ...c, lastMessageDate: `${y}년 ${m}월 ${d}일` } : c))
    );

    setInput('');
    // TODO: 추후 백엔드에 메시지 전송 API 호출
  };

  return (
    <div className="chatting-page">
      <div className="chat-container">
        {/* 왼쪽: 전체 대화 목록 */}
        <div className="chat-list-section">
          <div className="chat-header">전체 대화</div>
          <div className="chat-list">
            {chatList.map(chat => (
              <div
                key={chat.id}
                className={`chat-item ${selectedChat?.id === chat.id ? 'selected' : ''}`}
                onClick={() => setSelectedChat(chat)}
              >
                <div className="chat-avatar"></div>
                <div className="chat-info">
                  <div className="chat-name">{chat.name}</div>
                  <div className="chat-date">{chat.lastMessageDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽: 채팅 내용 */}
        <div className="chat-content-section">
          <div className="chat-content-header">{selectedChat?.name || '채팅'}</div>

          <div className="chat-messages">
            {currentMessages.map(message => (
              <div key={message.id} className={`message ${message.isMe ? 'my-message' : ''}`}>
                {!message.isMe && <div className="chat-avatar-small"></div>}
                <div className="message-bubble">{message.text}</div>
                {message.isMe && <div className="chat-avatar-small"></div>}
              </div>
            ))}
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              placeholder="내용을 입력하세요"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend}>전송</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChattingPage;
