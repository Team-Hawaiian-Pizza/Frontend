// src/pages/ModifyCard/ModifyCard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CardForm from "../CardForm/CardForm.jsx";
import api from "../../api/axios.js";

const genderKR2EN = { "남성": "male", "여성": "female", "기타": "other" };
// "20대" → "20s", 이미 "20s"면 그대로 통과
const toAgeGroup = (v) => {
  if (!v) return "";
  if (/^\d0s(\+)?$/.test(v)) return v;                // "20s", "60s+" 형태
  const m = /^(\d{1,2})대$/.exec(v);                   // "20대"
  if (m) return `${m[1]}s`;
  if (v === "60대 이상" || v === "60+") return "60s+";
  return v;
};

function toForm(u) {
  return {
    name: u.name ?? "",
    phone: u.phone ?? "",
    email: u.email ?? "",
    address: [u.province_name, u.city_name].filter(Boolean).join(" "),
    gender: u.gender === "male" ? "남성" : u.gender === "female" ? "여성" : "기타",
    age: u.age_band ?? "",                 // "20s" 그대로 두고 폼에서 보이게
    intro: u.intro ?? "",
    tags: Array.isArray(u.tags) ? u.tags : [],
    preferredCategory: u.category ?? "",
    preferredService: u.service ?? "",
  };
}

// 문자열/배열 상관없이 태그를 배열로 정규화
const normalizeTags = (formData, obj) => {
  const multi = formData.getAll("tags"); // tags 필드가 여러개면 모으기
  let raw = multi?.length ? multi : obj.tags;
  if (raw == null) return [];
  if (typeof raw === "string") raw = raw.split(/[,\s]+/);
  return (Array.isArray(raw) ? raw : [raw])
    .map((t) => String(t).replace(/^#/, "").trim())
    .filter(Boolean);
};

export default function ModifyCard() {
  const [loading, setLoading] = useState(true);
  const [init, setInit] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // GET /users/me
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/users/me");
        setInit(toForm(res.data ?? {}));
      } catch (e) {
        console.error(e);
        alert("내 카드 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // PATCH /users/me/update
  const handleUpdate = async (formData) => {
    try {
      setSaving(true);

      const obj = Object.fromEntries(formData.entries());
      const userId = Number(localStorage.getItem("user_id"));

      const payload = {
        user_id: userId,                                           // ✅ 필수
        phone: obj.phone || "",
        address: obj.address || "",
        gender: genderKR2EN[obj.gender] || obj.gender || "other",
        age_group: toAgeGroup(obj.age),
        category: obj.preferredCategory || "",
        service: obj.preferredService || "",
        tags: normalizeTags(formData, obj),
        bio: obj.intro || "",                                      // ✅ intro → bio
      };

      // 불필요한 키는 빼고 전송 (name/email 등 스펙 외 키 제거)
      // console.log("update payload", payload);

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
      navigate("/mypage", { replace: true });
    } catch (e) {
      console.error(e);
      alert(`수정 중 오류: ${e?.response?.status || ""} ${e?.response?.data?.error || e.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 16 }}>불러오는 중…</div>;
  if (!init) return <div style={{ padding: 16 }}>데이터 없음</div>;

  return (
    <CardForm
      mode="edit"
      initialData={init}
      onSubmit={handleUpdate}
      disabled={saving}
    />
  );
}
