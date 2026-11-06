import "./index.css";
import App from "./App";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthContextProvider } from "./store/auth-context";
import { QueryProvider } from "./store/QueryProvider";
import { registerServiceWorker } from "./pwa/serviceWorker";
import { watchTheme } from "./theme";
const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <AuthContextProvider>
    <QueryProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryProvider>
  </AuthContextProvider>
);

registerServiceWorker();
watchTheme();

