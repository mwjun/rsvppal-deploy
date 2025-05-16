import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth }  from "../contexts/AuthContext";

export default function Protected({ children }: { children: React.ReactElement; }) {
  const { user, loading } = useAuth();

  if (loading) return <p className="p-6">Checking authentication…</p>;
  if (!user)    return <Navigate to="/signin" replace />;

  return children;
}
