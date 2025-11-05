import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { account, databases,ID } from "../utils/appwrite";
import { Query } from "appwrite";
import { useDispatch } from "react-redux";
import { loginUser } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const DB = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const USERS_COLLECTION = import.meta.env.VITE_APPWRITE_USERS_TABLE_ID;

export default function Login() {
  const { register, handleSubmit, reset } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ------------------------ Email/Password Login ------------------------
  const onSubmit = async (data) => {
    const { email, password } = data;
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();

      if (!result.role) navigate("/select-role");
      else if (result.role === "student") navigate("/student-dashboard");
      else if (result.role === "tutor") navigate("/tutor-dashboard");
      else navigate("/");

      reset();
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage(err || "Login failed. Check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------------ Google OAuth Login ------------------------
  const handleGoogleLogin = async () => {
    try {
      await account.createOAuth2Session(
        "google",
        window.location.origin,
        window.location.origin
      );
    } catch (err) {
      console.error("Google login failed:", err);
      alert("Google login failed 😕");
    }
  };

  // ------------------------ Check Google session after redirect ------------------------
  useEffect(() => {
    const checkGoogleSession = async () => {
      try {
        const user = await account.get();
        if (!user) return;

        const res = await databases.listDocuments(DB, USERS_COLLECTION, [
          Query.equal("userId", user.$id),
        ]);

        if (res.documents.length === 0) {
          // New Google user → redirect to role selection
          navigate("/select-role");
          return;
        }

        const role = res.documents[0].role;
        if (!role) navigate("/select-role");
        else if (role === "student") navigate("/student-dashboard");
        else navigate("/tutor-dashboard");
      } catch (err) {
        console.log("No active session or error fetching user:", err);
      }
    };
    checkGoogleSession();
  }, [navigate]);

  // ------------------------ Render ------------------------
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        <input
          {...register("email")}
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-3 rounded focus:ring-2 focus:ring-purple-500 outline-none"
          required
        />

        <div className="relative mb-3">
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="border p-2 w-full rounded pr-10 focus:ring-2 focus:ring-purple-500 outline-none"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {errorMessage && (
          <div className="bg-red-100 text-red-600 text-sm text-center p-2 rounded mb-3">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-purple-600 text-white w-full py-2 rounded hover:bg-purple-700 transition flex justify-center items-center gap-2 disabled:opacity-60"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>

        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-lg shadow hover:bg-gray-100 flex items-center justify-center gap-2"
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            className="w-5 h-5"
          />
          <span>Continue with Google</span>
        </button>
      </form>
    </div>
  );
}
