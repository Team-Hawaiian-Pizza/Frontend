import React, { useState } from 'react';
import './Chatting.css';

// 더미 채팅 데이터
const chatList = [
    { id: 101, name: '인덕이', lastMessageDate: '2025년 8월 3일' },
    { id: 102, name: '홍길동', lastMessageDate: '2025년 8월 2일' },
];

const messages = [
    { id: 1, sender: '인덕이', text: '안녕하세요, 명함 보고 연락드렸습니다.', isMe: false },
    { id: 2, sender: '나', text: '네, 안녕하세요. 어떤 도움이 필요하신가요?', isMe: true },
    { id: 3, sender: '인덕이', text: '혹시 에어컨 필터 청소 비용이 궁금해서요.', isMe: false },
    { id: 4, sender: '나', text: '네, 자세한 내용은 채팅으로 안내해 드릴게요.', isMe: true },
];

const ChattingPage = () => {
    const [selectedChat, setSelectedChat] = useState(chatList[0]);

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
                                className={`chat-item ${selectedChat.id === chat.id ? 'selected' : ''}`}
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
                    <div className="chat-content-header">{selectedChat.name}</div>
                    <div className="chat-messages">
                        {messages.map(message => (
                            <div key={message.id} className={`message ${message.isMe ? 'my-message' : ''}`}>
                                {!message.isMe && <div className="chat-avatar-small"></div>}
                                <div className="message-bubble">{message.text}</div>
                                {message.isMe && <div className="chat-avatar-small"></div>}
                            </div>
                        ))}
                    </div>
                    <div className="chat-input-area">
                        <input type="text" placeholder="내용을 입력하세요" />
                        <button>전송</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChattingPage;