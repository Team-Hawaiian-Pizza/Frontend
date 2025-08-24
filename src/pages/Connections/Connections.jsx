import React, { useState, useEffect } from 'react';
import { getMyCode } from '../../api';
import './Connections.css';

// 더미 데이터
const pendingRequests = [
    { id: 1, name: "인덕이", introducer: "김인하님의 친구" },
    { id: 2, name: "홍길동", introducer: "김인하님의 친구" },
];

const ConnectionsPage = () => {
    const [addCode, setAddCode] = useState('');
    const [myCode, setMyCode] = useState(null);

    useEffect(() => {
        const fetchMyCode = async () => {
            try {
                const data = await getMyCode();
                setMyCode(data.code); // 응답 객체에서 'code' 키의 값을 상태에 저장
            } catch (err) {
                console.error("코드 불러오기 실패:", err);
                setCodeError("내 코드를 불러오는 데 실패했습니다.");
            } finally {
                setCodeLoading(false);
            }
        };

        fetchMyCode();
    }, []); 

    const handleAddFriend = (e) => {
        e.preventDefault();
        console.log(`코드로 친구 추가: ${addCode}`);
        alert(`${addCode} 코드로 친구 추가 요청을 보냈습니다.`);
        setAddCode('');
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(myCode)
            .then(() => {
                alert('코드가 복사되었습니다.');
            })
            .catch(err => {
                console.error('클립보드 복사 실패:', err);
            });
    };

    return (
        <div className="connections-page">
            <div className="connections-container">
                {/* 왼쪽 섹션 */}
                <div className="connections-left">
                    <div className="connections-section">
                        <h3>코드로 친구 추가하기</h3>
                        <form onSubmit={handleAddFriend} className="add-friend-form">
                            <input
                                type="text"
                                value={addCode}
                                onChange={(e) => setAddCode(e.target.value)}
                                placeholder="XXXX-XXXX"
                                className="code-input"
                            />
                            <button type="submit" className="add-button">추가</button>
                        </form>
                    </div>

                    <div className="connections-section my-code-section">
                        <h3>내 코드 번호</h3>
                        <div className="my-code-box">
                            <span className="my-code">{myCode}</span>
                            <button onClick={handleCopyCode} className="copy-button">복사</button>
                        </div>
                    </div>
                </div>

                {/* 오른쪽 섹션 */}
                <div className="connections-right">
                    <div className="connections-section">
                        <h3>코드 요청함</h3>
                        <div className="request-list">
                            {pendingRequests.map(request => (
                                <div key={request.id} className="request-item">
                                    <div className="avatar-small"></div>
                                    <div className="request-info">
                                        <div className="request-name">{request.name}</div>
                                        <div className="request-introducer">{request.introducer}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConnectionsPage;