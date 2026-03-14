import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Apply dark mode immediately before React renders to avoid flash
const savedTheme = localStorage.getItem("theme") || "dark";
document.documentElement.classList.add(savedTheme);

createRoot(document.getElementById("root")!).render(<App />);
