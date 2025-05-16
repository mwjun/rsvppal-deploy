import React, { useState, ChangeEvent } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db }            from "../firebase";
import { Navigate }      from "react-router-dom";
import { useAuth }       from "../contexts/AuthContext";

export default function CreateEvent() {
  /* 1️⃣ auth */
  const { user, loading } = useAuth();

  /* 2️⃣ hooks (unconditional) */
  const [name, setName]        = useState("");
  const [date, setDate]        = useState("");
  const [description, setDesc] = useState("");
  const [slug, setSlug]        = useState("");

  const [shareLink, setShareLink] = useState("");
  const [dashLink,  setDashLink]  = useState("");

  const [errors, setErrors] = useState<{name?:string; date?:string; slug?:string}>({});

  /* 3️⃣ guard */
  if (loading) return <p className="p-6">Loading…</p>;
  if (!user)   return <Navigate to="/signin" replace />;

  /* helper */
  const handleInput =
    (updater: (v:string)=>void) =>
    (e:ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
      setShareLink(""); setDashLink("");
      updater(e.target.value);
    };

  const canGenerate = Boolean(name.trim() && date);

  /* submit */
  async function handleCreate() {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Event name is required.";
    if (!date)        newErrors.date = "Event date is required.";

    /* slug logic */
    const rawSlug     = slug.trim();
    const slugPattern = /^[a-zA-Z0-9-]+$/;
    let   eventId     = rawSlug || Math.random().toString(36).substring(2, 9);

    if (rawSlug) {
      if (!slugPattern.test(rawSlug)) {
        newErrors.slug = "Slug can use letters, numbers, and hyphens only.";
      } else {
        /* 🔍 collision check */
        const exists = (await getDoc(doc(db, "events", rawSlug))).exists();
        if (exists) newErrors.slug = "That slug is taken—try another.";
      }
    }

    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setErrors({});

    try {
      const secret = Math.random().toString(36).substring(2,8);

      console.log("ownerId about to write =", user!.uid);

      await setDoc(doc(db, "events", eventId), {
        name, date, description,
        ownerId: user!.uid,
        token:   secret,
        createdAt: new Date(),
      });

      const base = window.location.origin;
      setShareLink(`${base}/rsvp/${eventId}`);
      setDashLink (`${base}/dashboard/${eventId}/${secret}`);
    } catch (err) {
      console.error("Firestore error:", err);
      alert("Could not save event—please try again.");
    }
  }

  /* JSX */
  return (
    <div className="p-6 max-w-md mx-auto mt-12 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Create Your Event</h1>

      {/* name */}
      <label className="block mb-2">
        <span className="font-medium">Event Name</span>
        <input
          type="text"
          className="mt-1 block w-full border rounded p-2"
          value={name}
          onChange={handleInput(setName)}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </label>

      {/* date */}
      <label className="block mb-2">
        <span className="font-medium">Event Date</span>
        <input
          type="date"
          className="mt-1 block w-full border rounded p-2"
          value={date}
          onChange={handleInput(setDate)}
        />
        {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
      </label>

      {/* description */}
      <label className="block mb-4">
        <span className="font-medium">Description (optional)</span>
        <textarea
          rows={3}
          className="mt-1 block w-full border rounded p-2"
          value={description}
          onChange={handleInput(setDesc)}
        />
      </label>

      {/* slug */}
      <label className="block mb-4">
        <span className="font-medium">Custom URL Slug (optional)</span>
        <input
          type="text"
          placeholder="e.g. my-birthday"
          className="mt-1 block w-full border rounded p-2"
          value={slug}
          onChange={handleInput(setSlug)}
        />
        {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
      </label>

      {/* button */}
      <button
        onClick={handleCreate}
        disabled={!canGenerate}
        className={`w-full py-2 mb-4 text-white rounded ${
          canGenerate ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-blue-300 cursor-not-allowed"
        }`}
      >
        Generate Links
      </button>

      {/* links */}
      {shareLink && (
        <p className="mb-2">
          RSVP URL: <a href={shareLink} className="text-blue-600 underline">{shareLink}</a>
        </p>
      )}
      {dashLink && (
        <p>
          Dashboard URL: <a href={dashLink} className="text-blue-600 underline">{dashLink}</a>
        </p>
      )}
    </div>
  );
}
