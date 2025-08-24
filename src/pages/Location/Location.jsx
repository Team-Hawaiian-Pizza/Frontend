// src/pages/Location/LocationPage.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import regions from "../../data/regions";
import "../../styles/Location.css";

export default function LocationPage() {
  const navigate = useNavigate();
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // 이전 단계에서 임시 저장한 회원 ID (숫자 ID 또는 username일 수 있음)
  const signupId = localStorage.getItem("signup_id");

  useEffect(() => {
    if (!signupId) {
      // 이전 단계 정보 없으면 회원가입 폼으로
      navigate("/signup");
    }
  }, [signupId, navigate]);

  const provinceOptions = useMemo(() => Object.keys(regions), []);
  const cityOptions = useMemo(() => (province ? regions[province] || [] : []), [province]);

  const canSubmit = !!(province && city && signupId) && !loading;

  // signupId가 숫자가 아니면 /users/all에서 username으로 id 찾아오기
  const resolveUserId = async (raw) => {
    // 1) 이미 숫자면 그대로
    const direct = Number(raw);
    if (Number.isInteger(direct)) return direct;

    // 2) username → id 조회
    try {
      const res = await api.get("/users/login");
      const list = res?.data?.results || [];
      const found = list.find((u) => String(u?.username) === String(raw));
      if (found?.id != null) {
        // 찾았으면 로컬에도 숫자ID로 덮어쓰기
        localStorage.setItem("signup_id", String(found.id));
        return Number(found.id);
      }
      throw new Error("해당 username을 가진 사용자를 찾지 못했습니다.");
    } catch (e) {
      // 조회 실패
      console.warn("[signup/location] username → id 조회 실패:", e?.response?.data || e);
      throw new Error("user_id가 유효하지 않습니다. 다시 가입을 시작해 주세요.");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setErr("");
    setLoading(true);
    try {
      // 선택값 저장(선택 사항)
      localStorage.setItem("region_sido", province);
      localStorage.setItem("region_sigungu", city);

      // ✅ user_id 보정 (숫자ID 보장)
      const uid = await resolveUserId(signupId);
      const payload = { user_id: uid, province, city };
      console.log("[signup/location] payload:", payload);

      // 바디 + 헤더 모두 전달 (서버 양쪽 처리 호환)
      const res = await api.post("/users/signup/location", payload, {
        headers: { "User-Id": String(uid) },
      });

      const ok = res?.data?.ok ?? (res?.status >= 200 && res?.status < 300);
      if (!ok) throw new Error(res?.data?.error || "위치 정보 저장 실패");

      // 임시 저장값 정리
      localStorage.removeItem("signup_id");
      localStorage.removeItem("signup_pw");

      // 다음 단계로 이동
      navigate("/card/new");
    } catch (e) {
      console.error("[signup/location] error:", e?.response?.status, e?.response?.data || e);
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e?.message ||
        "위치 저장에 실패했어요. 잠시 후 다시 시도해 주세요.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

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
              {provinceOptions.map((si) => (
                <option key={si} value={si}>{si}</option>
              ))}
            </select>
            <span className="loc__chev" aria-hidden>▾</span>
          </div>

          <label className="loc__label" htmlFor="city" style={{ marginTop: 16 }}>
            시 / 군 / 구
          </label>
          <div className="loc__selectwrap">
            <select
              id="city"
              className="loc__select"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={!province}
            >
              <option value="" disabled>
                {province ? "시 / 군 / 구를 선택하세요" : "먼저 시/도를 선택하세요"}
              </option>
              {cityOptions.map((gu) => (
                <option key={gu} value={gu}>{gu}</option>
              ))}
            </select>
            <span className="loc__chev" aria-hidden>▾</span>
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
