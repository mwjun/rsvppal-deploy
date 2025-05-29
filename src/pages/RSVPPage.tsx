import React, { useState, useEffect, ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "../firebase";

/* ---------- types ---------- */
type EventData = { name: string; date: string; description: string };

type Guest = {
  id?: string;
  name: string;
  response: "yes" | "no" | "maybe";
};

/* emoji map */
const responseLabelMap: Record<
  Guest["response"],
  { emoji: string; label: string }
> = {
  yes: { emoji: "✅", label: "Going" },
  no: { emoji: "❌", label: "Not going" },
  maybe: { emoji: "🤔", label: "Maybe" },
};

export default function RSVPPage() {
  const { eventId } = useParams<{ eventId: string }>();

  const [event, setEvent] = useState<EventData | null>(null);
  const [guestList, setGuests] = useState<Guest[]>([]);
  const [name, setName] = useState("");
  const [response, setResp] = useState<Guest["response"]>("yes");
  const [nameError, setNameError] = useState("");

  /* ---------- load event & RSVPs ---------- */
  useEffect(() => {
    if (!eventId) return;

    /* 1️⃣  event document */
    async function loadEvent() {
      const evSnap = await getDoc(doc(db, "events", eventId!));
      if (!evSnap.exists()) {
        setEvent(null);
        return;
      }
      setEvent(evSnap.data() as EventData);
    }
    loadEvent();

    /* 2️⃣  live RSVPs listener */
    const unsub = onSnapshot(
      collection(doc(db, "events", eventId!), "rsvps"),
      (snap) => {
        setGuests(
          snap.docs.map(
            (d) => ({ id: d.id, ...(d.data() as DocumentData) } as Guest)
          )
        );
      }
    );
    return unsub; // cleanup on unmount
  }, [eventId]);

  /* ---------- submit new RSVP ---------- */
  const handleSubmit = async () => {
    if (!name.trim()) {
      setNameError("Please enter your name.");
      return;
    }
    setNameError("");

    await addDoc(
      collection(doc(db, "events", eventId!), "rsvps"),
      { name, response }
    );

    // local optimistic update (optional, onSnapshot will also add it)
    setGuests((prev) => [...prev, { name, response }]);
    setName("");
    alert("RSVP received—thanks!");
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (nameError) setNameError("");
  };

  /* ---------- render ---------- */
  if (event === null) {
    return (
      <div className="p-6 max-w-md mx-auto mt-12">
        <p className="text-red-500">Event not found.</p>
      </div>
    );
  }
  if (!event) {
    return (
      <div className="p-6 max-w-md mx-auto mt-12">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto mt-12 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-2">{event.name}</h1>
      <p className="text-gray-600 mb-4">
        {new Date(event.date).toLocaleDateString()} — {event.description}
      </p>

      {/* RSVP form */}
      <h2 className="text-xl font-semibold mb-2">RSVP</h2>
      <input
        type="text"
        placeholder="Your Name"
        className="w-full mb-2 p-2 border rounded"
        value={name}
        onChange={handleNameChange}
      />
      {nameError && <p className="text-red-500 text-sm mb-2">{nameError}</p>}

      <select
        className="w-full mb-4 p-2 border rounded"
        value={response}
        onChange={(e) => setResp(e.target.value as Guest["response"])}
      >
        <option value="yes">Yes, I’ll be there</option>
        <option value="no">Sorry, can’t make it</option>
        <option value="maybe">I might be able to make it</option>
      </select>

      <button
        onClick={handleSubmit}
        disabled={!name.trim()}
        className={`w-full py-2 rounded mb-6 text-white ${
          name.trim()
            ? "bg-green-600 hover:bg-green-700"
            : "bg-green-300 cursor-not-allowed"
        }`}
      >
        Submit RSVP
      </button>

      {/* Guest list */}
      <h2 className="text-xl font-semibold mb-2">Guest List</h2>
      {guestList.length === 0 ? (
        <p className="text-gray-500">No responses yet.</p>
      ) : (
        <ul className="list-disc pl-5">
          {guestList.map((g, i) => {
            const { emoji, label } = responseLabelMap[g.response];
            return (
              <li key={g.id ?? i}>
                {emoji} {g.name} — {label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
