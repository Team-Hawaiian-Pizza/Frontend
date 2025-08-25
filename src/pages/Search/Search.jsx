import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FriendCard from '../../components/FriendCard';
import FofCard from '../../components/FofCard';

import api from '../../api/axios';
import { 
  recommendFriends, 
  getAIHomeData 
} from '../../api/aiService';
import './Search.css';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') || '');
  // 'users' 상태는 이제 { friend, fof } 형태의 객체 배열을 저장합니다.
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userIdForApi = localStorage.getItem('user_id');
    console.log(`--- Search.jsx useEffect 실행 (현재 user_id: ${userIdForApi}) ---`);
    
    const queryFromUrl = searchParams.get('q')?.trim();
    console.log('URL 쿼리 파라미터 (q):', queryFromUrl);

    const loadData = async () => {
      setLoading(true);
      try {
        let responseData;
        if (queryFromUrl) {
          console.log('🔍 검색 모드 실행');
          responseData = await getAIHomeData(queryFromUrl);
        } else {
          console.log('🤖 AI 추천 모드 실행');
          responseData = await recommendFriends();
        }
        
        console.log('뜯어볼 API 응답 객체:', JSON.stringify(responseData, null, 2));
        
        let processedData = [];

        // 1. 추천 API 응답 처리
        if (responseData?.recommendations) {
            console.log('🤖 추천 응답 데이터 처리');
            // 'introducer_user'를 friend로, 'recommended_user'를 fof로 매핑합니다.
            processedData = responseData.recommendations.map(rec => ({
                friend: rec.introducer_user,
                fof: rec.recommended_user,
            }));
        } 
        // 2. 검색 API 응답 처리 (서버가 'results' 키로 배열을 준다고 가정)
        else if (Array.isArray(responseData?.results)) {
            console.log('🔍 검색 응답 데이터 처리');
            // 검색 결과에는 소개해준 친구가 없으므로, '검색 결과'라는 이름의 가상 친구를 만듭니다.
            processedData = responseData.results.map((user, idx) => ({
                friend: { 
                    id: `friend_${user.id || idx}`,
                    name: `검색 결과`,
                    img: '/friend-1.jpg',
                },
                fof: user,
            }));
        }

        console.log('📊 화면에 표시할 처리된 데이터:', processedData);
        setUsers(processedData);

      } catch (err) {
        console.error('데이터 로드 실패 (Search.jsx):', err?.response?.data || err?.message || err);
        setUsers([]);
      } finally {
        setLoading(false);
        console.log('--- Search.jsx useEffect 종료 ---');
      }
    };

    loadData();
  }, [searchParams]);

  const onSubmit = (e) => {
    e.preventDefault();
    const next = q.trim();
    console.log('폼 제출. 검색어:', next);
    setSearchParams(next ? { q: next } : {});
  };

  const approveFof = async (id) => {
    try {
      console.log(`승인 요청: ${id}`);
      await api.post(`/connections/accept/${id}`);
      // users 상태가 객체 배열이므로, fof.id를 기준으로 업데이트합니다.
      setUsers((list) => list.map((pair) => (pair.fof.id === id ? { ...pair, fof: { ...pair.fof, approved: true } } : pair)));
      console.log(`승인 성공: ${id}`);
    } catch (err) {
      console.error('승인 실패:', err?.response?.data || err?.message || err);
      alert('승인 요청에 실패했습니다.');
    }
  };

  const goToDetail = (id) => navigate(`/profile/${id}`);

  // useMemo 로직이 더 간단해졌습니다.
  const friendFofPairs = useMemo(() => {
    const currentUserId = Number(localStorage.getItem('user_id'));
    console.log(`MEMO 계산: 현재 사용자를 필터링합니다 (user_id: ${currentUserId})`);
    
    if (!Array.isArray(users)) return [];
    // 'users'는 이미 {friend, fof} 쌍의 배열이므로, fof가 현재 사용자인 경우만 제외합니다.
    return users
        .filter(pair => pair.fof?.id !== currentUserId)
        .slice(0, 10);
  }, [users]);

  if (loading) return <div style={{ padding: 20 }}>로딩 중...</div>;

  return (
    <div className="searchpage">
      <form className="search-bar" onSubmit={onSubmit}>
        <input
          className="search-input"
          placeholder="필요한 명함을 검색하세요"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="search-btn" type="submit">검색</button>
      </form>

      <section className="list">
        <div className="friend-card-header">친구</div>
        <div className="fof-card-header">건너건너</div>
        
        {friendFofPairs.map((pair) => (
          <React.Fragment key={pair.fof.id}>
            <div className="friend-list-item">
              {/* 실제 친구(introducer_user)의 이름과 이미지를 사용합니다. */}
              <FriendCard name={pair.friend.name} img={pair.friend.avatar_url || '/friend-1.jpg'} />
            </div>
            <div className="fof-list-item">
              <FofCard
                img={pair.fof.avatar_url || '/friend-1.jpg'}
                name={pair.fof.name || '이름없음'}
                phone={pair.fof.masked_phone || '010-****-****'}
                email={pair.fof.masked_email || '****@****'}
                address={[pair.fof.province_name, pair.fof.city_name].filter(Boolean).join(' ') || '비공개'}
                approved={Boolean(pair.fof.approved)}
                onApprove={() => approveFof(pair.fof.id)}
                onDetailClick={() => goToDetail(pair.fof.id)}
              />
            </div>
          </React.Fragment>
        ))}
      </section>
    </div>
  );
};

export default Search;
