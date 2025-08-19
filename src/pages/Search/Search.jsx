import React from 'react'
import {useState, useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import FriendCard from '../../components/FriendCard';
import FofCard from '../../components/FofCard';

import './Search.css'
// 친구 데이터
const FRIENDS = [
  {id: 1, name: '안뇽이', img: '/friend-1.jpg'},
  {id: 2, name: '하텍이', img: '/friend-1.jpg'},
  {id: 3, name: '오호관', img: '/friend-1.jpg'}
];

// 친구의 친구 데이터
const FOF = [
  {id: 101, name: '인덕이', img: '/friend-1.jpg', phone:'010-1234-5678', email:'induk@naver.com', address: '서울시 강서구', approved: false},
  {id: 102, name: '홍길동', img: '/friend-1.jpg', phone:'010-2345-6789', email: 'hong@naver.com', address: '서울시 양천구', approved: false},
  {id: 103, name: '채부경', img: '/friend-1.jpg', phone: '010-3456-7890', email: 'chae@naver.com', address: '서울시 구로구', approved: true},
  {id: 104, name: '박준희', img: '/friend-1.jpg', phone: '010-4567-8901', email: 'park@naver.com', address: '서울시 영등포구', approved: false},
  {id: 105, name: '강태은', img: '/friend-1.jpg', phone: '010-5678-9012', email: 'kang@naver.com', address: '서울시 금천구', approved: false},
  {id: 106, name: '꼬깔콘', img: '/friend-1.jpg', phone: '010-6789-0123', email: 'coco@naver.com', address: '서울시 동작구', approved: false}
];

const RELATIONSHIPS = [
    { friendId: 1, fofId: 101 }, 
    { friendId: 1, fofId: 102 }, 
    { friendId: 1, fofId: 103 }, 
    { friendId: 2, fofId: 104 }, 
    { friendId: 3, fofId: 105 }, 
    { friendId: 3, fofId: 106 }, 
];

const Search = () => {
  const [q, setQ] = useState(""); //검색어
  const [fof, setFof] = useState(FOF);
  const navigate = useNavigate(); 

  // '요청' 버튼 클릭 시 approved 상태를 변경하는 함수
  const approveFof = (id) => {
    setFof(list => {
      list.map(v => {
        if (v.id === id) {
          return {...v, approved: true};
        }
        return v;
      })
    })
  };

  const goToDetail = (id) => {
    // '/fof/101' 같은 주소로 이동합니다.
    navigate(`/profile/${id}`); 
  };

  // 관계 데이터 기반으로 친구-건너건너 쌍을 매칭하는 새로운 배열을 생성합니다.
  const friendFofPairs = useMemo(() => {
    return RELATIONSHIPS.map(rel => {
      const friend = FRIENDS.find(f => f.id === rel.friendId);
      const fofItem = fof.find(fof => fof.id === rel.fofId);
      return { friend, fof: fofItem };
    });
  }, [fof]);

  
  const onSubmit = (e) => {
    e.preventDefault(); // 지금은 검색 미구현: 새로고침만 막기
    console.log('검색 클릭:', q);
  };


 return (
    <div className='searchpage'>
      <form className='search-bar' onSubmit={onSubmit}>
        <input className='search-input'
          placeholder="필요한 명함을 검색하세요"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          >
        </input>
        <button className='search-btn'>검색</button>
      </form>

      {/* 리스트 헤더와 리스트를 모두 감싸는 컨테이너 */}
      <section className='list'>
        <div className='friend-card-header'>친구</div>
        <div className='fof-card-header'>건너건너</div>
        
        {/* 친구와 건너건너 명함을 나란히 배치 */}
      {friendFofPairs.map((pair, index) => (
          <React.Fragment key={index}>
            <div className='friend-list-item'>
              <FriendCard name={pair.friend.name} img={pair.friend.img} />
            </div>
            <div className='fof-list-item'>
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