import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Dna,
  FileText,
  FlaskConical,
  Gauge,
  LoaderCircle,
  Network,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Workflow,
} from "lucide-react";

import api from "../services/api";

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [blackBoxEvents, setBlackBoxEvents] = useState([]);
  const [dnaRegistry, setDnaRegistry] = useState([]);
  const [error, setError] = useState("");

  const trainingResult = useMemo(
    () => readLocalStorageJSON("modelguard_training_result"),
    []
  );

  const crashResult = useMemo(
    () => readLocalStorageJSON("modelguard_crash_result"),
    []
  );

  const healthReport = useMemo(
    () => readLocalStorageJSON("modelguard_health_report"),
    []
  );

  const investigation = useMemo(
    () => readLocalStorageJSON("modelguard_investigation"),
    []
  );

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const requests = [
        api.get("/blackbox/history"),
        api.get("/model-dna/registry"),
      ];

      const [blackBoxResponse, dnaResponse] =
        await Promise.allSettled(requests);

      if (blackBoxResponse.status === "fulfilled") {
        setBlackBoxEvents(
          blackBoxResponse.value.data?.events || []
        );
      }

      if (dnaResponse.status === "fulfilled") {
        setDnaRegistry(
          dnaResponse.value.data?.models || []
        );
      }

      if (
        blackBoxResponse.status === "rejected" &&
        dnaResponse.status === "rejected"
      ) {
        setError(
          "Backend data load nahi ho paaya. Backend running check karo."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const latestDNA = dnaRegistry[0] || null;

  const latestEvent =
    blackBoxEvents.length > 0
      ? blackBoxEvents[blackBoxEvents.length - 1]
      : null;

  const healthScore =
    healthReport?.health_score ??
    trainingResult?.metrics?.accuracy * 100 ??
    null;

  const deploymentStatus =
    healthReport?.deployment?.deployment ||
    latestDNA?.deployment_status ||
    investigation?.final_verdict ||
    "NOT EVALUATED";

  const crashScore =
    crashResult?.robustness_score ??
    crashResult?.health_score ??
    null;

  const latestInvestigation =
    investigation?.final_verdict
      ? investigation
      : null;

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <Sparkles size={15} />
            Dynamic ML reliability workspace
          </div>

          <h1 style={styles.heroTitle}>
            Monitor every model
            <br />
            <span style={styles.heroHighlight}>
              before deployment.
            </span>
          </h1>

          <p style={styles.heroDescription}>
            Latest model, health score, crash-test summary,
            deployment status, Model DNA and multi-agent verdict
            ek hi dashboard par.
          </p>

          <div style={styles.heroActions}>
            <Link to="/upload" style={styles.primaryAction}>
              Upload New Dataset
              <ArrowRight size={18} />
            </Link>

            <button
              type="button"
              onClick={loadDashboardData}
              style={styles.secondaryAction}
            >
              <RefreshCw size={17} />
              Refresh Data
            </button>
          </div>
        </div>

        <div style={styles.heroVisual}>
          <div style={styles.gaugeRing}>
            <strong style={styles.gaugeValue}>
              {formatScore(healthScore)}
            </strong>
            <span style={styles.gaugeLabel}>
              Health Score
            </span>
          </div>

          <div style={styles.floatingStatus}>
            <ShieldCheck size={18} />
            <div>
              <span style={styles.smallMuted}>
                Deployment
              </span>
              <strong>{deploymentStatus}</strong>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div style={styles.errorBox}>
          <AlertTriangle size={19} />
          <span>{error}</span>
        </div>
      )}

      <section style={styles.statsGrid}>
        <StatCard
          title="Latest Model"
          value={
            trainingResult?.algorithm ||
            latestDNA?.algorithm ||
            "No model yet"
          }
          subtitle={
            trainingResult?.model_file_name ||
            latestDNA?.model_file_name ||
            "Train a model to begin"
          }
          icon={BrainCircuit}
          background="#f3e8ff"
          color="#7c3aed"
          path="/upload"
        />

        <StatCard
          title="Health Score"
          value={formatScore(healthScore)}
          subtitle={
            healthReport?.grade
              ? `Grade ${healthReport.grade}`
              : "Generate health report"
          }
          icon={Gauge}
          background="#dcfce7"
          color="#059669"
          path="/health-report"
        />

        <StatCard
          title="Crash Test"
          value={
            crashScore !== null
              ? `${formatScore(crashScore)}`
              : "Not run"
          }
          subtitle={
            crashResult?.grade
              ? `Grade ${crashResult.grade}`
              : "Run reliability tests"
          }
          icon={FlaskConical}
          background="#fce7f3"
          color="#db2777"
          path="/crash-tests"
        />

        <StatCard
          title="Deployment"
          value={deploymentStatus}
          subtitle={
            healthReport?.deployment?.reason ||
            "No deployment decision yet"
          }
          icon={ShieldCheck}
          background="#e0f2fe"
          color="#0284c7"
          path="/health-report"
          small
        />
      </section>

      <section style={styles.twoColumnGrid}>
        <article style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <p style={styles.sectionLabel}>
                RECENT MODEL DNA
              </p>
              <h2 style={styles.panelTitle}>
                Latest Registered Identity
              </h2>
            </div>

            <Dna size={24} color="#7c3aed" />
          </div>

          {loading ? (
            <LoadingState />
          ) : latestDNA ? (
            <div style={styles.dnaContent}>
              <InfoRow
                label="Model ID"
                value={latestDNA.model_id}
              />
              <InfoRow
                label="Algorithm"
                value={latestDNA.algorithm}
              />
              <InfoRow
                label="Fingerprint"
                value={latestDNA.fingerprint}
              />
              <InfoRow
                label="Grade"
                value={latestDNA.grade}
              />
              <InfoRow
                label="Version"
                value={
                  latestDNA.registry_version ||
                  latestDNA.dna_version ||
                  "v1"
                }
              />
            </div>
          ) : (
            <EmptyState
              text="Abhi koi Model DNA registered nahi hai."
            />
          )}

          <Link to="/model-dna" style={styles.panelLink}>
            Open Model DNA
            <ArrowRight size={16} />
          </Link>
        </article>

        <article style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <p style={styles.sectionLabel}>
                LATEST INVESTIGATION
              </p>
              <h2 style={styles.panelTitle}>
                Multi-Agent Verdict
              </h2>
            </div>

            <Workflow size={24} color="#a21caf" />
          </div>

          {latestInvestigation ? (
            <div style={styles.investigationBox}>
              <div
                style={{
                  ...styles.verdictBadge,
                  ...getVerdictStyle(
                    latestInvestigation.final_verdict
                  ),
                }}
              >
                {latestInvestigation.final_verdict}
              </div>

              <InfoRow
                label="Risk Level"
                value={latestInvestigation.risk_level}
              />

              <InfoRow
                label="Investigation ID"
                value={
                  latestInvestigation.investigation_id
                }
              />
            </div>
          ) : (
            <EmptyState
              text="Abhi koi AI investigation run nahi hui."
            />
          )}

          <Link to="/agents" style={styles.panelLink}>
            Run AI Investigation
            <ArrowRight size={16} />
          </Link>
        </article>
      </section>

      <section style={styles.twoColumnGrid}>
        <article style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <p style={styles.sectionLabel}>
                CRASH TEST SUMMARY
              </p>
              <h2 style={styles.panelTitle}>
                Reliability Weaknesses
              </h2>
            </div>

            <Activity size={24} color="#db2777" />
          </div>

          {crashResult ? (
            <div style={styles.crashGrid}>
              <MiniMetric
                label="Noise"
                value={
                  crashResult.noise_test
                    ?.prediction_stability
                }
              />

              <MiniMetric
                label="Missing"
                value={
                  crashResult.missing_value_test
                    ?.prediction_stability
                }
              />

              <MiniMetric
                label="Outlier"
                value={
                  crashResult.outlier_test
                    ?.prediction_stability
                }
              />

              <MiniMetric
                label="Drift"
                value={
                  crashResult.feature_drift_test
                    ?.prediction_stability ??
                  crashResult.feature_drift_test
                    ?.overall_stability
                }
              />
            </div>
          ) : (
            <EmptyState
              text="Crash Test Lab result available nahi hai."
            />
          )}

          <Link to="/crash-tests" style={styles.panelLink}>
            Open Crash Test Lab
            <ArrowRight size={16} />
          </Link>
        </article>

        <article style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <p style={styles.sectionLabel}>
                BLACK BOX ACTIVITY
              </p>
              <h2 style={styles.panelTitle}>
                Latest Recorded Event
              </h2>
            </div>

            <Activity size={24} color="#059669" />
          </div>

          {loading ? (
            <LoadingState />
          ) : latestEvent ? (
            <div style={styles.eventBox}>
              <div style={styles.eventStatus}>
                <CheckCircle2 size={18} />
                {latestEvent.status || "UNKNOWN"}
              </div>

              <InfoRow
                label="Event"
                value={formatText(
                  latestEvent.event_type
                )}
              />

              <InfoRow
                label="Model"
                value={
                  latestEvent.model_file_name ||
                  "Not linked"
                }
              />

              <InfoRow
                label="Created"
                value={formatDate(
                  latestEvent.created_at
                )}
              />
            </div>
          ) : (
            <EmptyState
              text="Black Box me abhi koi event nahi hai."
            />
          )}

          <Link to="/blackbox" style={styles.panelLink}>
            Open Black Box
            <ArrowRight size={16} />
          </Link>
        </article>
      </section>

      <section style={styles.quickActionsSection}>
        <div>
          <p style={styles.sectionLabel}>QUICK ACTIONS</p>
          <h2 style={styles.panelTitle}>
            Continue Reliability Workflow
          </h2>
        </div>

        <div style={styles.quickActionsGrid}>
          <QuickAction
            title="Upload & Train"
            description="New dataset aur model train karo."
            path="/upload"
            icon={BrainCircuit}
          />

          <QuickAction
            title="Crash Test"
            description="Model robustness test karo."
            path="/crash-tests"
            icon={FlaskConical}
          />

          <QuickAction
            title="Treatment Engine"
            description="Issue-specific fixes generate karo."
            path="/treatment"
            icon={Stethoscope}
          />

          <QuickAction
            title="Knowledge Graph"
            description="Root-cause relationships inspect karo."
            path="/knowledge-graph"
            icon={Network}
          />

          <QuickAction
            title="AI Investigation"
            description="Multi-agent diagnosis run karo."
            path="/agents"
            icon={Workflow}
          />

          <QuickAction
            title="LLM Report"
            description="Human-readable report generate karo."
            path="/llm-report"
            icon={FileText}
          />
        </div>
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  background,
  color,
  path,
  small = false,
}) {
  return (
    <Link
      to={path}
      style={{
        ...styles.statCard,
        background,
      }}
    >
      <div
        style={{
          ...styles.statIcon,
          color,
        }}
      >
        <Icon size={23} />
      </div>

      <span style={styles.statTitle}>{title}</span>

      <strong
        style={{
          ...styles.statValue,
          color,
          fontSize: small ? "15px" : "25px",
        }}
      >
        {value}
      </strong>

      <span style={styles.statSubtitle}>
        {subtitle}
      </span>
    </Link>
  );
}

function QuickAction({
  title,
  description,
  path,
  icon: Icon,
}) {
  return (
    <Link to={path} style={styles.quickAction}>
      <div style={styles.quickActionIcon}>
        <Icon size={21} />
      </div>

      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>

      <ArrowRight size={17} />
    </Link>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div style={styles.miniMetric}>
      <span>{label}</span>
      <strong>
        {value === undefined || value === null
          ? "N/A"
          : `${Number(value).toFixed(1)}%`}
      </strong>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={styles.infoRow}>
      <span>{label}</span>
      <strong>{value || "N/A"}</strong>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={styles.emptyState}>
      <LoaderCircle size={26} />
      <p>Loading latest data...</p>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div style={styles.emptyState}>
      <AlertTriangle size={25} />
      <p>{text}</p>
    </div>
  );
}

function readLocalStorageJSON(key) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function formatScore(value) {
  if (value === null || value === undefined) {
    return "--";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "--";
  }

  return numericValue.toFixed(0);
}

function formatText(value) {
  if (!value) {
    return "Unknown";
  }

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatDate(value) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString();
}

function getVerdictStyle(verdict) {
  if (verdict === "APPROVED") {
    return {
      color: "#047857",
      background: "#d1fae5",
    };
  }

  if (verdict === "CONDITIONAL_APPROVAL") {
    return {
      color: "#b45309",
      background: "#fef3c7",
    };
  }

  return {
    color: "#be123c",
    background: "#ffe4e6",
  };
}

const styles = {
  page: {
    width: "100%",
  },

  hero: {
    position: "relative",
    minHeight: "320px",
    display: "flex",
    overflow: "hidden",
    padding: "42px 46px",
    border: "1px solid #e2d7fb",
    borderRadius: "29px",
    background:
      "linear-gradient(120deg, rgba(255,255,255,0.98), rgba(245,240,255,0.96))",
    boxShadow:
      "0 24px 60px rgba(75,52,130,0.09)",
  },

  heroContent: {
    position: "relative",
    width: "62%",
    zIndex: 2,
  },

  heroBadge: {
    width: "fit-content",
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "8px 12px",
    color: "#6d28d9",
    border: "1px solid #e2d7fb",
    borderRadius: "25px",
    background: "white",
    fontSize: "11px",
    fontWeight: "700",
  },

  heroTitle: {
    margin: "18px 0 0",
    fontSize: "45px",
    lineHeight: 1.08,
    letterSpacing: "-1.8px",
  },

  heroHighlight: {
    color: "#7c3aed",
  },

  heroDescription: {
    maxWidth: "580px",
    margin: "17px 0 0",
    color: "#727287",
    fontSize: "14px",
    lineHeight: 1.7,
  },

  heroActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "11px",
    marginTop: "25px",
  },

  primaryAction: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "13px 19px",
    color: "white",
    borderRadius: "13px",
    background:
      "linear-gradient(135deg, #7c3aed, #4f46e5)",
    boxShadow:
      "0 13px 27px rgba(124,58,237,0.23)",
    textDecoration: "none",
    fontWeight: "700",
  },

  secondaryAction: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "13px 17px",
    color: "#6d28d9",
    border: "1px solid #ddd6fe",
    borderRadius: "13px",
    background: "white",
    cursor: "pointer",
    fontWeight: "700",
  },

  heroVisual: {
    position: "absolute",
    right: "50px",
    top: "40px",
    width: "290px",
    height: "240px",
  },

  gaugeRing: {
    position: "absolute",
    left: "75px",
    top: "20px",
    width: "160px",
    height: "160px",
    display: "grid",
    placeItems: "center",
    alignContent: "center",
    color: "#7c3aed",
    border: "15px solid #ddd6fe",
    borderRadius: "50%",
    background: "white",
    boxShadow:
      "0 25px 55px rgba(76,29,149,0.16)",
  },

  gaugeValue: {
    fontSize: "43px",
  },

  gaugeLabel: {
    color: "#858598",
    fontSize: "10px",
    fontWeight: "700",
  },

  floatingStatus: {
    position: "absolute",
    right: 0,
    bottom: "17px",
    display: "flex",
    alignItems: "center",
    gap: "9px",
    maxWidth: "210px",
    padding: "12px 14px",
    color: "#047857",
    border: "1px solid #bbf7d0",
    borderRadius: "14px",
    background: "white",
    boxShadow:
      "0 13px 35px rgba(70,50,120,0.13)",
  },

  smallMuted: {
    display: "block",
    color: "#858598",
    fontSize: "9px",
  },

  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    marginTop: "18px",
    padding: "14px 16px",
    color: "#be123c",
    border: "1px solid #fecdd3",
    borderRadius: "14px",
    background: "#fff1f2",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "16px",
    marginTop: "22px",
  },

  statCard: {
    minHeight: "170px",
    display: "flex",
    flexDirection: "column",
    padding: "19px",
    borderRadius: "20px",
    textDecoration: "none",
    color: "#172033",
  },

  statIcon: {
    width: "44px",
    height: "44px",
    display: "grid",
    placeItems: "center",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.75)",
  },

  statTitle: {
    marginTop: "15px",
    color: "#6e6e81",
    fontSize: "11px",
    fontWeight: "700",
  },

  statValue: {
    marginTop: "6px",
    overflowWrap: "anywhere",
  },

  statSubtitle: {
    marginTop: "auto",
    paddingTop: "10px",
    color: "#858598",
    fontSize: "10px",
    lineHeight: 1.5,
    overflowWrap: "anywhere",
  },

  twoColumnGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(330px, 1fr))",
    gap: "18px",
    marginTop: "20px",
  },

  panel: {
    padding: "22px",
    border: "1px solid #e8e6f0",
    borderRadius: "21px",
    background: "white",
    boxShadow:
      "0 12px 35px rgba(66,52,104,0.05)",
  },

  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },

  sectionLabel: {
    margin: 0,
    color: "#7c3aed",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1.2px",
  },

  panelTitle: {
    margin: "5px 0 0",
    fontSize: "20px",
  },

  dnaContent: {
    marginTop: "16px",
  },

  investigationBox: {
    marginTop: "16px",
  },

  verdictBadge: {
    width: "fit-content",
    padding: "8px 11px",
    borderRadius: "18px",
    fontSize: "10px",
    fontWeight: "800",
  },

  infoRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
    padding: "11px 0",
    borderBottom: "1px solid #f0eef5",
    fontSize: "11px",
  },

  panelLink: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    width: "fit-content",
    marginTop: "17px",
    color: "#7c3aed",
    textDecoration: "none",
    fontSize: "11px",
    fontWeight: "800",
  },

  crashGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "11px",
    marginTop: "16px",
  },

  miniMetric: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    padding: "13px",
    borderRadius: "13px",
    background: "#fafafe",
    color: "#6e6e81",
    fontSize: "10px",
  },

  eventBox: {
    marginTop: "16px",
  },

  eventStatus: {
    width: "fit-content",
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "8px 11px",
    color: "#047857",
    borderRadius: "18px",
    background: "#d1fae5",
    fontSize: "10px",
    fontWeight: "800",
  },

  quickActionsSection: {
    marginTop: "20px",
    padding: "23px",
    border: "1px solid #e8e6f0",
    borderRadius: "21px",
    background: "white",
    boxShadow:
      "0 12px 35px rgba(66,52,104,0.05)",
  },

  quickActionsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "13px",
    marginTop: "17px",
  },

  quickAction: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "15px",
    color: "#172033",
    border: "1px solid #ece8f2",
    borderRadius: "15px",
    background: "#fafafe",
    textDecoration: "none",
  },

  quickActionIcon: {
    width: "42px",
    height: "42px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    color: "#7c3aed",
    borderRadius: "13px",
    background: "#f3e8ff",
  },

  emptyState: {
    display: "grid",
    placeItems: "center",
    gap: "7px",
    minHeight: "140px",
    color: "#858598",
    textAlign: "center",
  },
};

export default Dashboard;
