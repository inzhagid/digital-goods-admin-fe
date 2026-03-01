import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./app/auth/AuthContext.jsx";
import { worker } from "./mocks/browser.js";

const enableMocking = async () => {
  if (!import.meta.env.DEV) return;
  await worker.start();
};

enableMocking().then(() => {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>,
  );
});
