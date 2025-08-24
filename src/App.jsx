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

  // 페이지 로드 시 로그인 상태 확인
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const username = localStorage.getItem('username');
    console.log("App.jsx 로그인 체크:", { userId, username });
    const loginStatus = !!userId && !!username;
    console.log("로그인 상태:", loginStatus);
    setIsLogIn(loginStatus);
  }, []);

  const handleLogin = () => {
    setIsLogIn(true);
  }

  const handleLogout = () => {
    console.log("로그아웃 버튼 클릭됨");
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    setIsLogIn(false);
    alert("로그아웃되었습니다.");
  };

  // 보호된 라우트 컴포넌트
  const ProtectedRoute = ({ children }) => {
    console.log("ProtectedRoute 체크:", isLogIn);
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