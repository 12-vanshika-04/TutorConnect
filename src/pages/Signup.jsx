import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { account, databases, ID } from "../utils/appwrite";
import { useDispatch } from "react-redux";
import { loginUser } from "../features/auth/authSlice"; // still optional if you need auto-login
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react"; // 👁 toggle icons

export default function Signup() {
  const { register, handleSubmit, reset } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (data) => {
    const { name, email, password, role } = data;

    // ✅ Password validation
    if (password.length < 8 || password.length > 256) {
      setErrorMessage("Password must be between 8 and 256 characters long.");
      return;
    }

    setErrorMessage(""); // clear previous errors

    try {
      console.log("Signup started:", data);

      // ✅ Step 1: Create account in Appwrite Auth
      const newUser = await account.create(ID.unique(), email, password, name);
      console.log("User created:", newUser);

      // ✅ Step 2: Auto-login (create session)
      await account.createEmailPasswordSession(email, password);
      console.log("Session created");

      // ✅ Step 3: Add document in 'users' collection
      await databases.createDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERS_TABLE_ID,
        ID.unique(),
        {
          name,
          email,
          role,
          userId: newUser.$id,
        }
      );

      console.log("User document added to DB");

      // ✅ Step 4: Redirect user to correct dashboard
      if (role === "student") navigate("/student-dashboard");
      else if (role === "tutor") navigate("/tutor-dashboard");
      else navigate("/");

      reset();
    } catch (err) {
      console.error("Signup error (details):", err);

      // 🟥 Friendly Appwrite error display
      if (err?.message?.includes("password")) {
        setErrorMessage("Password must be between 8 and 256 characters long.");
      } else if (err?.message?.includes("already exists")) {
        setErrorMessage("This email is already registered.");
      } else {
        setErrorMessage("Signup failed. Please check your details and try again.");
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>

        {/* Full name */}
        <input
          {...register("name")}
          type="text"
          placeholder="Full Name"
          className="border p-2 w-full mb-3 rounded focus:ring-2 focus:ring-purple-500 outline-none"
          required
        />

        {/* Email */}
        <input
          {...register("email")}
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-3 rounded focus:ring-2 focus:ring-purple-500 outline-none"
          required
        />

        {/* Password with show/hide */}
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

        {/* Role dropdown */}
        <select
          {...register("role")}
          className="border p-2 w-full mb-3 rounded focus:ring-2 focus:ring-purple-500 outline-none"
          required
        >
          <option value="">Select Role</option>
          <option value="student">Student</option>
          <option value="tutor">Tutor</option>
        </select>

        {/* 🔴 Error message display */}
        {errorMessage && (
          <div className="bg-red-100 text-red-600 text-sm text-center p-2 rounded mb-3">
            {errorMessage}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          className="bg-purple-600 text-white w-full py-2 rounded hover:bg-purple-700 transition"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
