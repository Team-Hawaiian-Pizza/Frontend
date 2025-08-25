import React, { useState, useEffect, useCallback } from 'react';
import { getMyCode, getRequests, enterFriendCode, acceptRequest, rejectRequest } from '../../api';
import './Connections.css';

const getMyUserId = () =>
  localStorage.getItem('user_id') || localStorage.getItem('userId');

const ConnectionsPage = () => {
  const [addCode, setAddCode] = useState('');
  const [myCode, setMyCode] = useState(null);
  const [myCodeError, setMyCodeError] = useState(null);
  const [myCodeLoading, setMyCodeLoading] = useState(true);

  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState(null);

  const fetchData = useCallback(async () => {
    const userId = getMyUserId();

    try {
      setMyCodeLoading(true);
      const response = await getMyCode();
      const data = response.data;
      setMyCode(data?.code ?? '');
    } catch (err) {
      console.error('내 코드 불러오기 실패:', err);
      setMyCodeError('내 코드를 불러오는 데 실패했습니다.');
    } finally {
      setMyCodeLoading(false);
    }

    // 2) 받은 요청 목록
     try {
     setRequestsLoading(true);
      const res = await getRequests();
      const arr =
        Array.isArray(res?.data?.data) ? res.data.data
        : Array.isArray(res?.data?.results) ? res.data.results
        : Array.isArray(res?.data) ? res.data
        : [];
      setRequests(arr);
    } catch (err) {
      console.error('요청 목록 조회 실패:', err);
      setRequestsError('요청 목록을 불러오는 데 실패했습니다.');
      setRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!addCode.trim()) {
      alert('코드를 입력해주세요.');
      return;
    }

    try {
      await enterFriendCode(addCode);
      alert('친구 추가 요청을 성공적으로 보냈습니다.');
    } catch (err) {
      console.error('친구 추가 실패:', err);
      const errorMsg = err.response?.data?.detail || '친구 추가 요청에 실패했습니다. 코드를 다시 확인해주세요.';
      alert(errorMsg);
    } finally {
      setAddCode('');
    }
  };

  const handleCopyCode = () => {
    if (!myCode) return;
    navigator.clipboard
      .writeText(myCode)
      .then(() => alert('코드가 복사되었습니다.'))
      .catch((err) => console.error('클립보드 복사 실패:', err));
  };

  const handleAccept = async (requestID) => {
    try {
      await acceptRequest(requestID);

      setRequests(currentRequests =>
        currentRequests.filter(req => req.id !==requestID)
      );
      alert('요청을 수락했습니다.');
    } catch (err) {
      console.error('요청 수락 실패:', err);
      alert('요청 처리에 실패했습니다.');
    }
  };

  const handleReject = async (requestID) => {
    try {
      await rejectRequest(requestID);
      setRequests(currentRequests =>
        currentRequests.filter(req => req.id !== requestID)
      );
      alert('요청을 거절했습니다.');
    } catch (err) {
      console.error('요청 거절 실패:', err);
      alert('요청 처리에 실패했습니다.');
    }
  };


  return (
    <div className="connections-page">
      <div className="connections-container">
        <div className="connections-left">
          <div className="connections-section">
            <h3>코드로 친구 추가하기</h3>
            <form onSubmit={handleAddFriend} className="add-friend-form">
              <input
                type="text"
                value={addCode}
                onChange={(e) => setAddCode(e.target.value)}
                placeholder="친구의 코드를 입력하시오"
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
            {myCodeLoading && <p>내 코드를 불러오는 중…</p>}
            {myCodeError && <p>{myCodeError}</p>}
          </div>
        </div>

        <div className="connections-right">
          <div className="connections-section">
            <h3>친구 추가 요청함</h3>
            <div className="request-list">
              {requestsLoading ? (
                <p>요청 목록을 불러오는 중...</p>
              ) : requestsError ? (
                <p>{requestsError}</p>
              ) : requests.length === 0 ? (
                <p>받은 요청이 없습니다.</p>
              ) : (
                requests.map((request) => (
                  <div key={request.id} className="request-item">
                    <div className="avatar-small"></div>
                    <div className="request-info">
                      <div className="request-name">
                        {request?.from_user?.name || '이름 비공개'}
                      </div>
                      <div className="request-introducer">
                        {request?.created_at
                          ? `요청일: ${String(request.created_at).slice(0, 10)}`
                          : ''}
                      </div>
                    </div>

                    <div className='request-actions'>
                          <button
                            onClick={ () => handleAccept(request.id)}
                            className='action-btn accept'
                          >
                            수락
                          </button>
                          <button
                            onClick={()=>handleReject(request.id)}
                            className='action-btn reject'
                          >
                            거절
                          </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionsPage;