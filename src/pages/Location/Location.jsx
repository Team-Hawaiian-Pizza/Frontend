import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import regions from "../../data/regions";
import "../../styles/Location.css";

// App.jsx에서 props를 받지 않는 원래 형태로 되돌립니다.
export default function LocationPage() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);

  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false); 
  const [err, setErr] = useState("");

  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem("signup_user_id");
    const storedUsername = localStorage.getItem("signup_username");

    if (storedUserId && storedUsername) {
      setUserId(storedUserId);
      setUsername(storedUsername);
      setIsValidating(false);
    } else {
      alert("회원가입 정보가 없습니다. 다시 시도해 주세요.");
      navigate("/signup");
    }
  }, [navigate]);

  const provinceOptions = useMemo(() => Object.keys(regions), []);
  const cityOptions = useMemo(() => (province ? regions[province] || [] : []), [province]);
  const canSubmit = !!(province && city && userId) && !loading;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setErr("");
    setLoading(true);
    try {
      const payload = {
        user_id: Number(userId),
        province,
        city
      };
      const res = await api.post("/users/signup/location", payload);
      const ok = res?.data?.ok ?? (res?.status >= 200 && res?.status < 300);
      if (!ok) {
        throw new Error(res?.data?.error || res?.data?.detail || "위치 정보 저장에 실패했습니다.");
      }

      // 로그인 상태를 만들기 위해 App.jsx가 사용하는 키로 저장합니다.
      localStorage.setItem('user_id', userId);
      localStorage.setItem('username', username);
      localStorage.setItem("region_sido", province);
      localStorage.setItem("region_sigungu", city);

      // 임시 데이터 삭제
      localStorage.removeItem("signup_user_id");
      localStorage.removeItem("signup_username");

      // [수정] 페이지를 새로고침하며 이동하여 App.jsx가 로그인 상태를 다시 확인하도록 합니다.
      window.location.href = '/card/new';

    } catch (error) {
      console.error("[signup/location] error:", error.response || error);
      let errorMessage = "위치 저장에 실패했어요. 잠시 후 다시 시도해 주세요.";
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorKeys = ['detail', 'error', 'message', 'user_id'];
        for (const key of errorKeys) {
          if (errorData[key]) {
            errorMessage = Array.isArray(errorData[key]) ? errorData[key][0] : errorData[key];
            break;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      setErr(errorMessage);

    } finally {
      setLoading(false);
    }
  };

  if (isValidating) {
    return (
      <section className="loc">
        <div className="loc__card"><h1 className="loc__title">정보를 확인하는 중...</h1></div>
      </section>
    );
  }

  return (
    <section className="loc">
      <div className="loc__card">
        <h1 className="loc__title">현재 위치를 선택하세요</h1>
        <form className="loc__form" onSubmit={onSubmit}>
          <label className="loc__label" htmlFor="province">시 / 도</label>
          <div className="loc__selectwrap">
            <select
              id="province"
              className="loc__select"
              value={province}
              onChange={(e) => { setProvince(e.target.value); setCity(""); }}
            >
              <option value="" disabled>시 / 도를 선택하세요</option>

              {provinceOptions.map((si) => (<option key={si} value={si}>{si}</option>))}

            </select>
            <span className="loc__chev" aria-hidden="true">▾</span>
          </div>

          <label className="loc__label" htmlFor="city" style={{ marginTop: 16 }}>시 / 군 / 구</label>

          <div className="loc__selectwrap">
            <select
              id="city"
              className="loc__select"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={!province}
            >

              <option value="" disabled>{province ? "시 / 군 / 구를 선택하세요" : "먼저 시/도를 선택하세요"}</option>
              {cityOptions.map((gu) => (<option key={gu} value={gu}>{gu}</option>))}

            </select>
            <span className="loc__chev" aria-hidden="true">▾</span>
          </div>
          {err && <div className="login__error" style={{ marginTop: 12 }}>{err}</div>}
          <button className="loc__submit" type="submit" disabled={!canSubmit}>
            {loading ? "저장 중…" : "다음으로"}
          </button>
        </form>
      </div>
    </section>
  );
}
