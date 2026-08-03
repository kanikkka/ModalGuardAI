import React from "react";
import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import KnowledgeGraph from "./pages/KnowledgeGraph";
import CrashTestLab from "./pages/CrashTestLab";
import TreatmentEngine from "./pages/TreatmentEngine";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import UploadDataset from "./pages/UploadDataset";
import HealthReport from "./pages/HealthReport";
import BlackBox from "./pages/BlackBox";
import FailureReplay from "./pages/FailureReplay";
import ModelDNA from "./pages/ModelDNA";
import AIInvestigation from "./pages/AIInvestigation";
import LLMReport from "./pages/LLMReport";
function ModulePlaceholder({ title, description }) {
  return (
    <section
      style={{
        padding: "35px",
        border: "1px solid #e8e6f0",
        borderRadius: "25px",
        background: "rgba(255,255,255,0.95)",
        boxShadow:
          "0 18px 45px rgba(66,52,104,0.07)",
      }}
    >
      <p
        style={{
          margin: "0 0 6px",
          color: "#7c3aed",
          fontSize: "10px",
          fontWeight: "800",
          letterSpacing: "1.2px",
        }}
      >
        MODELGUARD MODULE
      </p>

      <h2
        style={{
          margin: 0,
          fontSize: "28px",
        }}
      >
        {title}
      </h2>

      <p
        style={{
          maxWidth: "650px",
          margin: "12px 0 0",
          color: "#757589",
          lineHeight: 1.7,
        }}
      >
        {description}
      </p>
    </section>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />

          <Route
            path="/upload"
            element={<UploadDataset />}
          />

          <Route
  path="/crash-tests"
  element={<CrashTestLab />}
/>

          <Route
  path="/health-report"
  element={<HealthReport />}
/>

          <Route
  path="/blackbox"
  element={<BlackBox />}
/>

<Route
  path="/treatment"
  element={<TreatmentEngine />}
/>

          <Route
  path="/failure-replay"
  element={<FailureReplay />}
/>

          <Route
            path="/treatment"
            element={
              <ModulePlaceholder
                title="Treatment Engine"
                description="Issue-specific corrective actions and deployment advice."
              />
            }
          />

          
<Route
  path="/model-dna"
  element={<ModelDNA />}
/>
          
<Route
  path="/knowledge-graph"
  element={<KnowledgeGraph />}
/>

          <Route
  path="/agents"
  element={<AIInvestigation />}
/>
<Route
  path="/llm-report"
  element={<LLMReport />}
/>
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;