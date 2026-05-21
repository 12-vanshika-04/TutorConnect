// src/Layout.jsx
import React, { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { checkGoogleUser } from "./features/auth/authSlice";

function Layout() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkGoogleUser());
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
