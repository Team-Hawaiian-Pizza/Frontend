import React, { useEffect, useState } from "react";
import BusinessCard from "./BusinessCard.jsx";
import api from "../api/axios.js"; // ← 경로 주의 (BusinessCard 폴더 기준)

/** 유틸 */
const genderToMF = (g) => (g === "male" ? "M" : g === "female" ? "F" : "");
const ageBandToDisplay = (band) => {
  const m = /^(\d+)s$/.exec(band || "");
  return m ? `${m[1]}대` : "";
};
const makeAddress = (prov, city) => [prov, city].filter(Boolean).join(" ");

/** 태그 정규화: 배열/문자열/이중 인코딩/객체 배열 모두 처리 */
// ✅ 어떤 구조든(#포함/JSON문자열/배열중첩/객체배열) 깨끗한 태그 배열로
const normalizeTags = (raw) => {
  const tryJSON = (s) => { try { return JSON.parse(s); } catch { return null; } };

  const explode = (val) => {
    if (val == null) return [];

    // 배열이면 각 요소를 재귀적으로 펼치기
    if (Array.isArray(val)) return val.flatMap(explode);

    // 객체면 대표 키(name/tag/value) 추출해서 다시 처리
    if (typeof val === "object") {
      return explode(val.name ?? val.tag ?? val.value ?? "");
    }

    // 문자열 처리
    let s = String(val).trim();

    // 양끝 따옴표 제거
    if (
      (s.startsWith('"') && s.endsWith('"')) ||
      (s.startsWith("'") && s.endsWith("'"))
    ) {
      s = s.slice(1, -1);
    }

    // JSON 배열 문자열이면 파싱 후 재귀적으로 펼치기
    const parsedJSON =
      tryJSON(s) ||
      tryJSON(s.replace(/'/g, '"')) ||
      tryJSON(s.replace(/\\"/g, '"'));
    if (Array.isArray(parsedJSON)) return parsedJSON.flatMap(explode);

    // JSON 아니면 콤마 우선 분리, 없으면 공백 분리
    if (s.includes(",")) return s.split(",").map((x) => x.trim()).flatMap(explode);
    return s.split(/\s+/).map((x) => x.trim());
  };

  // 펼치고, 앞의 # 제거, 공백 제거, 중복 제거
  const flat = explode(raw)
    .map((t) => String(t).replace(/^#/, "").trim())
    .filter(Boolean);

  return Array.from(new Set(flat));
};

export default function SmartBusinessCard({ userId, className = "" }) {
  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const viewerId = String(localStorage.getItem("user_id") || "");
        const ownerId = String(userId || viewerId);
        if (!ownerId) throw new Error("user_id가 없습니다.");

        let u = {};
        const isSelf = ownerId === viewerId;

        // 내 카드면 /users/me, 타인이면 /users/profiles/:id
        if (isSelf) {
          const me = await api.get("/users/me");
          u = me?.data ?? {};
        } else {
          const prof = await api.get(`/users/profiles/${ownerId}`);
          u = prof?.data ?? {};
        }

        // 전화/이메일(내 카드면 원본, 타인은 서버 응답 그대로)
        const phone = u.phone ?? u.phone_number ?? u.masked_phone ?? "";
        const email = u.email ?? u.masked_email ?? "";

        // 여러 키 대응 + 강력 정규화
        const rawTags =
          u.tags ??
          u.tag_list ??
          u.user_tags ??
          u.keywords ??
          u.categories ??
          u.skills;
        const tags = normalizeTags(rawTags);

        const approved = isSelf || u.connection_status === "CONNECTED";

        setCard({
          profileImage: u.avatar_url || "",
          name: u.name || (isSelf ? "내 명함" : `사용자${u.id ?? ""}`),
          sex: genderToMF(u.gender),
          age: ageBandToDisplay(u.age_band),
          tags,
          phone: phone || (isSelf ? "전화번호 없음" : "010-****-****"),
          email: email || (isSelf ? "이메일 없음" : "g***@***.com"),
          address: makeAddress(u.province_name, u.city_name),
          approved,
        });

        // 디버깅 로그 (원하면 주석 처리)
        console.log("[SmartCard] src rawTags:", rawTags, "→ tags:", tags);
      } catch (e) {
        console.error("명함 로드 실패:", e);
        setCard({
          profileImage: "",
          name: "사용자",
          sex: "",
          age: "",
          tags: [],
          phone: "전화번호 없음",
          email: "이메일 없음",
          address: "",
          approved: false,
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId]);

  if (loading) {
    return (
      <div className={`card-container ${className}`} style={{ opacity: 0.7 }}>
        <div className="card-header">
          <div className="profile-img"><div className="placeholder">…</div></div>
          <div className="profile-info">
            <div className="name">로딩 중…</div>
            <div className="sub-info">–</div>
          </div>
          <div className="right-side"><div className="tag">#…</div></div>
        </div>
        <hr className="divider" />
        <div className="contact">
          <div className="row"><span className="label">M</span><span>–</span></div>
          <div className="row"><span className="label">E</span><span>–</span></div>
          <div className="row"><span className="label">H</span><span>–</span></div>
        </div>
        <div className="logo">GNGN</div>
      </div>
    );
  }

  return <BusinessCard {...card} />;
}
