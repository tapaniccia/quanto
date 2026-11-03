import LegalCenter from './LegalCenter.jsx';
import React from "react";
import ReactDOM from "react-dom/client";
import "./storageShim.js";
import "./index.css";
import App from "./App.jsx";
import CloudGate from "./CloudGate.jsx";
import "./workspaceLayout.css";
import "./sectionRefresh.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LegalCenter><CloudGate><App /></CloudGate></LegalCenter>
  </React.StrictMode>
);
