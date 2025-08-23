import React, { useEffect, useMemo, useRef, useState } from "react";
import "./cardCreation.css";

const AGE_OPTIONS = ["10대", "20대", "30대", "40대", "50대 이상"];

export const CATEGORY_MAP = {
  디자인: ["로고","브랜딩","포스터","배너","UI 디자인","카드뉴스"],
  "IT/프로그래밍": [
    "React","Vue","Angular","Next.js","Node.js","Express",
    "Java","Spring","Kotlin","Python","Django","Flask",
    "C","C++","C#",".NET","Go","Rust",
    "Android","iOS","Flutter","React Native",
    "DB 설계","SQL","DevOps","Docker","Kubernetes",
    "AWS","GCP","Azure","보안 점검"
  ],
  마케팅: ["SNS 운영","콘텐츠 기획","퍼포먼스 광고","바이럴","카피라이팅","CRM"],
  "사진/영상": ["프로필 촬영","제품 촬영","웨딩","행사 스냅","영상 편집","모션그래픽"],
  "예술/공연": ["밴드","보컬","댄스","연기","연주","작곡/편곡"],
  번역통역: ["영한 번역","한영 번역","중국어","일본어","스페인어","동시통역"],
  교육: ["수학","영어","국어","코딩 교육","자격증 강의","과외"],
  의료: ["간호 케어","물리치료","재활","심리상담(자격)","영양 상담(자격)"],
  법률: ["법률 상담(변호사)","노무 상담(노무사)","세무 상담(세무사)"],
  "금융/회계": ["기장 대행","세무 신고","재무 분석","투자 자문(자격)"],
  "시설 관리": ["전기 점검","배관 점검","에어컨 청소","소독/방역","청소 용역"],
  건설시공: ["리모델링","도배","바닥","도장","조명","목공"],
  인테리어: ["주거 인테리어","상업 인테리어","3D 모델링","스타일링"],
  부동산: ["매물 중개(자격)","임대 관리","시세 분석","사진/도면 제작"],
  "식당/푸드": ["한식","양식","중식","카페/디저트","케이터링","푸드 트럭"],
  뷰티케어: ["헤어","메이크업","네일","피부관리","왁싱"],
  "운송/물류": ["용달","이사","퀵서비스","보관","물류 대행"],
  "제조/생산": ["시제품 제작","3D 프린팅","CNC","금형","패키징"],
  컨설팅: ["사업 기획","IR/피치덱","시장조사","브랜딩 전략","PM/프로세스"],
  농업원예: ["텃밭 조성","조경","식물 케어","원예 디자인"],
  반려동물: ["산책 대행","훈련","미용","케어","사진 촬영"],
  "스포츠/레저": ["PT","필라테스","요가","등산 가이드","골프 레슨"],
  이벤트행사: ["행사 기획","MC","행사진행","대관","음향/조명"]
};

/**
 * props:
 * - mode: "create" | "edit"
 * - initialData: {
 *     name, phone, email, address, gender, age,
 *     tags: string[], intro, profileUrl?: string
 *     preferredCategory?: string, preferredService?: string
 *   }
 * - onSubmit: async (formData: FormData) => void
 */
  function CardForm({ mode = "create", initialData = {}, onSubmit, onPreviewChange }) {
  // === 기본 정보 ===
  const [name, setName] = useState(initialData.name || "");
  const [phone, setPhone] = useState(initialData.phone || "");
  const [email, setEmail] = useState(initialData.email || "");
  const [address, setAddress] = useState(initialData.address || "");
  const [gender, setGender] = useState(initialData.gender || "");
  const [age, setAge] = useState(initialData.age || "");

  // 선택
  const [intro, setIntro] = useState(initialData.intro || "");

  // 카테고리/서비스/태그
  const categories = useMemo(() => Object.keys(CATEGORY_MAP), []);
  const defaultCategory = initialData.preferredCategory || categories[0];
  const [activeCategory, setActiveCategory] = useState(defaultCategory);
  const defaultService = initialData.preferredService || (CATEGORY_MAP[defaultCategory] ?? [])[0];
  const [service, setService] = useState(defaultService);
  const [tags, setTags] = useState(Array.isArray(initialData.tags) ? initialData.tags : []);

  // 프로필 이미지
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(initialData.profileUrl || "");
  const [photoErr, setPhotoErr] = useState("");
  const fileRef = useRef(null);
 // 프리뷰 페이로드 생성
  const buildPreview = () => ({
    name, phone, email, address, gender, age,
    tags, intro,
    profileUrl: profilePreview || initialData.profileUrl || ""
  });
 // 실시간 프리뷰 업데이트: 관련 상태가 바뀔 때마다 호출
  useEffect(() => {
    onPreviewChange?.(buildPreview());
   // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, phone, email, address, gender, age, tags, intro, profilePreview]);
  // initialData가 바뀌면 동기화 (수정 페이지에서 사용자 교체 등)
  useEffect(() => {
    setName(initialData.name || "");
    setPhone(initialData.phone || "");
    setEmail(initialData.email || "");
    setAddress(initialData.address || "");
    setGender(initialData.gender || "");
    setAge(initialData.age || "");
    setIntro(initialData.intro || "");
    const cat = initialData.preferredCategory || categories[0];
    setActiveCategory(cat);
    setService(initialData.preferredService || (CATEGORY_MAP[cat] ?? [])[0]);
    setTags(Array.isArray(initialData.tags) ? initialData.tags : []);
    setProfileFile(null);
    setPhotoErr("");
    setProfilePreview(initialData.profileUrl || "");
    if (fileRef.current) fileRef.current.value = "";
    onPreviewChange?.({
    name: initialData.name || "",
    phone: initialData.phone || "",
    email: initialData.email || "",
    address: initialData.address || "",
    gender: initialData.gender || "",
    age: initialData.age || "",
    tags: Array.isArray(initialData.tags) ? initialData.tags : [],
    intro: initialData.intro || "",
    profileUrl: initialData.profileUrl || ""
  });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialData)]);

  // 이미지 미리보기 URL 메모리 정리 (objectURL만 revoke)
  useEffect(() => {
    return () => {
      if (profilePreview && profilePreview.startsWith("blob:")) {
        URL.revokeObjectURL(profilePreview);
      }
    };
  }, [profilePreview]);

  const acceptTypes = /image\/(png|jpeg|jpg|webp|gif)/i;
  const maxSize = 5 * 1024 * 1024;

  const handlePickFile = (file) => {
    if (!file) return;
    if (!acceptTypes.test(file.type)) {
      setPhotoErr("이미지 파일만 업로드 가능합니다.");
      return;
    }
    if (file.size > maxSize) {
      setPhotoErr("파일 용량은 5MB 이하만 가능합니다.");
      return;
    }
    setPhotoErr("");
    setProfileFile(file);
    const url = URL.createObjectURL(file);
    setProfilePreview(url);
  };

  const onFileChange = (e) => handlePickFile(e.target.files?.[0]);
  const onAvatarClick = () => fileRef.current?.click();
  const clearPhoto = () => {
    setProfileFile(null);
    if (profilePreview && profilePreview.startsWith("blob:")) {
      URL.revokeObjectURL(profilePreview);
    }
    setProfilePreview(initialData.profileUrl || ""); // 수정모드: 기존 이미지로 롤백
    setPhotoErr("");
    if (fileRef.current) fileRef.current.value = "";
  };
  const onAvatarDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePickFile(e.dataTransfer.files[0]);
    }
  };
  const onAvatarDragOver = (e) => e.preventDefault();

  // 유효성
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const phoneOk = /^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(phone);
  const allRequiredFilled = name.trim() && phone.trim() && email.trim() && address.trim() && gender && age;
  const isValid = Boolean(allRequiredFilled && emailOk && phoneOk);

  // 태그
  const onAddTag = () => {
    if (!service) return;
    const tag = `#${service}`;
    setTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
  };
  const onRemoveTag = (t) => setTags((prev) => prev.filter((x) => x !== t));
  const onChangeCategory = (c) => {
    setActiveCategory(c);
    const first = CATEGORY_MAP[c]?.[0] ?? "";
    setService(first);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("email", email);
    formData.append("address", address);
    formData.append("gender", gender);
    formData.append("age", age);
    formData.append("tags", JSON.stringify(tags));
    formData.append("intro", intro ?? "");
    // 수정 모드에서 새 파일이 없고 기존 url만 있는 케이스를 백엔드가 이해할 수 있게 전달
    if (profileFile) {
      formData.append("profile", profileFile);
    } else if (initialData.profileUrl) {
      formData.append("profileUrl", initialData.profileUrl);
    }

    await onSubmit?.(formData);
  };

  return (
    <main className="cc-main">
      <form
        className="cc-card"
        onSubmit={handleSubmit}
        noValidate
        aria-label={mode === "edit" ? "명함 수정" : "명함 생성"}
      >
        {/* 프로필 + 기본정보 */}
        <section className="cc-section">
          <div className="cc-profile-row">
            {/* 아바타 업로더 */}
            <div className="cc-avatar-wrap">
              <div
                className={`cc-avatar ${profilePreview ? "has-img" : ""}`}
                onClick={onAvatarClick}
                onDrop={onAvatarDrop}
                onDragOver={onAvatarDragOver}
                title="클릭 또는 이미지를 드래그하여 업로드"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" ? onAvatarClick() : null)}
                aria-label="프로필 이미지 업로더"
              >
                {profilePreview ? (
                  <img src={profilePreview} alt="프로필 미리보기" className="cc-avatar-img" />
                ) : (
                  <span className="cc-avatar-hint">
                    {mode === "edit" ? "사진 변경" : "사진 업로드"}
                  </span>
                )}
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="cc-avatar-input"
                onChange={onFileChange}
                aria-label="프로필 사진 업로드"
              />
              <div className="cc-avatar-actions">
                <button type="button" className="cc-btn-xs" onClick={onAvatarClick}>
                  {profilePreview ? "사진 변경" : "사진 선택"}
                </button>
                {(profilePreview || initialData.profileUrl) && (
                  <button type="button" className="cc-btn-xs ghost" onClick={clearPhoto}>
                    삭제
                  </button>
                )}
              </div>
              {photoErr && <span className="cc-err mt4" role="alert">{photoErr}</span>}
            </div>

            {/* 기본 필드 */}
            <div className="cc-fields">
              <label className="cc-field">
                <span className="cc-label">이름 *</span>
                <input
                  required
                  type="text"
                  placeholder="이름"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={!name.trim()}
                />
                {!name.trim() && <span className="cc-err">필수 입력</span>}
              </label>

              <label className="cc-field">
                <span className="cc-label">전화번호 *</span>
                <input
                  required
                  type="tel"
                  placeholder="010-0000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  aria-invalid={Boolean(phone && !phoneOk)}
                />
                {phone && !phoneOk && <span className="cc-err">형식을 확인하세요</span>}
                {!phone.trim() && <span className="cc-err">필수 입력</span>}
              </label>

              <label className="cc-field">
                <span className="cc-label">이메일 *</span>
                <input
                  required
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(email && !emailOk)}
                />
                {email && !emailOk && <span className="cc-err">형식을 확인하세요</span>}
                {!email.trim() && <span className="cc-err">필수 입력</span>}
              </label>

              <label className="cc-field">
                <span className="cc-label">주소 *</span>
                <input
                  required
                  type="text"
                  placeholder="시/군/구"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  aria-invalid={!address.trim()}
                />
                {!address.trim() && <span className="cc-err">필수 입력</span>}
              </label>
            </div>
          </div>
        </section>

        {/* 성별 */}
        <section className="cc-section">
          <h3 className="cc-sec-title">성별 *</h3>
          <div className="cc-radio-row" role="radiogroup" aria-label="성별">
            <label className="cc-radio">
              <input
                required
                type="radio"
                name="gender"
                value="여성"
                checked={gender === "여성"}
                onChange={(e) => setGender(e.target.value)}
              />
              <span>여성</span>
            </label>
            <label className="cc-radio">
              <input
                required
                type="radio"
                name="gender"
                value="남성"
                checked={gender === "남성"}
                onChange={(e) => setGender(e.target.value)}
              />
              <span>남성</span>
            </label>
          </div>
          {!gender && <span className="cc-err mt4">성별을 선택하세요</span>}
        </section>

        {/* 연령대 */}
        <section className="cc-section">
          <h3 className="cc-sec-title">연령대 *</h3>
          <div className="cc-select-wrap">
            <select required value={age} onChange={(e) => setAge(e.target.value)} aria-label="연령대">
              <option value="" disabled>선택</option>
              {AGE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          {!age && <span className="cc-err mt4">연령대를 선택하세요</span>}
        </section>

        {/* 업무 태그 */}
        <section className="cc-section">
          <div className="cc-sec-header">
            <h3 className="cc-sec-title">업무 태그 (선택)</h3>
            <p className="cc-helper">업종/세부 서비스를 선택 후 추가 버튼으로 태그를 만들 수 있습니다.</p>
          </div>

          <div className="cc-tag-grid">
            {/* 좌: 카테고리 */}
            <div className="cc-cat-col" aria-label="카테고리 목록">
              {categories.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={"cc-cat-btn" + (activeCategory === c ? " is-active" : "")}
                  onClick={() => onChangeCategory(c)}
                  aria-pressed={activeCategory === c}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* 우: 서비스 + 아래 태그 */}
            <div className="cc-service-col">
              <div className="cc-service-row">
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  aria-label="세부 서비스"
                  title="세부 서비스"
                >
                  {(CATEGORY_MAP[activeCategory] ?? []).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button type="button" className="cc-add-btn" onClick={onAddTag} aria-label="태그 추가">추가</button>
              </div>

              <div className="cc-tags cc-tags--below">
                {tags.length === 0 && <div className="cc-tag-empty">선택된 태그가 없습니다</div>}
                {tags.map((t) => (
                  <span key={t} className="cc-tag-chip">
                    {t}
                    <button type="button" className="cc-tag-x" onClick={() => onRemoveTag(t)} aria-label={`${t} 제거`} title="제거">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 소개 */}
        <section className="cc-section">
          <h3 className="cc-sec-title">소개 (선택)</h3>
          <textarea
            className="cc-textarea"
            placeholder="취미, 관심사, 나만의 이야기 등을 자유롭게 적어보세요"
            rows={5}
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            aria-label="자기소개"
          />
        </section>

        {/* 저장 */}
        <div className="cc-actions">
          <button className="cc-save" type="submit" disabled={!isValid}>
            {mode === "edit" ? "수정하기" : "저장하기"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default CardForm;