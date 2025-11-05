import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { account, databases, ID } from "../utils/appwrite";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Query } from "appwrite";

const DB = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const USERS_COLLECTION = import.meta.env.VITE_APPWRITE_USERS_TABLE_ID;
const TUTORS_TABLE = import.meta.env.VITE_APPWRITE_TUTORS_TABLE_ID;

export default function Signup() {
  const { register, handleSubmit, reset } = useForm();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [googleUser, setGoogleUser] = useState(null);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  // ------------------ Handle Google OAuth after redirect ------------------
  useEffect(() => {
    const handleGoogleUser = async () => {
      try {
        const user = await account.get();
        if (!user) return;

        // Check if user exists in collection
        const res = await databases.listDocuments(DB, USERS_COLLECTION, [
          Query.equal("userId", user.$id),
        ]);

        if (res.documents.length === 0) {
          setGoogleUser(user);
          setShowRoleSelection(true); // New Google user → select role
        } else {
          const role = res.documents[0].role;
          if (!role) navigate("/select-role");
          else if (role === "student") navigate("/student-dashboard");
          else navigate("/tutor-dashboard");
        }
      } catch (err) {
        console.log("No active Google session yet", err);
      }
    };
    handleGoogleUser();
  }, [navigate]);

  // ------------------------ Standard Email/Password Signup ------------------------
  const onSubmit = async (data) => {
    const { name, email, password } = data;
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      // Create user account
      const newUser = await account.create(ID.unique(), email, password, name);
      await account.createEmailPasswordSession(email, password);

      // Add user to users collection
      await databases.createDocument(
        DB,
        USERS_COLLECTION,
        ID.unique(),
        {
          name,
          email,
          userId: newUser.$id,
          role: null, // will select role later
        },
        ["*"], // read permissions
        ["*"]  // write permissions
      );

      navigate("/select-role"); // redirect to role selection page
      reset();
    } catch (err) {
      console.error("Signup error:", err);
      if (err?.message?.includes("already exists")) {
        setErrorMessage("This email is already registered.");
      } else {
        setErrorMessage("Signup failed. Try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------------ Google OAuth Signup/Login ------------------------
  const handleGoogleLogin = async () => {
    try {
      await account.createOAuth2Session(
        "google",
        window.location.origin,
        window.location.origin
      );
    } catch (err) {
      console.error("Google login error:", err);
    }
  };

  // ------------------------ Render ------------------------
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {/* 🔹 Standard Signup Form */}
      {!showRoleSelection && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-6 rounded-lg shadow-md w-full max-w-md"
        >
          <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>

          <input
            {...register("name")}
            type="text"
            placeholder="Full Name"
            className="border p-2 w-full mb-3 rounded focus:ring-2 focus:ring-purple-500 outline-none"
            required
          />

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
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </button>

          <hr className="my-4" />

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="bg-red-500 text-white w-full py-2 rounded hover:bg-red-600 transition"
          >
            Continue with Google
          </button>
        </form>
      )}

      {/* 🔹 Role Selection for Google users */}
      {showRoleSelection && googleUser && (
        <div className="p-6 max-w-md mx-auto bg-white rounded shadow">
          <h2 className="text-xl font-bold mb-4">Select Your Role</h2>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="border p-2 w-full rounded mb-4"
          >
            <option value="">Select Role</option>
            <option value="student">Student</option>
            <option value="tutor">Tutor</option>
          </select>
          <button
            onClick={async () => {
              if (!selectedRole) return alert("Please select a role");

              // Insert Google user into users collection with permissions
              const userDoc = await databases.createDocument(
                DB,
                USERS_COLLECTION,
                ID.unique(),
                {
                  name: googleUser.name,
                  email: googleUser.email,
                  userId: googleUser.$id,
                  role: selectedRole,
                },
                ["*"],
                ["*"]
              );

              // ✅ If tutor, create tutor document linked to users collection
              if (selectedRole === "tutor") {
                await databases.createDocument(
                  DB,
                  TUTORS_TABLE,
                  ID.unique(),
                  {
                    userId: googleUser.$id, // link to users.$id
                    name: googleUser.name,
                    email: googleUser.email,
                    phone: "",       // optional
                    subject: "",     // optional
                    experience: "",  // optional
                  },
                  ["*"],
                  ["*"]
                );
              }

              // Navigate to dashboard
              if (selectedRole === "student")
                navigate("/student-dashboard");
              else navigate("/tutor-dashboard");
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded w-full"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
