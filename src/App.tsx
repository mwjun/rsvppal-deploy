import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateEvent       from "./pages/CreateEvent";
import RSVPPage          from "./pages/RSVPPage";
import CreatorDashboard  from "./pages/CreatorDashboard";
import SignUp            from "./pages/SignUp";
import SignIn            from "./pages/SignIn";
import Protected         from "./components/Protected";
import { useAuth }       from "./contexts/AuthContext";

/* 🔹 small logout bar */
function TopBar() {
  const { user, signOutUser } = useAuth();
  if (!user) return null;               // hide when signed-out

  return (
    <header className="p-2 text-right">
      <button onClick={signOutUser} className="text-sm underline">
        Log out
      </button>
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <TopBar />               {/* ← render it */}
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/"       element={<CreateEvent />} />
        <Route path="/rsvp/:eventId" element={<RSVPPage />} />
        <Route
          path="/dashboard/:eventId/:token"
          element={
            <Protected>
              <CreatorDashboard />
            </Protected>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
