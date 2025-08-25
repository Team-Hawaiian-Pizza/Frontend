import React from "react";
import "./BusinessCard.css";

/** 방어용 정규화 (추가 방어) */
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


function BusinessCard({
  profileImage,
  name,
  sex,
  age,
  tag,
  tags = [],
  phone,
  email,
  address,
  approved = false,
}) {
  const lockOn = !approved;
  const tagList = normalizeTags(tags.length ? tags : tag ? [tag] : []);

  return (
    <div className="card-container">
      {/* 상단 프로필 섹션 */}
      <div className="card-header">
        <div className="profile-img">
          {profileImage ? <img src={profileImage} alt="profile" /> : <div className="placeholder">profile</div>}
        </div>

        <div className="profile-info">
          <div className={`name ${lockOn ? "blurred" : ""}`} aria-hidden={lockOn}>{name}</div>
          <div className={`sub-info ${lockOn ? "blurred" : ""}`} aria-hidden={lockOn}>{sex} / {age}</div>
        </div>

        <div className="right-side">
          {tagList.slice(0, 3).map((t) => (
            <div key={t} className="tag">#{t}</div>
          ))}
          {lockOn && <span className="lock-badge" title="승인되지 않은 사용자">🔒</span>}
        </div>
      </div>

      <hr className="divider" />

      {/* 연락처 */}
 <div className="contact-row">
    {/* 좌측: 연락처 */}
    <div className="contact">
      <div className="row">
        <span className="label">M</span>
        <span className={lockOn ? "blurred" : ""} aria-hidden={lockOn}>{phone}</span>
      </div>
      <div className="row">
        <span className="label">E</span>
        <span className={lockOn ? "blurred" : ""} aria-hidden={lockOn}>{email}</span>
      </div>
      <div className="row">
        <span className="label">H</span>
        <span className={lockOn ? "blurred" : ""} aria-hidden={lockOn}>{address}</span>
      </div>
    </div>

    {/* 우측: 브랜드 로고 */}
    <div className="brand-mark" aria-hidden="true">
      <img src="/logo.png" alt="GNGN 로고" className="brand-mark-img" />
    </div>
  </div>
</div>
    
  );
}

export default BusinessCard;
