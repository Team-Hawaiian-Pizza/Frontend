# 건너건너 (GN/GN)
> "건너건너"는 **명함 기반 커뮤니티 & 지역 연결 플랫폼**입니다.  
지인을 통해 새로운 사람을 연결하고, 지역 상권에서 스탬프와 쿠폰을 활용해 소비를 촉진하는 서비스입니다.  
명함 공유, 친구 연결, 스탬프 적립, 쿠폰 사용 기능을 중심으로 구현되었습니다.

## 🚀 기술 스택

### Frontend
- **React 18 (Vite 기반)**
- **React Router v6**
- **Axios** (API 연동)
- **TailwindCSS + Custom CSS** (UI 스타일링)
- **ESLint / Prettier** (코드 컨벤션)


# 주요 개발 기능
## 1.1 사용자 상세 페이지 (DetailPage)

API 기반 프로필 조회
user_id를 기반으로 특정 사용자의 프로필 정보를 비동기적으로 조회하여 렌더링.

조건부 정보 렌더링
connection_status 값(CONNECTED, NONE, PENDING)에 따라 친구 관계를 판별.

친구가 아니면 이메일/전화번호는 마스킹(블러 처리)

친구일 경우 전체 정보 표시.

채팅방 생성 및 입장 로직

기존 대화 목록(GET /conversations) 조회 → 상대방과의 채팅방 존재 여부 확인.

없으면 신규 생성(POST /conversations) → 생성된 채팅방으로 이동.

## 1.2 친구 연결 관리 (ConnectionsPage)

친구 요청
고유 코드를 이용해 친구를 요청하는 POST /connections/enter-code API 연동.

요청 목록 관리
GET /connections/requests API를 통해 받은 요청 목록 조회.
요청자의 프로필 이미지(avatar_url) 및 이름을 UI에 표시.

요청 수락/거절 기능

POST /connections/accept/{id}

POST /connections/reject/{id}
수락/거절 즉시 UI에서 제거하여 사용자 경험 향상.

## 1.3 친구 추천 및 검색 (SearchPage)

데이터 기반 사용자 표시

AI 추천 API (recommendFriends)

검색 API (getAIHomeData)
응답 데이터를 기반으로 '친구' + '건너건너' 목록 동적 렌더링.

프로필 이미지 표시 개선

avatar_url이 존재하는 경우 해당 이미지 표시.

없을 경우 기본 아바타(/friend-1.jpg) 사용.

컴포넌트 기반 UI

FriendCard, FofCard 등 재사용 가능한 컴포넌트 설계.

코드 일관성 및 재사용성 확보.

## 1.4 로그인 및 인증 시스템 설계
인증 흐름 설계: 사용자가 로그인할 때 localStorage에 사용자 ID를 저장하고, 이후 모든 API 요청 헤더에 이 ID를 담아 보내는 클라이언트 인증 흐름 전체를 직접 설계했습니다.

자동 로그아웃 구현: axios interceptor를 활용하여, 서버로부터 401 인증 오류 응답을 받으면 localStorage의 사용자 정보를 자동으로 삭제하고 로그인 페이지로 돌려보내는 안정적인 로직을 구현했습니다.

간편 로그인 기획: 해커톤의 요구사항에 맞춰, 별도의 비밀번호 없이 ID 입력만으로 진입할 수 있는 'guest' 로그인 방식을 기획했습니다.

## 1.5 메인 페이지 UI 구현 및 UX 개선
초기 UI 개발: 검색 바, 그래프 컨테이너, 하단 랜딩 섹션을 포함한 메인 페이지의 전체적인 레이아웃과 스타일(CSS) 코드를 직접 작성하여 서비스의 첫인상을 완성했습니다.

UX 개선 주도: 데이터 시각화 영역의 단조로운 회색 배경이 사용자 경험을 저해한다고 판단하고, 먼저 디자인 개선을 요청하여 서비스의 시각적 품질을 높이는 데 결정적으로 기여했습니다.

##1.6 검색 기능 구현 및 핵심 버그 해결
검색 컴포넌트 개발: React를 사용하여 사용자의 입력을 받아 API를 호출하고 결과를 표시하는 Search.jsx 컴포넌트를 직접 구현하여 검색 기능의 기반을 마련했습니다.

근본 원인 규명: 검색 기능이 작동하지 않았을 때, 개발자 도구의 콘솔 로그를 면밀히 분석했습니다. 이를 통해 API가 결과가 없을 시 빈 배열([])이 아닌 빈 객체({})를 반환하는 것을 발견하여, 렌더링 오류의 근본적인 원인을 특정하고 해결의 실마리를 제공했습니다.

### 1.7 명함 관리
- 디지털 명함 생성 및 수정
- **프로필 사진 업로드**
- 이름, 연락처, 이메일, 성별, 연령대, 주소, 소개, 태그 관리
- 태그는 자유 입력 + 카테고리/서비스 기반 자동 태깅 지원
- **SmartBusinessCard** 컴포넌트:  
  - 본인일 경우 모든 정보 표시
  - 타인일 경우 승인/연결 상태에 따라 일부 정보 마스킹

### 1.8. 친구 목록
- `/users/all` API 기반으로 친구 리스트 로딩
- 본인 제외 10명까지만 표시
- 아바타 이미지 + 닉네임 + 간단 소개 문구
  
### 1.9 스탬프판 & 쿠폰함
- `/rewards/stamps/all` API 연동
- 브랜드별 스탬프 현황 (ex. 8/10 스탬프)
- 스탬프판 진입 시 브랜드 ID 기반 상세 페이지로 이동
- **base64 이미지 변환 → 정상적인 data:image/png;base64 URL 변환 처리**
- `/rewards/coupons` API 연동
- 쿠폰명, 혜택, 유효기간 표시
- **쿠폰 이미지 썸네일 추가**
- "사용하기" 클릭 시 `/rewards/coupons/:id/use` 호출
- 사용된 쿠폰은 "사용 완료" 처리 및 비활성화

# API 연동 설계

axios 인스턴스 분리

Core API와 Chat API의 baseURL을 분리 관리(api.js, chatApi.js).

API 호출 모듈화

모든 API 호출 로직을 api/index.js에 함수로 추상화.

컴포넌트에서는 API 통신 로직을 알 필요 없이 함수만 호출.

#3.  주요 기술적 문제 해결
## 3.1 404 Not Found 클라이언트 에러 디버깅

문제 원인
POST /connections/reject/{id} 호출 시 지속적인 404 발생 → 프론트/백엔드 간 API 규격 불일치.

해결 과정

브라우저 네트워크 탭 + Postman으로 실제 요청 경로 점검.

requestId vs fromUserId 차이, 경로 오타(trailing slash) 확인.

서버 API 수정 → 최종 해결.

## 3.2. CORS 정책 문제 대응

문제 원인
User-Id 같은 커스텀 헤더 인증 시, Preflight(OPTIONS) 요청에서 서버가 차단.

해결 과정

임시로 params 및 body에 user_id 포함 → 개발 블로킹 방지.

장기적으로는 백엔드에 CORS 허용 정책 수정 요청.

## API 응답 데이터 정규화 (Normalization)

문제 원인

API 응답 구조가 예상과 다르거나 래퍼 객체 존재 (data.data, data.results).

username 같은 필수 필드 누락 → UI 렌더링 실패.

해결 과정

console.log를 통해 실제 응답 구조 분석.

접근 경로 수정 (response.data → response.data.data).

백엔드와 협업하여 필수 데이터 필드 포함 요청.

# 4. 추가 구현 및 개선 사항 (프론트엔드 개발 과정에서 논의/구현한 내용)

로그인 상태 관리

App.jsx에서 isLogIn 상태를 관리하여 Header 컴포넌트에 전달.

로그인 시 LoginPage에서 localStorage에 user_id와 username 저장 후 onLogin() 호출.

로그아웃 시 localStorage 삭제 및 onLogout() 호출 → Header에서 Login/Signup ↔ Logout 버튼 전환.

친구 여부에 따른 정보 표시

DetailPage에서 connection_status === 'CONNECTED'일 경우
→ 이메일/전화번호 원본 표시.

그 외(NONE, PENDING)일 경우 → 마스킹 처리.

프로필 이미지 표시

SearchPage/DetailPage에서 avatar_url이 존재하면 해당 이미지 출력.

없을 경우 fallback 이미지(/friend-1.jpg) 적용.

# 5. UI/UX
- **Header**: 로고 + 서비스명 + 네비게이션 (Mypage, Search, Chatting, Connection, Login/Logout)
- **BusinessCard 디자인 개선**: Hover 효과, Blur 처리(비승인 사용자), 태그 칩 UI
- **로고 디자인**:  프로젝트 이름인 건너건너의 초성인 ㄱㄴㄱㄴ을 감각적으로 재해석한 Typography 
- TailwindCSS + Custom CSS 혼합 사용으로 반응형 / 직관적 인터페이스 제공
