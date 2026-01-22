import React from "react";
import Camera from "./components/Camera";
import Dashboard from "./components/Dashboard";

export default function App() {
  return (
    <>
      <div className="blob blob-blue"></div>
      <div className="blob blob-purple"></div>
      <div className="blob blob-green"></div>

      <div className="min-h-screen p-8 grid grid-cols-3 gap-6">
        <h1 className="col-span-3 text-center text-4xl font-bold neon-text">
          WakeGuard – Real-Time AI Vision System
        </h1>

        <Camera />
        <Dashboard />
      </div>
    </>
  );
}
