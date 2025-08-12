import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Mainpage />} />
        <Route path="/entry" element={<Entry />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/location" element={<Location />} />
        <Route path="/card/new" element={<CardCreation />} />
        <Route path="/search" element={<Search />} />
        <Route path="/profile/:id" element={<Detail />} />
        <Route path="/chat" element={<Chatting />} />
        <Route path="/connect" element={<Connections />} />
        <Route path="/mypage" element={<Mypage />} />
        <Route path="/card/edit" element={<ModifyCard />} />
        <Route path="/stamp/:id" element={<StampBoard />} />
        <Route path="/coupon" element={<Coupon />} />
      </Routes>
    </Router>
  )
}

export default App;