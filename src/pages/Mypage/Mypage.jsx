import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyPage.css";

function MyPage() {
  const navigate = useNavigate();

  // (임시) 사용자 프로필 – API 붙이면 여기 대체
  const [profile, setProfile] = useState({
    name: "김인하",
    temperature: 76.3, // 0~100 float
    avatarUrl: "",     // 추후 이미지 경로 있으면 표시
  });

  // (임시) 도장판 더미 데이터 2개
  const [stampBoards, setStampBoards] = useState([
    { id: 1, title: "빵집" },
    { id: 2, title: "에어컨" },
    { id: 3, title: "빵집" },
    { id: 4, title: "에어컨" },
    { id: 5, title: "빵집" },
    { id: 6, title: "에어컨" },
  ]);

  // ✅ API 연결 포인트 (완성되면 주석 해제해서 사용)
  // useEffect(() => {
  //   (async () => {
  //     try {
  //       // 1) 내 정보 조회
  //       const meRes = await fetch("/api/me", { credentials: "include" });
  //       const me = await meRes.json();
  //       setProfile({
  //         name: me.name,
  //         temperature: me.mannerTemperature, // 0~100
  //         avatarUrl: me.avatarUrl,
  //       });
  //
  //       // 2) 내 도장판 목록 조회
  //       const stampRes = await fetch("/api/stamps/me", { credentials: "include" });
  //       const stampList = await stampRes.json();
  //       setStampBoards(stampList); // [{id, title, ...}]
  //     } catch (e) {
  //       console.error(e);
  //     }
  //   })();
  // }, []);

  const clampedTemp = Math.max(0, Math.min(100, Number(profile.temperature) || 0));
  const handleEditCard = () => navigate("/card/edit");
  const handleCoupon = () => navigate("/coupon");
  const handleOpenStamp = (id) => navigate(`/stamp/${id}`);

  return (
    <main className="mp-main" aria-label="My Page">
      <div className="mp-card">
        {/* 상단 프로필 */}
        <section className="mp-profile">
          <div className="mp-avatar" aria-hidden>
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={`${profile.name} 프로필`} />
            ) : (
              <div className="mp-avatar-placeholder" />
            )}
          </div>

          <div className="mp-profile-meta">
            <div className="mp-name-row">
              <h2 className="mp-name">{profile.name}</h2>
              <button type="button" className="mp-btn mp-btn-primary" onClick={handleEditCard}>
                명함 수정
              </button>
            </div>

            <div className="mp-thermo-wrap">
              <div className="mp-thermo-label">매너온도</div>
              <div
                className="mp-thermo"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={clampedTemp}
                aria-label="매너온도"
                title={`매너온도 ${clampedTemp.toFixed(1)}`}
              >
                <div className="mp-thermo-fill" style={{ width: `${clampedTemp}%` }} />
              </div>
              <div className="mp-thermo-scale">
                <span>0</span>
                <span>100°c</span>
              </div>
            </div>
          </div>
        </section>

        {/* 도장판 섹션 */}
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
                <button
                  type="button"
                  className="mp-btn mp-btn-light"
                  onClick={() => handleOpenStamp(s.id)}
                >
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
