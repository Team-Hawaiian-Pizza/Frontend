import { Outlet } from "react-router-dom";
import React from "react";
import Header from "../components/Header.jsx";

export default function AppLayout({ isLogIn, onLogout }) {
  return (
    <>
      <Header isLogIn={isLogIn} onLogout={onLogout} />
      <Outlet />
    </>
  );
}