// src/Layout.jsx
import React, { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/footer";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getCurrentUser } from "./features/auth/authSlice";

function Layout() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

export default Layout;
