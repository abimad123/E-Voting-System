// src/pages/HelpFAQ.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function HelpFAQ() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl p-6 mx-auto space-y-6 bg-white rounded shadow">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Help & FAQ for Voters</h1>
            <p className="text-sm text-gray-600">
              Understand how the E-Voting System works and how your vote is
              protected.
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-blue-600 hover:underline"
          >
            ⬅ Back to Dashboard
          </button>
        </div>

        {/* Section: How to use the system */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">1. How to use this E-Voting System?</h2>
          <ul className="pl-5 space-y-1 text-sm text-gray-700 list-disc">
            <li>
              <span className="font-semibold">Step 1 – Register:</span> Create
              an account with your name, email, password and ID details.
            </li>
            <li>
              <span className="font-semibold">Step 2 – KYC verification:</span>{" "}
              Upload your ID document. An admin will verify your details.
            </li>
            <li>
              <span className="font-semibold">Step 3 – Wait for approval:</span>{" "}
              Your status will show as <code>pending</code> until an admin
              reviews your ID. After approval, your status becomes{" "}
              <span className="font-semibold text-green-600">approved</span>.
            </li>
            <li>
              <span className="font-semibold">Step 4 – Vote:</span> Once
              verified and while the election is active, you can cast exactly{" "}
              <span className="font-semibold">one vote per election</span>.
            </li>
          </ul>
        </section>

        {/* Section: Why KYC */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">2. Why do we need KYC / ID verification?</h2>
          <p className="text-sm text-gray-700">
            This project focuses on <span className="font-semibold">secure, fair elections</span>.
            KYC (Know Your Customer) style verification helps us:
          </p>
          <ul className="pl-5 space-y-1 text-sm text-gray-700 list-disc">
            <li>Prevent fake or duplicate accounts voting.</li>
            <li>Ensure each real student/citizen gets exactly one vote.</li>
            <li>Allow admins to audit suspicious activity if needed.</li>
          </ul>
          <p className="text-sm text-gray-700">
            Your actual ID number is not stored directly – only a{" "}
            <span className="font-semibold">secure hash</span> is stored in the
            database for uniqueness checking.
          </p>
        </section>

        {/* Section: Who verifies you */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">3. Who verifies my account?</h2>
          <p className="text-sm text-gray-700">
            Only users with <span className="font-semibold">admin role</span>{" "}
            (for example, faculty or election organisers) can:
          </p>
          <ul className="pl-5 space-y-1 text-sm text-gray-700 list-disc">
            <li>View your uploaded ID document.</li>
            <li>Approve or reject your account.</li>
            <li>See system audit logs (for security and debugging).</li>
          </ul>
          <p className="text-sm text-gray-700">
            Normal voters cannot see other people&apos;s IDs or personal
            details.
          </p>
        </section>

        {/* Section: Why you can't see live vote counts */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            4. Why can’t I see live vote counts during the election?
          </h2>
          <p className="text-sm text-gray-700">
            To keep the election <span className="font-semibold">fair</span> and
            avoid bias:
          </p>
          <ul className="pl-5 space-y-1 text-sm text-gray-700 list-disc">
            <li>
              While the election is <span className="font-semibold">active</span>, 
              voters <span className="font-semibold">cannot see</span> the number
              of votes for each candidate in the UI.
            </li>
            <li>
              After the election <span className="font-semibold">ends</span>,
              the system shows a results page with total votes and winners.
            </li>
          </ul>
          <p className="text-sm text-gray-700">
            Internally, every vote is stored in the database and logged in the{" "}
            <span className="font-semibold">Audit Log</span> so that admins can
            review activity if required.
          </p>
        </section>

        {/* Section: One vote per election */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            5. How many times can I vote?
          </h2>
          <p className="text-sm text-gray-700">
            For each election, you can vote <span className="font-semibold">only once</span>.
          </p>
          <ul className="pl-5 space-y-1 text-sm text-gray-700 list-disc">
            <li>
              If you try to vote again in the same election, the system
              rejects it and shows an <code>Already voted</code> message.
            </li>
            <li>
              This is enforced at the database level (unique combination of
              voter + election).
            </li>
          </ul>
        </section>

        {/* Section: Privacy & Security */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            6. Is my vote private and secure?
          </h2>
          <ul className="pl-5 space-y-1 text-sm text-gray-700 list-disc">
            <li>Passwords are stored as <span className="font-semibold">bcrypt hashes</span>, not plain text.</li>
            <li>Each request uses a <span className="font-semibold">JWT token</span> for authenticated APIs.</li>
            <li>ID numbers are stored as hashed values, not raw numbers.</li>
            <li>Admins can see <span className="font-semibold">who voted</span> in an election (for audit),
                but the UI is designed to show aggregate results to normal users.</li>
          </ul>
        </section>

        {/* Section: Troubleshooting */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            7. Common problems & solutions
          </h2>
          <ul className="pl-5 space-y-1 text-sm text-gray-700 list-disc">
            <li>
              <span className="font-semibold">I can’t vote:</span> Check if your
              status is <code>approved</code> on the dashboard. If it&apos;s
              pending, wait for admin to verify you.
            </li>
            <li>
              <span className="font-semibold">Button says “Ended”:</span> The
              election end time is over. You can still view the results.
            </li>
            <li>
              <span className="font-semibold">Button says “Already voted”:</span>{" "}
              You have already cast your vote in this election.
            </li>
            <li>
              <span className="font-semibold">Got logged out:</span> Your token
              may have expired. Just log in again with your email and password.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
