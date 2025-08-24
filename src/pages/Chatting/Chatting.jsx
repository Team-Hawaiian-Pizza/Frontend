import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import chatApi from '../../api/chatApi';
import './Chatting.css';

const ChattingPage = () => {
  const { userId } = useParams();               // /chat/:userId 지원
  const [searchParams] = useSearchParams();     // ?name=채부경
  const incomingName = searchParams.get('name') || '';

  const [chatList, setChatList] = useState([]);
  const [threads, setThreads] = useState({});
  const [selectedChat, setSelectedChat] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomTarget, setNewRoomTarget] = useState('');

  // 채팅 목록 로드
  const loadChatList = async () => {
    try {
      const currentUsername = localStorage.getItem('username');
      const response = await chatApi.get(`/users/${currentUsername}/conversations/`);
      const conversations = response.data;
      
      const formattedChats = conversations.map(conv => {
        // 상대방 username 찾기
        const otherUser = conv.participant1_id === currentUsername ? conv.participant2_id : conv.participant1_id;
        
        return {
          id: conv.id, // conversation id 사용
          name: otherUser,
          otherUserId: otherUser, // 메시지 로드할 때 필요
          lastMessageDate: conv.last_message ? new Date(conv.last_message.created_at).toLocaleDateString('ko-KR') : '대화 없음'
        };
      });
      
      setChatList(formattedChats);
      if (formattedChats.length > 0 && !selectedChat) {
        setSelectedChat(formattedChats[0]);
      }
    } catch (error) {
      console.error('채팅 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 특정 conversation의 메시지 로드
  const loadMessages = async (conversationId) => {
    try {
      const response = await chatApi.get(`/conversations/${conversationId}/messages/`);
      const messages = response.data;
      
      const currentUsername = localStorage.getItem('username');
      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        sender: msg.sender_id,
        text: msg.content,
        isMe: msg.sender_id === currentUsername
      }));
      
      setThreads(prev => ({ ...prev, [conversationId]: formattedMessages }));
    } catch (error) {
      console.error('메시지 로드 실패:', error);
      setThreads(prev => ({ ...prev, [conversationId]: [] }));
    }
  };

  // 채팅방 생성
  const createChatRoom = async () => {
    if (!newRoomTarget.trim()) return;
    
    try {
      const currentUsername = localStorage.getItem('username');
      await chatApi.post('/conversations/', {
        participant1_id: currentUsername,
        participant2_id: newRoomTarget.trim()
      });
      
      // 새 채팅방이 생성되면 목록 새로고침
      await loadChatList();
      setShowCreateRoom(false);
      setNewRoomTarget('');
    } catch (error) {
      console.error('채팅방 생성 실패:', error);
      alert('채팅방 생성에 실패했습니다. 사용자명을 확인해주세요.');
    }
  };

  // 컴포넌트 마운트 시 채팅 목록 로드
  useEffect(() => {
    loadChatList();
  }, []);

  // URL로 들어온 상대가 있으면 자동 선택
  useEffect(() => {
    if (!userId || chatList.length === 0) return;
    // userId는 conversation ID가 아니라 상대 사용자 이름일 수 있음
    const exists = chatList.find(c => c.otherUserId === userId || c.id === userId);

    if (exists) {
      setSelectedChat(exists);
      loadMessages(exists.id);
    }
  }, [userId, chatList]);

  // 채팅 선택 핸들러
  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    if (!threads[chat.id]) {
      loadMessages(chat.id);
    }
  };

  // 선택된 채팅이 변경될 때 메시지 로드
  useEffect(() => {
    if (selectedChat && !threads[selectedChat.id]) {
      loadMessages(selectedChat.id);
    }
  }, [selectedChat, threads]);

  // 현재 선택된 대화의 메시지
  const currentMessages = useMemo(() => {
    if (!selectedChat) return [];
    return threads[selectedChat.id] || [];
  }, [threads, selectedChat]);

  // 메시지 전송
  const handleSend = async () => {
    if (!selectedChat || !input.trim()) return;
    const conversationId = selectedChat.id;
    const text = input.trim();
    const currentUsername = localStorage.getItem('username');

    // 즉시 UI 업데이트 (낙관적 업데이트)
    const tempMessage = { 
      id: Date.now(), 
      sender: currentUsername, 
      text, 
      isMe: true 
    };
    
    setThreads(prev => {
      const old = prev[conversationId] || [];
      return { ...prev, [conversationId]: [...old, tempMessage] };
    });
    
    setInput('');

    try {
      await chatApi.post(`/conversations/${conversationId}/messages/send/`, {
        sender_id: currentUsername,
        content: text,
        message_type: 'text'
      });
      
      // 메시지 전송 성공 후 최신 메시지 다시 로드
      await loadMessages(conversationId);
      
      // 채팅 목록의 마지막 메시지 날짜 업데이트
      setChatList(prev =>
        prev.map(c => (c.id === conversationId ? { 
          ...c, 
          lastMessageDate: new Date().toLocaleDateString('ko-KR')
        } : c))
      );
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      // 실패 시 UI에서 임시 메시지 제거
      setThreads(prev => {
        const old = prev[conversationId] || [];
        return { ...prev, [conversationId]: old.filter(msg => msg.id !== tempMessage.id) };
      });
      alert('메시지 전송에 실패했습니다.');
    }
  };

  return (
    <div className="chatting-page">
      <div className="chat-container">
        {/* 왼쪽: 전체 대화 목록 */}
        <div className="chat-list-section">
          <div className="chat-header" style={{ display: 'flex', alignItems: 'center' }}>
            전체 대화
            <button 
              className="create-room-btn" 
              onClick={() => setShowCreateRoom(true)}
              style={{ marginLeft: 'auto', padding: '5px 10px', fontSize: '12px' }}
            >
              + 새 채팅
            </button>
          </div>
          
          {showCreateRoom && (
            <div className="create-room-form" style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
              <input
                type="text"
                placeholder="사용자명을 입력하세요"
                value={newRoomTarget}
                onChange={(e) => setNewRoomTarget(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createChatRoom()}
                style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
              />
              <div>
                <button onClick={createChatRoom} style={{ marginRight: '5px', padding: '5px 10px' }}>
                  생성
                </button>
                <button onClick={() => { setShowCreateRoom(false); setNewRoomTarget(''); }} style={{ padding: '5px 10px' }}>
                  취소
                </button>
              </div>
            </div>
          )}
          
          <div className="chat-list">
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>
            ) : chatList.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>채팅방이 없습니다</div>
            ) : (
              chatList.map(chat => (
                <div
                  key={chat.id}
                  className={`chat-item ${selectedChat?.id === chat.id ? 'selected' : ''}`}
                  onClick={() => handleChatSelect(chat)}
                >
                  <div className="chat-avatar"></div>
                  <div className="chat-info">
                    <div className="chat-name">{chat.name}</div>
                    <div className="chat-date">{chat.lastMessageDate}</div>
                  </div>
                </div>
              ))
            )}
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
