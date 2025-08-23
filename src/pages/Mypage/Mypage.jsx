import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyPage.css";
import BusinessCard from "../../components/BusinessCard";
// 만약 로고를 카드에 넣고 싶다면 아래처럼 프로젝트 경로로 가져오세요
// import gngnLogo from "@/assets/gngnLogo.png";

function MyPage() {
  const navigate = useNavigate();

  const [profile] = useState({
    name: "김인하",
    sex: "M",
    age: 23,
    avatarUrl: "",
    phone: "010-1234-5678",
    email: "me@example.com",
    address: "서울시 강남구",
    tag: "React",
    temperature: 76.3,
  });

  const [friends] = useState([
    { id: 1, name: "김두현", avatar: "", lastMsg: "Live Laugh Love - Sasha Alex" },
    { id: 2, name: "쉬수기", avatar: "", lastMsg: "약이와 나의 바다 - 아이유" },
    { id: 3, name: "김영호", avatar: "", lastMsg: "macchine (pure white) - Lupi" },
    { id: 4, name: "김민규", avatar: "", lastMsg: "The Love - Quinn XCII" },
    { id: 5, name: "김민규", avatar: "", lastMsg: "The Love - Quinn XCII" },
    { id: 6, name: "김민규", avatar: "", lastMsg: "The Love - Quinn XCII" },
    { id: 7, name: "김민규", avatar: "", lastMsg: "The Love - Quinn XCII" },
  ]);

  const [stampBoards] = useState([
    { id: 1, title: "빵집" },
    { id: 2, title: "에어컨" },
    { id: 3, title: "빵집" },
    { id: 4, title: "에어컨" },
    { id: 5, title: "빵집" },
    { id: 6, title: "에어컨" },
  ]);

  const handleEditCard = () => navigate("/card/edit");
  const handleCoupon = () => navigate("/coupon");
  const handleOpenStamp = (id) => navigate(`/stamp/${id}`);
  const handleChat = (id) => navigate(`/chat/${id}`);

  const clampedTemp = Math.max(0, Math.min(100, Number(profile.temperature) || 0));

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
              친구목록 : <strong>{friends.length}</strong>
            </div>

            {/* 스크롤 가능한 친구목록 */}
            <div className="mp-friends" role="list">
              {friends.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className="mp-friend-row"
                  onClick={() => handleChat(f.id)}
                  role="listitem"
                >
                  <div className="mp-friend-avatar">
                    {f.avatar ? <img src={f.avatar} alt={`${f.name} 프로필`} /> : <div className="mp-friend-ph" />}
                  </div>
                  <div className="mp-friend-meta">
                    <div className="mp-friend-name">{f.name}</div>
                    <div className="mp-friend-msg">{f.lastMsg ?? ""}</div>
                  </div>
                </button>
              ))}
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
            {stampBoards.map((s) => (
              <article key={s.id} className="mp-stamp-card">
                <div className="mp-stamp-thumb" aria-hidden />
                <div className="mp-stamp-title">{s.title}</div>
                <button type="button" className="mp-btn mp-btn-light" onClick={() => handleOpenStamp(s.id)}>
                  도장판 보기
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default MyPage;
