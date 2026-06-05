import React from "react";
import { createRoot } from "react-dom/client";
import RicchaadoAcademy from "./App.jsx";
import { AuthProvider } from "./lib/auth.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RicchaadoAcademy />
    </AuthProvider>
  </React.StrictMode>
);
