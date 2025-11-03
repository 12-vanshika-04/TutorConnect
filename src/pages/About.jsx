import React from "react";

const About = () => {
  return (
    <div className="bg-white min-h-screen text-gray-800">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-indigo-100 via-purple-50 to-pink-100 py-16 px-8 md:px-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-purple-700 mb-4">
          About TutorConnect
        </h1>
        <p className="max-w-3xl mx-auto text-lg text-gray-700 leading-relaxed">
          TutorConnect helps students and parents find <strong>verified, trusted tutors</strong> nearby — 
          and empowers teachers to share knowledge safely through a 
          <strong> transparent, verified platform.</strong>
        </p>
      </section>

      {/* Mission Section */}
      <section className="px-8 md:px-20 py-16">
        <h2 className="text-3xl font-semibold text-purple-700 mb-6 text-center">
          Our Mission
        </h2>
        <div className="max-w-4xl mx-auto text-center text-gray-600 text-lg leading-relaxed">
          <p>
            We aim to bridge the gap between quality educators and learners by 
            creating a platform where <strong>trust and locality</strong> come first.
            With TutorConnect, finding the right tutor is easy, safe, and 
            completely transparent.
          </p>
        </div>
      </section>

      {/* Process Section */}
      <section className="bg-gray-50 px-8 md:px-20 py-16">
        <h2 className="text-3xl font-semibold text-purple-700 mb-10 text-center">
          How TutorConnect Works
        </h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow hover:shadow-lg transition text-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3534/3534139.png"
              alt="register"
              className="w-20 mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold mb-2 text-purple-700">
              Step 1: Register
            </h3>
            <p>
              Tutors register and submit their documents for secure verification.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow hover:shadow-lg transition text-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/992/992651.png"
              alt="verify"
              className="w-20 mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold mb-2 text-purple-700">
              Step 2: Verified & Listed
            </h3>
            <p>
              Once verified, tutors appear in the local listing for students to view and connect.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow hover:shadow-lg transition text-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3468/3468377.png"
              alt="learn"
              className="w-20 mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold mb-2 text-purple-700">
              Step 3: Learn & Grow
            </h3>
            <p>
              Students can contact tutors, attend demo sessions, and start learning safely and conveniently.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="px-8 md:px-20 py-16">
        <h2 className="text-3xl font-semibold text-purple-700 mb-10 text-center">
          Our Core Values
        </h2>

        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-purple-50 rounded-xl shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold mb-2 text-purple-700">Trust</h3>
            <p className="text-gray-600">
              Verified identities ensure that every tutor listed on the platform is authentic and reliable.
            </p>
          </div>

          <div className="p-6 bg-purple-50 rounded-xl shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold mb-2 text-purple-700">Transparency</h3>
            <p className="text-gray-600">
              Both tutors and students can communicate openly, with clear profiles and verified data.
            </p>
          </div>

          <div className="p-6 bg-purple-50 rounded-xl shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold mb-2 text-purple-700">Quality</h3>
            <p className="text-gray-600">
              We not only promote skilled educators but provide a source for part-time income who bring value, consistency, and excellence in learning.
            </p>
          </div>
        </div>
      </section>

      {/* Optional: Team Section */}
      {/* <section className="bg-gradient-to-r from-purple-100 to-indigo-100 px-8 md:px-20 py-16 text-center">
        <h2 className="text-3xl font-semibold text-purple-700 mb-8">
          Meet the Team
        </h2>
        <p className="max-w-3xl mx-auto text-gray-700 mb-10">
          TutorConnect was built by a passionate team of educators, designers, and developers
          who believe education should be accessible, personalized, and secure for everyone.
        </p>

        <div className="flex flex-wrap justify-center gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md w-60">
            <div className="w-24 h-24 rounded-full bg-purple-200 mx-auto mb-4"></div>
            <h3 className="font-semibold text-lg">Team Member</h3>
            <p className="text-sm text-gray-600">Developer</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md w-60">
            <div className="w-24 h-24 rounded-full bg-purple-200 mx-auto mb-4"></div>
            <h3 className="font-semibold text-lg">Team Member</h3>
            <p className="text-sm text-gray-600">UI/UX Designer</p>
          </div>
        </div>
      </section>

      Footer */}
      
    </div>
  );
};

export default About;
