import React from "react";
import { useSelector } from "react-redux";
import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements } from "react-router-dom";
import Layout from "./Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RegisterTutor from "./pages/RegisterTutor";
import FindTutors from "./pages/FindTutors";
import BookingPage from "./pages/BookingPage";
import TutorDashboard from "./pages/TutorDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import AdminVerifyTutors from "./pages/AdminVerifyTutors";
import ProtectedRoute from "./components/ProtectedRoute";
import GlobalLoader from "./components/GlobalLoader";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      {/* Public pages */}
      <Route index element={<Home />} />
      <Route path="about" element={<About />} />
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />
      <Route path="find-tutors" element={<FindTutors />} />
      <Route path="register-tutor" element={<RegisterTutor />} />

      {/* Protected pages */}
      <Route
        path="book/:tutorId"
        element={
          <ProtectedRoute>
            <BookingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="tutor-dashboard"
        element={
          <ProtectedRoute>
            <TutorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
  path="/admin-verify"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminVerifyTutors />
    </ProtectedRoute>
  }
/>

      <Route
        path="student-dashboard"
        element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
    </Route>
  )
);

export default function App() {
  const { status } = useSelector((state) => state.auth);

  return (
    <>
      {status === "loading" && <GlobalLoader text="Loading your data..." />}
      <RouterProvider router={router} />
    </>
  );
}
