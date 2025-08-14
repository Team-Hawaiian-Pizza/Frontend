import { Outlet } from "react-router-dom";
import Header from "../components/Header.jsx";

export default function AppLayout({ isLoggedIn, onLogout }) {
  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLogout={onLogout} />
      <Outlet />
    </>
  );
}
