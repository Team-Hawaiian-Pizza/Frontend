import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Detail.css';

// 임시 친구의 친구 데이터
const FOF = [
  {id: 101, name: '인덕이', img: '/friend-1.jpg', phone:'010-1234-5678', email:'induk@naver.com', address: '서울시 강서구', approved: false,
   description: '에어컨 필터 청소 전문\n리모델링 후 적극 추천', tags: ['#에어컨', '#필터청소'],
   reviews: ['에어컨 필터 청소를 기가 막히게 해주고 가셨습니다.'], mannerTemp: 85},
  {id: 102, name: '홍길동', img: '/friend-1.jpg', phone:'010-2345-6789', email: 'hong@naver.com', address: '서울시 양천구', approved: false,
   description: '가구 제작 및 수리', tags: ['#가구', '#수리'],
   reviews: ['낡은 책장을 새것처럼 고쳐주셨어요!'], mannerTemp: 72},
  {id: 103, name: '채부경', img: '/friend-1.jpg', phone: '010-3456-7890', email: 'chae@naver.com', address: '서울시 구로구', approved: true,
   description: '집안 인테리어 상담', tags: ['#인테리어', '#상담'],
   reviews: ['친절하고 꼼꼼하게 상담해주셔서 좋았습니다.'], mannerTemp: 95},
  {id: 104, name: '박준희', img: '/friend-1.jpg', phone: '010-4567-8901', email: 'park@naver.com', address: '서울시 영등포구', approved: false,
   description: '타일 시공 및 보수 전문가', tags: ['#타일', '#보수'],
   reviews: ['화장실 타일 교체 맡겼는데 정말 깔끔하게 해주셨어요.'], mannerTemp: 68},
  {id: 105, name: '강태은', img: '/friend-1.jpg', phone: '010-5678-9012', email: 'kang@naver.com', address: '서울시 금천구', approved: false,
   description: '조명 설치 및 디자인', tags: ['#조명', '#디자인'],
   reviews: ['분위기 좋은 조명으로 바꿔주셔서 감사합니다.'], mannerTemp: 78},
  {id: 106, name: '꼬깔콘', img: '/friend-1.jpg', phone: '010-6789-0123', email: 'coco@naver.com', address: '서울시 동작구', approved: false,
   description: '누수 탐지 및 배관 수리', tags: ['#누수', '#배관'],
   reviews: ['신속하게 누수 지점을 찾아 해결해주셨습니다.'], mannerTemp: 81}
];

const DetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const profile = FOF.find(f => f.id === Number(id));

  if (!profile) {
    return <div className="detail-page-not-found">명함을 찾을 수 없습니다.</div>;
  }

  // 1대1 채팅하기: chatting 페이지로 이동
  const handleChat = () => {
    navigate(`/chat/${profile.id}?name=${encodeURIComponent(profile.name)}`); // /chatting 경로로 이동
  };

  // 코드 요청하기: 명함 주인에게 코드 요청
  const handleCodeRequest = () => {
    console.log(`${profile.name}에게 코드 요청을 보냈습니다.`);
    alert(`${profile.name}님에게 코드 요청을 보냈습니다.`);
  };

  return (
    <div className="detail-page">
      <div className="detail-container">
        <div className="detail-left">
          <div className="detail-card">
            <div className="detail-avatar">
              <img src={profile.img} alt={profile.name} />
            </div>
            <div className="detail-name">{profile.name}</div>
            
            <div className={`detail-info ${!profile.approved ? 'blurred' : ''}`}>
              <span>{profile.phone}</span>
              <span>{profile.email}</span>
              <span>{profile.address}</span>
            </div>
          </div>
          <div className="detail-buttons">
            <button className="detail-button" onClick={handleChat}>1대1 채팅하기</button>
            <button className="detail-button" onClick={handleCodeRequest}>코드 요청하기</button>
          </div>
        </div>
        
        <div className="detail-right">
          <div className="detail-section">
            <h3>추가 설명</h3>
            {profile.description.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
            <div className="detail-tags">
              {profile.tags.map(tag => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
          
          {/* 후기 */}
          <div className="detail-section">
            <h3>후기</h3>
            {profile.reviews.length > 0 ? (
              profile.reviews.map((review, index) => (
                <p key={index}>{review}</p>
              ))
            ) : (
              <p>아직 등록된 후기가 없습니다.</p>
            )}
          </div>
          
          {/* 매너 온도 */}
          <div className="detail-section">
            <h3>매너 온도</h3>
            <div className="detail-manner">
              <div className="manner-bar-container">
                <div className="manner-bar" style={{ width: `${profile.mannerTemp}%` }}></div>
              </div>
              <span>{profile.mannerTemp}℃</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPage;