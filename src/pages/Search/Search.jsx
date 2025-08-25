import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FriendCard from '../../components/FriendCard';
import FofCard from '../../components/FofCard';

import api from '../../api/axios';          // 일반 데이터 서버
import { 
  recommendFriends, 
  getAIHomeData 
} from '../../api/aiService';               // AI 서버 서비스
import './Search.css';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const toArray = (data) => {
    // 백엔드 응답이 배열 또는 { results: [] } 모두 수용
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data)) return data;
    // 혹시 {items:[...]} 같은 케이스도 방어
    if (Array.isArray(data?.items)) return data.items;
    return [];
  };

  useEffect(() => {
    const queryFromUrl = searchParams.get('q')?.trim();
    console.log('--- Search.jsx useEffect 실행 ---');
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
        
        console.log('📦 API로부터 받은 원본 데이터:', responseData);
        const arr = toArray(responseData);
        console.log('📊 화면에 표시할 배열 데이터:', arr);
        setUsers(arr);

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
      setUsers((list) => list.map((u) => (u.id === id ? { ...u, approved: true } : u)));
      console.log(`승인 성공: ${id}`);
    } catch (err) {
      console.error('승인 실패:', err?.response?.data || err?.message || err);
      alert('승인 요청에 실패했습니다.');
    }
  };

  const goToDetail = (id) => navigate(`/profile/${id}`);

  const friendFofPairs = useMemo(() => {
    const currentUserId = Number(localStorage.getItem('user_id'));
    const otherUsers = users.filter((u) => u?.id !== currentUserId);

    return otherUsers.slice(0, 10).map((u, idx) => ({
      friend: {
        id: `friend_${idx}`,
        name: `공통 친구 ${idx + 1}`,
        img: '/friend-1.jpg',
      },
      fof: {
        id: u.id,
        name: u.name || '이름없음',
        img: u.avatar_url || '/friend-1.jpg',
        phone: u.masked_phone || '010-****-****',
        email: u.masked_email || '****@****',
        address: [u.province_name, u.city_name].filter(Boolean).join(' ') || '비공개',
        approved: Boolean(u.approved),
      },
    }));
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
              <FriendCard name={pair.friend.name} img={pair.friend.img} />
            </div>
            <div className="fof-list-item">
              <FofCard
                img={pair.fof.img}
                name={pair.fof.name}
                phone={pair.fof.phone}
                email={pair.fof.email}
                address={pair.fof.address}
                approved={pair.fof.approved}
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
