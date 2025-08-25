// src/pages/ModifyCard/ModifyCard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CardForm from "../CardForm/CardForm.jsx";
import api from "../../api/axios.js";
import { splitAddressToProvinceCity } from "../../lib/parseCity.js";

const genderKR2EN = { "남성": "male", "여성": "female", "기타": "other" };

const toAgeGroup = (v) => {
  if (!v) return "";
  if (/^\d0s(\+)?$/i.test(v)) return v;
  const m = /^(\d{1,2})대$/.exec(v);
  if (m) return `${m[1]}s`;
  if (/^60/.test(v) || v === "60대 이상") return "60s+";
  return v;
};

const cleanTagString = (raw) => {
  if (raw == null) return [];
  const norm = (s) => String(s).replace(/^#/, "").trim();
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.flatMap((x) => Array.isArray(x) ? x : [x]).map(norm).filter(Boolean);
    }
  } catch (_) {}
  return String(raw)
    .replace(/^\s*\[+|\]+?\s*$/g, "")
    .replace(/^"+|"+$/g, "")
    .replace(/^'+|'+$/g, "")
    .split(/[,;\n\r]+/) // 공백은 분리자 X → "SNS 운영" 유지
    .map(norm)
    .filter(Boolean);
};

const parseTags = (raw) => cleanTagString(Array.isArray(raw) ? JSON.stringify(raw) : raw);

function toForm(u = {}) {
  const ageKR = (() => {
    const m = /^(\d+)s$/i.exec(u.age_band || "");
    if (m) return `${m[1]}대`;
    if ((u.age_band || "").toLowerCase() === "60s+") return "60대 이상";
    return u.age_band || "";
  })();

  return {
    name: u.name ?? "",
    phone: u.phone ?? "",
    email: u.email ?? "",
    address: [u.province_name, u.city_name].filter(Boolean).join(" "),
    gender: u.gender === "male" ? "남성" : u.gender === "female" ? "여성" : "기타",
    age: ageKR,
    intro: u.bio ?? u.intro ?? "",
    tags: parseTags(u.tags),
    preferredCategory: u.category ?? "",
    preferredService: u.service ?? "",
    profileUrl: u.avatar_url || ""
  };
}

export default function ModifyCard() {
  const [loading, setLoading] = useState(true);
  const [init, setInit] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // 내 정보 로드 (캐시 무력화)
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/users/me", { params: { _ts: Date.now() } });
        setInit(toForm(res.data ?? {}));
      } catch (e) {
        console.error(e);
        alert("내 카드 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 저장
  const handleUpdate = async (formData) => {
    try {
      setSaving(true);

      const user_id = Number(localStorage.getItem("user_id"));
      const obj = Object.fromEntries(formData.entries());
      const { province_name, city_name } = splitAddressToProvinceCity(obj.address || "");
      

      // 프로필 파일 감지
      const file = formData.get("profile");
      let avatar_url = obj.profileUrl || init?.profileUrl || "";

      if (file && typeof file === "object" && file.size > 0) {
        const uploaded = await uploadAvatar(file);
        if (uploaded) avatar_url = uploaded;
      }

      const payload = {
        user_id,
        // 서버가 허용하는 필드만
        name: obj.name || undefined,
        email: obj.email || undefined,
        phone: obj.phone || "",
        province_name,
        city_name,
        gender: genderKR2EN[obj.gender] || "other",
        age_band: toAgeGroup(obj.age),     // 최신 스펙
        age_group: toAgeGroup(obj.age),    // 구버전 호환
        category: obj.preferredCategory || "",
        service: obj.preferredService || "",
        tags: cleanTagString(obj.tags),    // ["SNS 운영", ...]
        intro: obj.intro || "",
        avatar_url
      };

      let res;
      try {
        res = await api.patch("/users/me/update", payload);
      } catch (err) {
        if (err?.response?.status === 405) {
          res = await api.patch("/users/me/update/", payload);
        } else {
          throw err;
        }
      }

      const ok = res?.data?.ok ?? (res?.status >= 200 && res?.status < 300);
      if (!ok) throw new Error(res?.data?.error || "업데이트 실패");

      alert("수정되었습니다.");
      // 강제 리프레시 신호
      navigate("/mypage", { replace: true, state: { refresh: Date.now() } });
    } catch (e) {
      console.error(e);
      alert(`수정 중 오류: ${e?.response?.status || ""} ${e?.response?.data?.error || e.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 16 }}>불러오는 중…</div>;
  if (!init)   return <div style={{ padding: 16 }}>데이터 없음</div>;

  return (
    <CardForm
      mode="edit"
      initialData={init}
      onSubmit={handleUpdate}
      disabled={saving}
    />
  );
}
