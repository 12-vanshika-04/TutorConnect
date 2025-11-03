import React, { useEffect, useState } from "react";
import { account, databases } from "../utils/appwrite";
import { Query } from "appwrite";

export default function AdminVerifyTutors() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const dbId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  const tutorsColId = import.meta.env.VITE_APPWRITE_TUTORS_TABLE_ID;

  // ✅ Admin emails from environment variable
  const adminEmails = import.meta.env.VITE_ADMIN_EMAILS.split(",").map((e) =>
    e.trim()
  );

  // 🔹 Step 1: Verify admin access
  useEffect(() => {
    const init = async () => {
      try {
        const user = await account.get();
        if (adminEmails.includes(user.email)) {
          setIsAdmin(true);
          await fetchPendingTutors();
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Error verifying admin:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // 🔹 Step 2: Fetch tutors with status "pending"
  const fetchPendingTutors = async () => {
    try {
      const res = await databases.listDocuments(dbId, tutorsColId, [
        Query.equal("verified", [false]),
      ]);
      setTutors(res.documents);
    } catch (err) {
      console.error("Error fetching tutors:", err);
    }
  };

  // 🔹 Step 3: Verify tutor
  const handleVerify = async (tutorId) => {
    try {
      await databases.updateDocument(dbId, tutorsColId, tutorId, {
        verified: true,

      });
      setTutors((prev) => prev.filter((t) => t.$id !== tutorId));
      alert("✅ Tutor verified successfully!");
    } catch (err) {
      console.error("Error verifying tutor:", err);
      alert("Failed to verify tutor.");
    }
  };

  // 🔹 Step 4: Reject tutor (mark as rejected, keep record)
  const handleReject = async (tutorId) => {
    try {
      await databases.updateDocument(dbId, tutorsColId, tutorId, {
        verified: false,
      });
      setTutors((prev) => prev.filter((t) => t.$id !== tutorId));
      alert("❌ Tutor request marked as rejected.");
    } catch (err) {
      console.error("Error rejecting tutor:", err);
      alert("Failed to reject tutor.");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  if (!isAdmin)
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        ❌ Access Denied — Only Admins Can Access This Page
      </div>
    );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-purple-700">
        Admin Panel — Pending Tutor Requests
      </h2>

      {tutors.length === 0 ? (
        <p className="text-gray-600">No new tutor requests pending ✅</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tutors.map((tutor) => (
            <div
              key={tutor.$id}
              className="border border-gray-200 p-4 rounded-xl shadow bg-white"
            >
              <h3 className="text-lg font-semibold text-purple-700">
                {tutor.name}
              </h3>
              <p>Name: {tutor.name}</p>
              <p>Email: {tutor.email}</p>
              <p>Phone: {tutor.phone}</p>
              <p>Subject: {tutor.subject}</p>
              <p className="mt-2 text-sm text-yellow-600 font-medium">
                Status: Pending Verification ⏳
              </p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleVerify(tutor.$id)}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  ✅ Verify
                </button>
                <button
                  onClick={() => handleReject(tutor.$id)}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
