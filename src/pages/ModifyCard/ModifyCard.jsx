import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";   // ✅ 추가
import CardForm from "../CardForm/CardForm.jsx";
import api from "../../api/axios.js";

const genderMap = { male: "남성", female: "여성" };
const ageMap = { "10s": "10대", "20s": "20대", "30s": "30대", "40s": "40대", "50s": "50대" };

function toForm(u) {
  return {
    name: u.name ?? "",
    phone: u.phone ?? "",
    email: u.email ?? "",
    address: [u.province_name, u.city_name].filter(Boolean).join(" "),
    gender: genderMap[u.gender] ?? "",
    age: ageMap[u.age_band] ?? "",
    intro: u.intro ?? "",
    tags: [],
    preferredCategory: "",
    preferredService: "",
  };
}

export default function ModifyCard() {
  const [loading, setLoading] = useState(true);
  const [init, setInit] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();  // ✅ 추가

  // GET /users/me
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/users/me");
        setInit(toForm(res.data));
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
      const payload = { name: obj.name, intro: obj.intro };

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

      // ✅ 성공 시 마이페이지로 이동
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
