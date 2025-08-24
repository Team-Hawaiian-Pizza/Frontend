import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Mainpage from "./pages/Mainpage/Mainpage.jsx";
import Entry from "./pages/Entry/Entry.jsx";
import Login from "./pages/Login/Login.jsx";
import Signup from "./pages/Signup/Signup.jsx";
import Location from "./pages/Location/Location.jsx";
import CardCreation from "./pages/CardCreation/CardCreation.jsx";
import Search from "./pages/Search/Search.jsx";
import Detail from "./pages/Detail/Detail.jsx";
import Chatting from "./pages/Chatting/Chatting.jsx";
import Connections from "./pages/Connections/Connections.jsx";
import Mypage from "./pages/Mypage/Mypage.jsx";
import ModifyCard from "./pages/ModifyCard/ModifyCard.jsx";
import StampBoard from "./pages/StampBoard/StampBoard.jsx";
import Coupon from "./pages/Coupon/Coupon.jsx";

import AppLayout from "./layouts/AppLayout.jsx"

function App() {
  const [isLogIn, setIsLogIn] = useState(false);
  // [추가] 로그인 상태를 확인하는 동안 화면 렌더링을 보류하기 위한 상태
  const [isLoading, setIsLoading] = useState(true);

  // 페이지 로드 시 로그인 상태 확인
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const username = localStorage.getItem('username');
    const loginStatus = !!userId && !!username;
    
    setIsLogIn(loginStatus);
    // [추가] 로그인 상태 확인이 끝났으므로 로딩 상태를 false로 변경
    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    setIsLogIn(true);
  }

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    setIsLogIn(false);
    alert("로그아웃되었습니다.");
  };

  // 보호된 라우트 컴포넌트
  const ProtectedRoute = ({ children }) => {
    // [수정] 로딩 중일 때는 아무것도 보여주지 않거나 로딩 스피너를 보여줍니다.
    if (isLoading) {
      return null; // 또는 <LoadingSpinner />
    }
    // 로딩이 끝난 후, 로그인 상태에 따라 페이지를 보여주거나 리디렉션합니다.
    return isLogIn ? children : <Navigate to="/login" replace />;
  };
  
  return (
    <Router>
      <Routes>
        {/*헤더 없음*/}
        <Route path="/entry" element={<Entry />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/location" element={<Location />} />


        {/*헤더 있음 - 보호된 라우트*/}
        <Route element={<ProtectedRoute><AppLayout isLogIn={isLogIn} onLogout={handleLogout} /></ProtectedRoute>}>
          <Route path="/card/new" element={<CardCreation />} />
          <Route path="/search" element={<Search />}/>
          <Route path="/profile/:id" element={<Detail />} />
          <Route path="/chat" element={<Chatting />} />
          <Route path="/chat/:userId" element={<Chatting/>} />
          <Route path="/connect" element={<Connections />} />
          <Route path="/mypage" element={<Mypage />} />
          <Route path="/card/edit" element={<ModifyCard />} />
          <Route path="/stamp/:id" element={<StampBoard />} />
          <Route path="/coupon" element={<Coupon />} />
          <Route path="/" element={<Mainpage onLogin={handleLogin} />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App;
