import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

/* ---------- types ---------- */
type Guest = {
  id: string;
  name: string;
  response: "yes" | "no" | "maybe";
};
type EventData = {
  name: string;
  date: string;
  description: string;
  ownerId: string | null;
  token: string;
};

export default function CreatorDashboard() {
  const { eventId, token } = useParams<{ eventId: string; token: string }>();

  const [event, setEvent] = useState<EventData | null | undefined>(undefined);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filter, setFilter] =
    useState<"all" | "yes" | "no" | "maybe">("all");

  /* ---------- load everything once ---------- */
  useEffect(() => {
    if (!eventId || !token) return;

    async function load() {
      /* 1️⃣ event document */
      const evSnap = await getDoc(doc(db, "events", eventId!));
      if (!evSnap.exists()) return setEvent(null);
      const ev = evSnap.data() as EventData;

      /* token must match */
      if (ev.token !== token) return setEvent(null);
      setEvent(ev);

      /* 2️⃣ RSVPs sub-collection */
      const snap = await getDocs(collection(evSnap.ref, "rsvps"));
      setGuests(
        snap.docs.map(
          (d) =>
            ({
              id: d.id,
              ...(d.data() as Omit<Guest, "id">),
            }) as Guest
        )
      );
    }

    load();
  }, [eventId, token]);

  /* ---------- delete guest ---------- */
  const deleteGuest = async (guest: Guest) => {
    if (!eventId) return;
    await deleteDoc(
      doc(db, "events", eventId, "rsvps", guest.id)
    );
    setGuests((prev) => prev.filter((g) => g.id !== guest.id));
  };

  /* ---------- guards ---------- */
  if (event === null) return <Navigate to="/" replace />;
  if (event === undefined)
    return <p className="p-6">Loading dashboard…</p>;

  /* ---------- filter ---------- */
  const visible = guests.filter(
    (g) => filter === "all" || g.response === filter
  );

  /* ---------- render ---------- */
  return (
    <div className="p-6 max-w-lg mx-auto mt-12 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">
        Dashboard: {event.name}
      </h1>
      <p className="text-gray-600 mb-6">
        {new Date(event.date).toLocaleDateString()} — {event.description}
      </p>

      {/* filter buttons */}
      <div className="mb-4 space-x-2">
        {(["all", "yes", "no", "maybe"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {f === "all"
              ? "All"
              : f === "yes"
              ? "Going"
              : f === "no"
              ? "Not going"
              : "Maybe"}
          </button>
        ))}
      </div>

      {/* guest list */}
      {visible.length === 0 ? (
        <p className="text-gray-500">No guests for this filter.</p>
      ) : (
        <ul className="space-y-2">
          {visible.map((g) => (
            <li
              key={g.id}
              className="flex justify-between items-center border p-2 rounded"
            >
              <span>
                {g.name} —{" "}
                {g.response === "yes"
                  ? "✅"
                  : g.response === "no"
                  ? "❌"
                  : "🤔"}
              </span>
              <button
                onClick={() => deleteGuest(g)}
                className="text-red-500 hover:underline text-sm"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
