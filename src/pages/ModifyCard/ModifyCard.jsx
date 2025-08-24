import React, { useEffect, useState } from "react";
import CardForm from "../CardForm/CardForm.jsx";
import api from "../../api/axios";

function ModifyCard() {
  const [loading, setLoading] = useState(true);
  const [init, setInit] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // 예시: 본인 카드 조회 API
        // const res = await fetch("/api/cards/me");
        // const data = await res.json();
        // 이건 데모용 더미 데이터임
        const data = {
          name: "홍길동",
          phone: "010-1234-5678",
          email: "gildong@example.com",
          address: "인천 미추홀구",
          gender: "남성",
          age: "20대",
          intro: "React/Node 위주로 일합니다.",
          tags: ["#React", "#Node.js"],
          preferredCategory: "IT/프로그래밍",
          preferredService: "React",
        };

        setInit(data);
      } catch (e) {
        console.error(e);
        alert("내 카드 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleUpdate = async (formData) => {
    // 수정 API 들어가야됨
    // EX) await fetch("/api/cards/me", { method: "PUT", body: formData });
    console.log("update payload", Object.fromEntries(formData.entries()));
    alert("수정되었습니다. (데모)");
  };

  if (loading) return <div style={{ padding: 16 }}>불러오는 중…</div>;
  if (!init) return <div style={{ padding: 16 }}>데이터 없음</div>;

  return <CardForm mode="edit" initialData={init} onSubmit={handleUpdate} />;
}

export default ModifyCard;