import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MyPage.css";
import BusinessCard from "../../components/BusinessCard";
import api from "../../api/axios";
// 만약 로고를 카드에 넣고 싶다면 아래처럼 프로젝트 경로로 가져오세요
// import gngnLogo from "@/assets/gngnLogo.png";

function MyPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState(null);
  const [friends, setFriends] = useState([]);
  const [stampBoards, setStampBoards] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        const [profileRes, allUsersRes, stampsRes] = await Promise.all([
          api.get(`/users/profiles/${userId}`),
          api.get('/users/all'),
          api.get('/rewards/brands')
        ]);
        
        // 실제 백엔드 데이터로 설정
        setProfile({
          name: profileRes.data.name,
          sex: profileRes.data.gender === 'male' ? 'M' : 'F',
          age: profileRes.data.age_band,
          avatarUrl: profileRes.data.avatar_url || "",
          phone: profileRes.data.masked_phone || "010-0000-0000",
          email: profileRes.data.masked_email,
          address: `${profileRes.data.province_name} ${profileRes.data.city_name}`,
          tag: "React",
          temperature: 75, // 기본값 (백엔드에서 manner_temperature가 없음)
        });
        
        // 로그인한 사용자 제외하고 다른 사용자들을 친구목록처럼 표시
        const currentUserId = parseInt(localStorage.getItem('user_id'));
        const otherUsers = allUsersRes.data.results.filter(user => user.id !== currentUserId);
        setFriends(otherUsers.slice(0, 10) || []);
        setStampBoards(stampsRes.data || []);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        // 실패 시 기본값 유지
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleEditCard = () => navigate("/card/edit");
  const handleCoupon = () => navigate("/coupon");
  const handleOpenStamp = (id) => navigate(`/stamp/${id}`);
  const handleChat = (id) => navigate(`/chat/${id}`);

  const clampedTemp = profile ? Math.max(0, Math.min(100, Number(profile.temperature) || 0)) : 0;

  if (loading || !profile) {
    return <div style={{ padding: 20 }}>로딩 중...</div>;
  }

  return (
    <main className="mp-main" aria-label="My Page">
      <div className="mp-card">
        {/* ===== 상단: 좌 명함 / 우 매너온도+친구 ===== */}
        <section className="mp-profile-stack">
          {/* 좌측 : 명함 */}
          <div className="mp-left-col">
            <div className="card-wrap">
              <BusinessCard
                profileImage={profile.avatarUrl}
                name={profile.name}
                sex={profile.sex}
                age={profile.age}
                tag={profile.tag}
                phone={profile.phone}
                email={profile.email}
                address={profile.address}
                approved={true}
                // logoSrc={gngnLogo}   // ← 프로젝트에 로고를 두고 사용하려면 주석 해제
              />
            </div>
            <div className="mp-profile-actions">
              <button type="button" className="mp-btn mp-btn-primary" onClick={handleEditCard}>
                명함 수정
              </button>
            </div>
          </div>

          {/* 우측 : 매너온도 + 친구목록 */}
          <div className="mp-right-col">
            {/* 매너온도 */}
            <div className="mp-thermo-wrap">
              <div className="mp-thermo-label">매너온도</div>
              <div className="mp-thermo" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={clampedTemp}>
                <div className="mp-thermo-fill" style={{ width: `${clampedTemp}%` }} />
              </div>
              <div className="mp-thermo-scale">
                <span>0</span>
                <span>100°c</span>
              </div>
            </div>

            {/* ✅ 친구목록 헤더 + 인원수 */}
            <div className="mp-friends-header">
              친구목록 : <strong>{Array.isArray(friends) ? friends.length : 0}</strong>
            </div>

            {/* 스크롤 가능한 친구목록 */}
            <div className="mp-friends" role="list">
              {Array.isArray(friends) && friends.length > 0 ? friends.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className="mp-friend-row"
                  onClick={() => handleChat(f.id)}
                  role="listitem"
                >
                  <div className="mp-friend-avatar">
                    {f.avatar_url ? <img src={f.avatar_url} alt={`${f.name} 프로필`} /> : <div className="mp-friend-ph" />}
                  </div>
                  <div className="mp-friend-meta">
                    <div className="mp-friend-name">{f.name || f.username}</div>
                    <div className="mp-friend-msg">{f.intro || f.lastMsg || "안녕하세요!"}</div>
                  </div>
                </button>
              )) : (
                <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
                  친구가 없습니다
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ===== 도장판 ===== */}
        <section className="mp-stamps">
          <div className="mp-sec-header">
            <h3 className="mp-sec-title">소개 도장판</h3>
            <button type="button" className="mp-btn mp-btn-ghost" onClick={handleCoupon}>
              쿠폰함
            </button>
          </div>

          <div className="mp-stamp-grid">
            {Array.isArray(stampBoards) && stampBoards.length > 0 ? stampBoards.map((s) => (
              <article key={s.id} className="mp-stamp-card">
                <div className="mp-stamp-thumb" aria-hidden />
                <div className="mp-stamp-title">{s.name || s.title}</div>
                <div style={{fontSize: '12px', color: '#666', marginBottom: '8px'}}>{s.benefit}</div>
                <button type="button" className="mp-btn mp-btn-light" onClick={() => handleOpenStamp(s.id)}>
                  도장판 보기
                </button>
              </article>
            )) : (
              <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
                등록된 브랜드가 없습니다
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default MyPage;
