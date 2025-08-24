import React, { useEffect, useMemo, useState, useRef } from 'react';
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
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const wsRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // 자동 스크롤 함수
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  // 타이핑 상태 전송
  const sendTypingStatus = async (typing) => {
    if (!selectedChat) return;
    
    const currentUsername = localStorage.getItem('username');
    
    // 웹소켓이 연결되어 있으면 웹소켓으로 전송
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        user_id: currentUsername,
        is_typing: typing
      }));
      return;
    }
    
    // 웹소켓이 없으면 HTTP API로 전송 (백엔드에서 지원하는 경우)
    try {
      await chatApi.post(`/conversations/${selectedChat.id}/typing/`, {
        user_id: currentUsername,
        is_typing: typing
      });
    } catch (error) {
      // 타이핑 상태 전송 실패는 치명적이지 않으므로 조용히 무시
      console.log('타이핑 상태 전송 실패:', error);
    }
  };

  // 타이핑 상태 확인 (폴링)
  const checkTypingStatus = async () => {
    if (!selectedChat) return;
    try {
      const response = await chatApi.get(`/conversations/${selectedChat.id}/typing/`);
      const typingData = response.data;
      const currentUsername = localStorage.getItem('username');
      
      // 자신이 아닌 사용자가 타이핑 중인지 확인
      const otherUserTyping = typingData.find(t => t.user_id !== currentUsername && t.is_typing);
      
      if (otherUserTyping) {
        setIsTyping(true);
        setTypingUser(otherUserTyping.user_id);
      } else {
        setIsTyping(false);
        setTypingUser('');
      }
    } catch (error) {
      console.log('타이핑 상태 확인 실패:', error);
    }
  };

  // 정기적으로 타이핑 상태 확인 (3초마다)
  useEffect(() => {
    if (!selectedChat) return;
    
    const interval = setInterval(checkTypingStatus, 3000);
    return () => clearInterval(interval);
  }, [selectedChat]);

  // 입력 핸들러
  const handleInputChange = (e) => {
    setInput(e.target.value);
    
    // 타이핑 시작 알림
    sendTypingStatus(true);
    
    // 기존 타이머 클리어
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // 1초 후 타이핑 중지 알림
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 1000);
  };

  // 키다운 핸들러 (한글 조합 중복 방지)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleSend();
    }
  };

  // 웹소켓 연결
  const connectWebSocket = (conversationId) => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//15.165.220.74:8000/ws/chat/${conversationId}/`;
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        setIsConnected(true);
        console.log('웹소켓 연결됨');
      };
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };
      
      wsRef.current.onclose = () => {
        setIsConnected(false);
        console.log('웹소켓 연결 끊어짐');
        // 5초 후 재연결 시도
        setTimeout(() => {
          if (selectedChat) {
            connectWebSocket(selectedChat.id);
          }
        }, 5000);
      };
      
      wsRef.current.onerror = (error) => {
        setIsConnected(false);
        console.error('웹소켓 오류:', error);
      };
    } catch (error) {
      console.error('웹소켓 연결 실패:', error);
      setIsConnected(false);
    }
  };

  // 웹소켓 메시지 처리
  const handleWebSocketMessage = (data) => {
    switch(data.type) {
      case 'chat_message':
        // 새 메시지 추가
        if (data.message.sender_id !== localStorage.getItem('username')) {
          const newMessage = {
            id: data.message.id,
            sender: data.message.sender_id,
            text: data.message.content,
            isMe: false
          };
          
          setThreads(prev => {
            const conversationId = selectedChat?.id;
            if (!conversationId) return prev;
            const old = prev[conversationId] || [];
            return { ...prev, [conversationId]: [...old, newMessage] };
          });
        }
        break;
        
      case 'typing_status':
        // 타이핑 상태 표시
        const currentUsername = localStorage.getItem('username');
        if (data.user_id !== currentUsername) {
          setIsTyping(data.is_typing);
          setTypingUser(data.user_id);
        }
        break;
    }
  };

  // HTTP 폴링으로 새 메시지 확인
  const startMessagePolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    pollingIntervalRef.current = setInterval(async () => {
      if (selectedChat && !isConnected) {
        await loadMessages(selectedChat.id);
      }
    }, 3000);
  };

  // 폴링 중지
  const stopMessagePolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

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
    // 기존 웹소켓 연결 종료
    if (wsRef.current) {
      wsRef.current.close();
    }
    stopMessagePolling();
    
    setSelectedChat(chat);
    
    // 메시지 로드
    if (!threads[chat.id]) {
      loadMessages(chat.id);
    }
    
    // 웹소켓 연결 시도
    connectWebSocket(chat.id);
    
    // 웹소켓 연결이 안되면 폴링 시작
    setTimeout(() => {
      if (!isConnected) {
        startMessagePolling();
      }
    }, 2000);
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

  // 메시지가 변경될 때마다 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      stopMessagePolling();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // 메시지 전송
  const handleSend = async () => {
    if (!selectedChat || !input.trim()) return;
    const conversationId = selectedChat.id;
    const text = input.trim();
    const currentUsername = localStorage.getItem('username');

    setInput('');
    
    // 타이핑 상태 중지
    sendTypingStatus(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // 웹소켓이 연결되어 있으면 웹소켓으로 전송
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chat_message',
        sender_id: currentUsername,
        content: text,
        message_type: 'text'
      }));
      
      // 내 메시지를 즉시 UI에 추가
      const tempMessage = {
        id: Date.now(),
        sender: currentUsername,
        text: text,
        isMe: true
      };
      
      setThreads(prev => {
        const old = prev[conversationId] || [];
        return { ...prev, [conversationId]: [...old, tempMessage] };
      });
      return;
    }

    // 웹소켓이 없으면 HTTP API로 전송
    try {
      const response = await chatApi.post(`/conversations/${conversationId}/messages/send/`, {
        sender_id: currentUsername,
        content: text,
        message_type: 'text'
      });
      
      // 전송된 메시지를 직접 threads에 추가
      const newMessage = {
        id: response.data.id,
        sender: response.data.sender_id,
        text: response.data.content,
        isMe: response.data.sender_id === currentUsername
      };
      
      setThreads(prev => {
        const old = prev[conversationId] || [];
        return { ...prev, [conversationId]: [...old, newMessage] };
      });
      
      // 채팅 목록의 마지막 메시지 날짜 업데이트
      setChatList(prev =>
        prev.map(c => (c.id === conversationId ? { 
          ...c, 
          lastMessageDate: new Date().toLocaleDateString('ko-KR')
        } : c))
      );
    } catch (error) {
      console.error('메시지 전송 실패:', error);
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
          <div className="chat-content-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{selectedChat?.name || '채팅'}</span>
            <span style={{ 
              fontSize: '12px', 
              padding: '4px 8px', 
              borderRadius: '10px',
              backgroundColor: isConnected ? '#28a745' : '#dc3545',
              color: 'white'
            }}>
              {isConnected ? '실시간' : 'HTTP 모드'}
            </span>
          </div>

          <div className="chat-messages">
            {currentMessages.map(message => (
              <div key={message.id} className={`message ${message.isMe ? 'my-message' : ''}`}>
                {!message.isMe && <div className="chat-avatar-small"></div>}
                <div className="message-bubble">{message.text}</div>
                {message.isMe && <div className="chat-avatar-small"></div>}
              </div>
            ))}
            {isTyping && (
              <div className="typing-indicator" style={{ 
                padding: '10px', 
                fontStyle: 'italic', 
                color: '#666',
                fontSize: '14px'
              }}>
                {typingUser}님이 입력 중입니다...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              placeholder="내용을 입력하세요"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            <button onClick={handleSend}>전송</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChattingPage;
