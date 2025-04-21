
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import MotelDetails from "./pages/MotelDetails.jsx";
import RoomDetails from "./pages/RoomDetails.jsx";
import "./index.css";
import "./styles/rich-text.css";
import { Toaster } from "@/components/ui/toaster";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/motel/:id" element={<MotelDetails />} />
        <Route path="/motel/:motelId/room/:roomId" element={<RoomDetails />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  </React.StrictMode>
);
