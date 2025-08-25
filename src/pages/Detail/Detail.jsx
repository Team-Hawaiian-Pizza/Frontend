import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserProfile,getMyConversations, createConversation } from '../../api';
import api from '../../api/axios';
import './Detail.css';

const DetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false); // 후기 로딩 상태
  const [loading, setLoading] = useState(true);                // 프로필 로딩 상태
  const [error, setError] = useState(null);
  const [mannerTemp, setMannerTemp] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const {data} = await getUserProfile(id);
        if (!alive) return;

        setProfile(data);
        setMannerTemp(
          typeof data?.manner_temperature === 'number'
            ? data.manner_temperature
            : Number(data?.manner_temperature) || 0
        );

        // 후기: 프로필 응답에 있으면 사용, 없으면 보조 API 호출
        if (Array.isArray(data?.reviews)) {
          setReviews(data.reviews);
        } else {
          setReviewsLoading(true);
          try {
            const res = await api.get(`/users/profiles/${id}/reviews`);
            const arr = Array.isArray(res?.data?.results)
              ? res.data.results
              : (Array.isArray(res?.data) ? res.data : []);
            if (alive) setReviews(arr);
          } catch {
            if (alive) setReviews([]); // 없거나 에러면 빈 배열
          } finally {
            if (alive) setReviewsLoading(false);
          }
        }
      } catch (e) {
        console.error('3. API 실패! 발생한 에러:', e.response || e.message || e);
        setError('명함 정보를 불러오지 못했습니다.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  if (loading) return <div className="detail-page-status">불러오는 중…</div>;
  if (error)   return <div className="detail-page-status">{error}</div>;
  if (!profile) return <div className="detail-page-not-found">명함을 찾을 수 없습니다.</div>;

  // 서버 응답에서 필드 매핑
  const name =  profile.name || '이름 비공개';
  const avatar = profile.avatar_url || '/default_image.png';
  const address = [profile.province_name, profile.city_name].filter(Boolean).join(' ');
  const connection = profile.connection_status; // 'CONNECTED' | 'NONE' | 'PENDING'

  // 연락처: 본인일 때만 email/phone이 온다고 가정. 없으면 masked_* 사용
  const displayEmail = profile.email ?? profile.masked_email ?? '이메일 비공개';
  const displayPhone = profile.phone ?? profile.masked_phone ?? '전화번호 비공개';

  // 블러 여부: 연결 안된 타인이면 블러
  const shouldBlur = !profile.email && !profile.phone;

  const handleChat = async () => {
    if (!profile) return;

    // profile 객체에 name이 있는지 확인
    const otherUsername = profile.name;
    if (!otherUsername) {
      alert('상대방의 사용자 정보(name)가 없어 채팅을 시작할 수 없습니다.');
      console.error('프로필 객체에 name 필드가 없습니다:', profile);
      return;
    }

    const myUsername = localStorage.getItem('username');

    try {
      // 모든 채팅 목록을 불러옵니다.
      const response = await getMyConversations();
      const conversations = response.data;

      // 상대방과 이미 진행 중인 채팅방이 있는지 찾습니다.
      const existingChat = conversations.find(conv => 
        (conv.participant1_id === myUsername && conv.participant2_id === otherUsername) ||
        (conv.participant1_id === otherUsername && conv.participant2_id === myUsername)
      );

      //채팅방이 있으면, 거기로 이동합니다.
      if (existingChat) {
        console.log('기존 채팅방으로 이동:', existingChat.id);
        navigate(`/chat/${existingChat.id}`);
      } 
      //채팅방이 없으면, 새로 생성하고 이동합니다.
      else {
        console.log('새로운 채팅방 생성 시도...');
        const newConversationResponse = await createConversation(otherUsername);
        const newConversation = newConversationResponse.data;
        console.log('새로운 채팅방 생성 완료:', newConversation.id);
        navigate(`/chat/${newConversation.id}`);
      }

    } catch (error) {
      console.error('채팅방 이동/생성 실패:', error);
      alert('채팅방을 만들거나 들어가는 데 실패했습니다.');
    }
  };

  const handleCodeRequest = () => {
    console.log(`${name}에게 코드 요청을 보냈습니다.`);
    alert(`${name}님에게 코드 요청을 보냈습니다.`);
  };

  return (
    <div className="detail-page">
      <div className="detail-container">
        {/* 왼쪽: 명함 */}
        <div className="detail-left">
          <div className="detail-card">
            <div className="detail-avatar">
              <img src={avatar} alt={name} />
            </div>
            <div className="detail-name">{name}</div>

            <div className={`detail-info ${shouldBlur ? 'blurred' : ''}`}>
              <span>{displayPhone}</span>
              <span>{displayEmail}</span>
              <span>{address || '주소 비공개'}</span>
            </div>
          </div>

          <div className="detail-buttons">
            <button className="detail-button" onClick={handleChat}>1대1 채팅하기</button>
            <button className="detail-button" onClick={handleCodeRequest}>
              {connection === 'PENDING' ? '요청 대기중' : '친구 요청'}
            </button>
          </div>
        </div>

        {/* 오른쪽: 추가 정보 */}
        <div className="detail-right">
          {/* 추가 설명: intro + tags */}
          <div className="detail-section">
            <h3>추가 설명</h3>
            <p>{profile.intro || '소개가 없습니다.'}</p>

            {Array.isArray(profile.tags) && profile.tags.length > 0 && (
              <div className="tag-list">
                {profile.tags.map((t, i) => (
                  <span key={i} className="tag-chip">#{t}</span>
                ))}
              </div>
            )}
          </div>

          {/* 후기: 텍스트만 표시 (별 아이콘 없음) */}
          <div className="detail-section">
            <h3>후기</h3>
            {reviewsLoading ? (
              <p>후기를 불러오는 중…</p>
            ) : reviews.length === 0 ? (
              <p>아직 등록된 후기가 없습니다.</p>
            ) : (
              <ul className="review-list">
                {reviews.map((r, idx) => {
                  const rating = r.rating ?? r.score;
                  return (
                    <li key={r.id ?? `${idx}-${r.author_name ?? 'anon'}`} className="review-item">
                      <div className="review-head">
                        <strong className="review-author">{r.author_name ?? '익명'}</strong>
                        {typeof rating !== 'undefined' && (
                          <span className="review-rating" style={{ marginLeft: 8 }}>
                            평점 {Number(rating)}
                          </span>
                        )}
                        {r.created_at && (
                          <span className="review-date" style={{ marginLeft: 8 }}>
                            {String(r.created_at).slice(0, 10)}
                          </span>
                        )}
                      </div>
                      <p className="review-body">{r.content ?? r.comment ?? ''}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* 매너 온도 */}
          <div className="detail-section">
            <h3>매너 온도</h3>
            <div className="detail-manner">
              <div
                className="manner-bar-container"
                style={{ width: 200, height: 10, background: '#eee', borderRadius: 999, overflow: 'hidden' }}
              >
                <div
                  className="manner-bar"
                  style={{
                    width: `${Number(mannerTemp ?? 0)}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #86b6ff 0%, #286ef0 100%)',
                    borderRadius: 999,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <span style={{ marginLeft: 8 }}>{Number(mannerTemp ?? 0)}℃</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPage;