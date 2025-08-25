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
  const [recommendations, setRecommendations] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
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
        
        // AI 추천 결과 처리
        if (queryFromUrl) {
          console.log('🔍 검색 모드 - AI 추천 결과 처리');
          setSearchResults(responseData);
          setRecommendations([]);
        } else {
          console.log('🤖 기본 추천 모드');
          let processedData = [];
          if (responseData?.recommendations) {
            processedData = responseData.recommendations.map(rec => ({
              friend: rec.introducer_user,
              fof: rec.recommended_user,
            }));
          }
          setRecommendations(processedData);
          setSearchResults(null);
        }

      } catch (err) {
        console.error('데이터 로드 실패 (Search.jsx):', err?.response?.data || err?.message || err);
        setRecommendations([]);
        setSearchResults(null);
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
      setRecommendations((list) => list.map((pair) => (pair.fof.id === id ? { ...pair, fof: { ...pair.fof, approved: true } } : pair)));
      console.log(`승인 성공: ${id}`);
    } catch (err) {
      console.error('승인 실패:', err?.response?.data || err?.message || err);
      alert('승인 요청에 실패했습니다.');
    }
  };

  const goToDetail = (id) => navigate(`/profile/${id}`);

  const friendFofPairs = useMemo(() => {
    const currentUserId = Number(localStorage.getItem('user_id'));
    console.log(`MEMO 계산: 현재 사용자를 필터링합니다 (user_id: ${currentUserId})`);
    
    if (!Array.isArray(recommendations)) return [];
    return recommendations
        .filter(pair => pair.fof?.id !== currentUserId)
        .slice(0, 10);
  }, [recommendations]);

  const renderSearchResults = () => {
    if (!searchResults) return null;
    
    const { inferred_category, request_id, recommendations: recs, response_time } = searchResults;
    
    return (
      <div className="search-results-container">
        <div className="results-header">
          <h2>추천 결과</h2>
        </div>
        
        <h3>📍 추천 인맥 ({recs?.length || 0}명)</h3>
        
        {recs && recs.length > 0 ? (
          <div className="recommendations-list">
            {recs.map((rec, index) => {
              const user = rec.recommended_user || {};
              const introducer = rec.introducer_user || {};
              const score = Math.round((rec.ai_score || 0) * 100);
              
              return (
                <div key={index} className="recommendation-item" onClick={() => goToDetail(user.id || rec.recommended_user_id)} style={{cursor: 'pointer'}}>
                  <div className="rec-header">
                    <div className="rec-name">{user.name || '이름없음'}</div>
                    <div className="rec-score">{score}점</div>
                  </div>
                  
                  <div className="rec-location">
                    📍 {user.province_name} {user.city_name} | {user.age_band} {user.gender === 'male' ? '남성' : user.gender === 'female' ? '여성' : ''}
                  </div>
                  
                  <div className="rec-intro">
                    "{user.intro || '소개글이 없습니다.'}"
                  </div>
                  
                  <div className="rec-tags">
                    <span className="tag">👥 소개자: {introducer.name || '알 수 없음'}</span>
                    <span className="tag">🔗 {rec.relationship_degree}촌 관계</span>
                    <span className="tag">🌡️ 매너온도 {user.manner_temperature || 'N/A'}°C</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-results">
            <p>추천할 인맥이 없습니다.</p>
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div style={{ padding: 20 }}>로딩 중...</div>;

  return (
    <div className="searchpage">
      <form className="search-bar" onSubmit={onSubmit}>
        <input
          className="search-input"
          placeholder="AI가 분석해서 맞는 인맥을 찾아드려요! 어떤 도움이 필요하신가요?"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="search-btn" type="submit">검색</button>
      </form>

      {searchResults ? (
        renderSearchResults()
      ) : (
        <section className="list">
          <div className="friend-card-header">친구</div>
          <div className="fof-card-header">건너건너</div>
          
          {friendFofPairs.map((pair) => (
            <React.Fragment key={pair.fof.id}>
              <div className="friend-list-item">
                <FriendCard name={pair.friend.name} img={pair.friend.avatar_url} />
              </div>
              <div className="fof-list-item">
                <FofCard
                  img={pair.fof.avatar_url}
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
      )}
    </div>
  );
};

export default Search;