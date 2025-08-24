// src/pages/MyPage/MyPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyPage.css";
import BusinessCard from "../../components/BusinessCard";
import SmartBusinessCard from "../../components/SmartBusinessCard.jsx";
import api from "../../api/axios.js";

// 유틸
const genderToMF = (g) => (g === "male" ? "M" : g === "female" ? "F" : "");
const ageBandToAge = (band) => {
  const m = /^(\d+)s$/.exec(band || "");
  return m ? Number(m[1]) : "";
};
const makeAddress = (prov, city) => [prov, city].filter(Boolean).join(" ");

export default function MyPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState(null);
  const [friends, setFriends] = useState([]);
  const [stampBoards, setStampBoards] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userId = localStorage.getItem("user_id");

        const [profileRes, allUsersRes, stampsRes] = await Promise.all([
          api.get(`/users/profiles/${userId}`),
          api.get("/users/all"),
          api.get("/rewards/brands"),
        ]);

        const u = profileRes?.data ?? {};
        setProfile({
          name: u.name ?? "",
          sex: genderToMF(u.gender),
          age: ageBandToAge(u.age_band), // 숫자(20)
          avatarUrl: u.avatar_url || "",
          phone: u.masked_phone || "010-0000-0000",
          email: u.masked_email || "",
          address: makeAddress(u.province_name, u.city_name),
          tag: "React", // TODO: 서버 필드 확정되면 교체
          temperature: Number(u.manner_temperature ?? 75),
        });

        const currentUserId = Number(userId);
        const allUsers = allUsersRes?.data?.results ?? [];
        const others = Array.isArray(allUsers)
          ? allUsers.filter((x) => x?.id !== currentUserId)
          : [];
        setFriends(others.slice(0, 10));

        const brands = Array.isArray(stampsRes?.data) ? stampsRes.data : [];
        setStampBoards(brands);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
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

  const clampedTemp = profile
    ? Math.max(0, Math.min(100, Number(profile.temperature) || 0))
    : 0;

  if (loading || !profile) {
    return (
      <main className="mp-main">
        <div className="mp-card" style={{ padding: 16 }}>불러오는 중…</div>
      </main>
    );
  }

  return (
    <main className="mp-main" aria-label="My Page">
      <div className="mp-card">
        {/* ===== 상단: 좌 명함 / 우 매너온도+친구 ===== */}
        <section className="mp-profile-stack">
          {/* 좌측 : 명함 */}
          <div className="mp-left-col">
            <div className="card-wrap">
              <SmartBusinessCard
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

            {/* 친구목록 */}
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
                    onClick={() => handleChat(f.id)}
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
                      <div className="mp-friend-name">{f.name || f.username || `user#${f.id}`}</div>
                      <div className="mp-friend-msg">{f.intro || f.lastMsg || "안녕하세요!"}</div>
                    </div>
                  </button>
                ))
              ) : (
                <div style={{ padding: 20, textAlign: "center", color: "#666" }}>친구가 없습니다</div>
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
            {stampBoards.length > 0 ? (
              stampBoards.map((s) => (
                <article key={s.id} className="mp-stamp-card">
                  <div className="mp-stamp-thumb" aria-hidden />
                  <div className="mp-stamp-title">{s.name || s.title}</div>
                  {s.benefit ? (
                    <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>{s.benefit}</div>
                  ) : null}
                  <button type="button" className="mp-btn mp-btn-light" onClick={() => handleOpenStamp(s.id)}>
                    도장판 보기
                  </button>
                </article>
              ))
            ) : (
              <div style={{ padding: 20, textAlign: "center", color: "#666" }}>등록된 브랜드가 없습니다</div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
