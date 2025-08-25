// src/pages/MyPage/MyPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyPage.css";
import SmartBusinessCard from "../../components/SmartBusinessCard.jsx";
import api from "../../api/axios.js";
 import { useLocation } from "react-router-dom";

export default function MyPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [friends, setFriends] = useState([]);
  const [stampBoards, setStampBoards] = useState([]);

 useEffect(() => {
   let alive = true;
   const loadData = async () => {
     try {
       const userId = localStorage.getItem("user_id");       // ✅ 본인 정보는 /users/me 로딩 (마스킹/캐시 이슈 방지)
        const [meRes, allUsersRes, stampsRes] = await Promise.all([
         api.get(`/users/me`, { params: { ts: Date.now() } }), // 캐시 방지
         api.get("/users/all",   { params: { ts: Date.now() } }),
         api.get("/rewards/stamps/all", { params: { ts: Date.now() } }),
       ]);
       if (!alive) return;

       const u = meRes?.data ?? {};
       setProfile({
         name: u.name ?? "",
         sex: u.gender === "male" ? "M" : u.gender === "female" ? "F" : "",
         age: u.age_band?.replace("s", "대") ?? "",
         avatarUrl: u.avatar_url || "",
         phone: u.phone || u.masked_phone || "",
         email: u.email || u.masked_email || "",
         address: [u.province_name, u.city_name].filter(Boolean).join(" "),
         tag: "", // SmartBusinessCard가 실제 태그 보여줌
         temperature: Number(u.manner_temperature ?? 75),
       });

       const currentUserId = Number(userId);
       const allUsers = allUsersRes?.data?.results ?? [];
       const others = Array.isArray(allUsers) ? allUsers.filter(x => x?.id !== currentUserId) : [];
       setFriends(others.slice(0, 10));

       // 스탬프 보드 (원하면 기존 brands API로 유지)
       const stampAll = (stampsRes?.data?.data ?? []);
       setStampBoards(stampAll);
     } catch (e) {
       console.error("마이페이지 로드 실패:", e);
     } finally {
       if (alive) setLoading(false);
     }
   };
   loadData();

   // ✅ 탭을 벗겼다 돌아오면 갱신
   const onVis = () => { if (document.visibilityState === "visible") loadData(); };
   document.addEventListener("visibilitychange", onVis);
   return () => { alive = false; document.removeEventListener("visibilitychange", onVis); };
 // ✅ location.state?.refresh 가 바뀌면 재요청
 }, [location.state?.refresh]);

  const handleEditCard = () => navigate("/card/edit");
  const handleCoupon = () => navigate("/coupon");
  const handleOpenStamp = (brandId) => navigate(`/stamp/${brandId}`);
  const handleProfileClick = (id) => navigate(`/profile/${id}`);

  if (loading) {
    return (
      <main className="mp-main">
        <div className="mp-card" style={{ padding: 16 }}>불러오는 중…</div>
      </main>
    );
  }

  return (
    <main className="mp-main" aria-label="My Page">
      <div className="mp-card">
        {/* ===== 상단: 명함 ===== */}
        <section className="mp-profile-stack">
          <div className="mp-left-col">
            <div className="card-wrap">
              <SmartBusinessCard />
            </div>
            <div className="mp-profile-actions">
              <button
                type="button"
                className="mp-btn mp-btn-primary"
                onClick={handleEditCard}
              >
                명함 수정
              </button>
            </div>
          </div>

          {/* 친구목록 */}
          <div className="mp-right-col">
            <div className="mp-friends-header">
              친구목록 : <strong>{friends.length}</strong>
            </div>
            <div className="mp-friends" role="list">
              {friends.length > 0 ? (
                friends.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className="mp-friend-row"
                    onClick={() => handleProfileClick(f.id)}
                    role="listitem"
                  >
                    <div className="mp-friend-avatar">
                      {f.avatar_url ? (
                        <img src={f.avatar_url} alt={`${f.name || f.username} 프로필`} />
                      ) : (
                        <div className="mp-friend-ph" />
                      )}
                    </div>
                    <div className="mp-friend-meta">
                      <div className="mp-friend-name">{f.name || f.username}</div>
                      <div className="mp-friend-msg">{f.intro || "안녕하세요!"}</div>
                    </div>
                  </button>
                ))
              ) : (
                <div style={{ padding: 20, textAlign: "center", color: "#666" }}>
                  친구가 없습니다
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ===== 스탬프판 ===== */}
        <section className="mp-stamps">
          <div className="mp-sec-header">
            <h3 className="mp-sec-title">내 스탬프판</h3>
            <button type="button" className="mp-btn mp-btn-ghost" onClick={handleCoupon}>
              쿠폰함
            </button>
          </div>

          <div className="mp-stamp-grid">
            {stampBoards.length > 0 ? (
              stampBoards.map((s) => (
                <article key={s.brand_id} className="mp-stamp-card">
                  <div className="mp-stamp-thumb" aria-hidden>
                    {s.brand_image ? (
                      <img
                        src={s.brand_image}
                        alt={s.brand_name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : null}
                  </div>
                  <div className="mp-stamp-title">{s.brand_name}</div>
                  <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
                    {s.filled} / {s.total} 스탬프
                  </div>
                  <button
                    type="button"
                    className="mp-btn mp-btn-light"
                    onClick={() => handleOpenStamp(s.brand_id)}
                  >
                    도장판 보기
                  </button>
                </article>
              ))
            ) : (
              <div style={{ padding: 20, textAlign: "center", color: "#666" }}>
                스탬프판이 없습니다
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
