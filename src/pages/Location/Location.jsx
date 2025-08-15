import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import regions from "../../data/regions";
import "../../styles/Location.css";

export default function LocationPage() {
  const navigate = useNavigate();
  const [sido, setSido] = useState("");
  const [sigungu, setSigungu] = useState("");

  const sidoOptions = useMemo(() => Object.keys(regions), []);
  const sigunguOptions = useMemo(
    () => (sido ? regions[sido] || [] : []),
    [sido]
  );

  const canSubmit = sido && sigungu;

  const onSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    // 선택값 저장 (필요 시 상태관리/API로 대체)
    localStorage.setItem("region_sido", sido);
    localStorage.setItem("region_sigungu", sigungu);
    navigate("/network"); // 완료 후 이동 경로: 필요시 변경
  };

  return (
    <section className="loc">
      <div className="loc__card">
        <h1 className="loc__title">현재 위치를 선택하세요</h1>

        <form className="loc__form" onSubmit={onSubmit}>
          <label className="loc__label" htmlFor="sido">시 / 도</label>
          <div className="loc__selectwrap">
            <select
              id="sido"
              className="loc__select"
              value={sido}
              onChange={(e) => {
                setSido(e.target.value);
                setSigungu(""); // 시/도 바꾸면 하위 초기화
              }}
            >
              <option value="" disabled>시 / 도를 선택하세요</option>
              {sidoOptions.map((si) => (
                <option key={si} value={si}>{si}</option>
              ))}
            </select>
            <span className="loc__chev" aria-hidden>▾</span>
          </div>

          <label className="loc__label" htmlFor="sigungu" style={{ marginTop: 16 }}>
            시 / 군 / 구
          </label>
          <div className="loc__selectwrap">
            <select
              id="sigungu"
              className="loc__select"
              value={sigungu}
              onChange={(e) => setSigungu(e.target.value)}
              disabled={!sido}
            >
              <option value="" disabled>
                {sido ? "시 / 군 / 구를 선택하세요" : "먼저 시/도를 선택하세요"}
              </option>
              {sigunguOptions.map((gu) => (
                <option key={gu} value={gu}>{gu}</option>
              ))}
            </select>
            <span className="loc__chev" aria-hidden>▾</span>
          </div>

          <button className="loc__submit" type="submit" disabled={!canSubmit}>
            Sign Up
          </button>
        </form>
      </div>
    </section>
  );
}

