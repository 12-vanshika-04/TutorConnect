import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { databases } from "../utils/appwrite";
import { Query } from "appwrite";
import { Eye, EyeOff } from "lucide-react"; // 👁 icons

export default function Login() {
  const { register, handleSubmit } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, error } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const onSubmit = async (data) => {
    // ✅ Password validation before API call
    if (data.password.length < 8 || data.password.length > 256) {
      setLocalError("Password must be between 8 and 256 characters long.");
      return;
    }

    setLocalError(""); // clear old errors

    try {
      await dispatch(loginUser(data)).unwrap();
    } catch (err) {
      setLocalError("Login failed. Please try again.");
      console.error(err);
    }
  };

  // ✅ Redirect after successful login
  useEffect(() => {
    const fetchRoleAndRedirect = async () => {
      if (user?.$id) {
        const res = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_USERS_TABLE_ID,
          [Query.equal("userId", user.$id)]
        );

        if (res.documents.length > 0) {
          const role = res.documents[0].role;
          navigate(role === "tutor" ? "/tutor-dashboard" : "/student-dashboard");
        }
      }
    };
    fetchRoleAndRedirect();
  }, [user, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        {/* Email input */}
        <input
          {...register("email")}
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-3 rounded focus:ring-2 focus:ring-purple-500 outline-none"
          required
        />

        {/* Password input with toggle */}
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

        {/* 🔴 Error Message */}
        {(localError || error) && (
          <div className="bg-red-100 text-red-600 text-sm text-center p-2 rounded mb-3">
            {localError || error}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          className="bg-purple-600 text-white w-full py-2 rounded hover:bg-purple-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}
