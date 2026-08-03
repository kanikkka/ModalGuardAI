import React, { useState } from "react";
import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  LoaderCircle,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Workflow,
} from "lucide-react";

import api from "../services/api";

const initialMetrics = {
  accuracy: 91,
  noise_stability: 74,
  missing_stability: 86,
  outlier_stability: 77,
  drift_stability: 65,
  label_noise: 95,
  class_balance: 48,
  duplicate_score: 92,
  leakage_score: 100,
};

function AIInvestigation() {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setMetrics((previous) => ({
      ...previous,
      [name]: Number(value),
    }));

    setError("");
    setResult(null);
  };

  const getErrorMessage = (requestError) => {
    const detail = requestError.response?.data?.detail;

    if (Array.isArray(detail)) {
      return detail
        .map((item) => item?.msg || "Validation error")
        .join(", ");
    }

    if (typeof detail === "string") {
      return detail;
    }

    if (detail && typeof detail === "object") {
      return JSON.stringify(detail);
    }

    return (
      requestError.message ||
      "AI investigation complete nahi ho paayi."
    );
  };

  const runInvestigation = async () => {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await api.post(
        "/agents/investigate",
        {
          ...metrics,
          extra_metrics: {},
        }
      );

      setResult(response.data?.investigation || null);
      const investigation =
  response.data?.investigation || null;

setResult(investigation);

if (investigation) {
  localStorage.setItem(
    "modelguard_investigation",
    JSON.stringify(investigation)
  );
}
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const investigationResults = result?.results || {};
  const inspection = investigationResults.inspection || {};
  const health = investigationResults.health_evaluation || {};
  const diagnosis = investigationResults.diagnosis || {};
  const treatment = investigationResults.treatment || {};
  const deployment =
    investigationResults.deployment_decision || {};

  return (
    <main style={styles.page}>
      <section style={styles.headingSection}>
        <div style={styles.headingIcon}>
          <Workflow size={30} />
        </div>

        <div>
          <p style={styles.label}>MULTI-AGENT RELIABILITY SYSTEM</p>

          <h1 style={styles.title}>AI Investigation</h1>

          <p style={styles.description}>
            Inspector, Health, Diagnosis, Treatment aur Deployment Guardian
            agents ko ek hi workflow me run karo.
          </p>
        </div>
      </section>

      <section style={styles.formCard}>
        <h2 style={styles.sectionTitle}>Enter Reliability Metrics</h2>

        <p style={styles.sectionDescription}>
          Weak values use karke multi-agent workflow clearly test kar sakte ho.
        </p>

        <div style={styles.metricGrid}>
          <MetricInput
            label="Accuracy"
            name="accuracy"
            value={metrics.accuracy}
            onChange={handleChange}
          />

          <MetricInput
            label="Noise Stability"
            name="noise_stability"
            value={metrics.noise_stability}
            onChange={handleChange}
          />

          <MetricInput
            label="Missing Stability"
            name="missing_stability"
            value={metrics.missing_stability}
            onChange={handleChange}
          />

          <MetricInput
            label="Outlier Stability"
            name="outlier_stability"
            value={metrics.outlier_stability}
            onChange={handleChange}
          />

          <MetricInput
            label="Drift Stability"
            name="drift_stability"
            value={metrics.drift_stability}
            onChange={handleChange}
          />

          <MetricInput
            label="Label Noise"
            name="label_noise"
            value={metrics.label_noise}
            onChange={handleChange}
          />

          <MetricInput
            label="Class Balance"
            name="class_balance"
            value={metrics.class_balance}
            onChange={handleChange}
          />

          <MetricInput
            label="Duplicate Score"
            name="duplicate_score"
            value={metrics.duplicate_score}
            onChange={handleChange}
          />

          <MetricInput
            label="Leakage Score"
            name="leakage_score"
            value={metrics.leakage_score}
            onChange={handleChange}
          />
        </div>

        <button
          type="button"
          onClick={runInvestigation}
          disabled={loading}
          style={{
            ...styles.generateButton,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <>
              <LoaderCircle size={19} />
              Running AI Investigation...
            </>
          ) : (
            <>
              <Sparkles size={19} />
              Run Multi-Agent Investigation
            </>
          )}
        </button>

        {error && (
          <div style={styles.errorBox}>
            <AlertTriangle size={19} />
            <span>{String(error)}</span>
          </div>
        )}
      </section>

      {result && (
        <>
          <section
            style={{
              ...styles.verdictCard,
              ...getVerdictStyle(result.final_verdict),
            }}
          >
            <div style={styles.verdictIcon}>
              {result.final_verdict === "APPROVED" ? (
                <CheckCircle2 size={31} />
              ) : (
                <AlertTriangle size={31} />
              )}
            </div>

            <div>
              <p style={styles.label}>FINAL MULTI-AGENT VERDICT</p>

              <h2 style={styles.verdictTitle}>
                {result.final_verdict}
              </h2>

              <p style={styles.verdictText}>
                Risk Level: <strong>{result.risk_level}</strong>
              </p>
            </div>
          </section>

          <section style={styles.summaryGrid}>
            <SummaryCard
              title="Investigation ID"
              value={result.investigation_id}
              background="#f3e8ff"
              color="#7c3aed"
              small
            />

            <SummaryCard
              title="Health Score"
              value={health.health_score ?? "N/A"}
              background="#dcfce7"
              color="#059669"
            />

            <SummaryCard
              title="Issues Found"
              value={inspection.issue_count ?? 0}
              background="#fee2e2"
              color="#dc2626"
            />

            <SummaryCard
              title="Workflow Steps"
              value={result.workflow?.length ?? 0}
              background="#e0f2fe"
              color="#0284c7"
            />
          </section>

          <section style={styles.sectionCard}>
            <div style={styles.sectionHeading}>
              <div style={styles.sectionIcon}>
                <SearchCheck size={23} />
              </div>

              <div>
                <p style={styles.label}>INSPECTOR AGENT</p>
                <h2 style={styles.sectionTitle}>Initial Inspection</h2>
              </div>
            </div>

            <AgentStatus
              status={inspection.status}
              items={inspection.detected_issues}
              emptyMessage="No issue detected."
            />
          </section>

          <section style={styles.sectionCard}>
            <div style={styles.sectionHeading}>
              <div style={styles.sectionIcon}>
                <BrainCircuit size={23} />
              </div>

              <div>
                <p style={styles.label}>DIAGNOSIS AGENT</p>
                <h2 style={styles.sectionTitle}>Root-Cause Diagnosis</h2>
              </div>
            </div>

            <p style={styles.summaryText}>
              {diagnosis.summary || "No diagnosis returned."}
            </p>

            <div style={styles.cardGrid}>
              {diagnosis.root_causes?.map((item, index) => (
                <article
                  key={`${item.issue}-${index}`}
                  style={styles.resultCard}
                >
                  <span style={styles.smallLabel}>Root Cause</span>

                  <strong style={styles.resultTitle}>
                    {item.issue_label}
                  </strong>

                  <p style={styles.resultText}>
                    Severity Rank: {item.severity_rank}
                  </p>

                  <p style={styles.resultText}>
                    Effects:{" "}
                    {item.effects?.join(", ") || "None"}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section style={styles.sectionCard}>
            <div style={styles.sectionHeading}>
              <div style={styles.sectionIcon}>
                <Stethoscope size={23} />
              </div>

              <div>
                <p style={styles.label}>TREATMENT AGENT</p>
                <h2 style={styles.sectionTitle}>Treatment Plan</h2>
              </div>
            </div>

            <div style={styles.cardGrid}>
              {treatment.treatments?.map((item, index) => (
                <article
                  key={`${item.issue}-${index}`}
                  style={styles.resultCard}
                >
                  <div style={styles.cardTop}>
                    <strong style={styles.resultTitle}>
                      {item.issue}
                    </strong>

                    <span style={styles.priorityBadge}>
                      {item.priority}
                    </span>
                  </div>

                  <p style={styles.resultText}>
                    {item.recommended_action}
                  </p>

                  <div style={styles.successBox}>
                    <CheckCircle2 size={16} />
                    <span>{item.expected_benefit}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section style={styles.sectionCard}>
            <div style={styles.sectionHeading}>
              <div style={styles.sectionIcon}>
                <ShieldCheck size={23} />
              </div>

              <div>
                <p style={styles.label}>DEPLOYMENT GUARDIAN</p>
                <h2 style={styles.sectionTitle}>Deployment Decision</h2>
              </div>
            </div>

            <div style={styles.deploymentGrid}>
              <DetailCard
                label="Decision"
                value={deployment.decision}
              />

              <DetailCard
                label="Risk Level"
                value={deployment.risk_level}
              />

              <DetailCard
                label="Health Score"
                value={deployment.health_score}
              />
            </div>

            {deployment.blocking_reasons?.length > 0 && (
              <div style={styles.blockingList}>
                {deployment.blocking_reasons.map(
                  (reason, index) => (
                    <div
                      key={`${reason}-${index}`}
                      style={styles.blockingItem}
                    >
                      <AlertTriangle size={17} />
                      <span>{String(reason)}</span>
                    </div>
                  )
                )}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

function MetricInput({
  label,
  name,
  value,
  onChange,
}) {
  return (
    <label style={styles.inputGroup}>
      <span style={styles.inputLabel}>{label}</span>

      <div style={styles.inputWrapper}>
        <input
          type="number"
          name={name}
          value={value}
          min="0"
          max="100"
          step="0.1"
          onChange={onChange}
          style={styles.input}
        />

        <span style={styles.percent}>%</span>
      </div>
    </label>
  );
}

function SummaryCard({
  title,
  value,
  background,
  color,
  small = false,
}) {
  return (
    <article
      style={{
        ...styles.summaryCard,
        background,
      }}
    >
      <span style={styles.smallLabel}>{title}</span>

      <strong
        style={{
          ...styles.summaryValue,
          color,
          fontSize: small ? "13px" : "29px",
        }}
      >
        {value}
      </strong>
    </article>
  );
}

function DetailCard({ label, value }) {
  return (
    <article style={styles.detailCard}>
      <span style={styles.smallLabel}>{label}</span>
      <strong style={styles.detailValue}>{value}</strong>
    </article>
  );
}

function AgentStatus({
  status,
  items = [],
  emptyMessage,
}) {
  return (
    <div>
      <span style={styles.statusBadge}>
        {status || "UNKNOWN"}
      </span>

      <div style={styles.issueList}>
        {items.length ? (
          items.map((item, index) => (
            <div
              key={`${item}-${index}`}
              style={styles.issueItem}
            >
              <AlertTriangle size={17} />
              <span>{String(item)}</span>
            </div>
          ))
        ) : (
          <div style={styles.successBox}>
            <CheckCircle2 size={17} />
            <span>{emptyMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function getVerdictStyle(verdict) {
  if (verdict === "APPROVED") {
    return {
      color: "#047857",
      border: "1px solid #bbf7d0",
      background: "#ecfdf5",
    };
  }

  if (verdict === "CONDITIONAL_APPROVAL") {
    return {
      color: "#b45309",
      border: "1px solid #fde68a",
      background: "#fffbeb",
    };
  }

  return {
    color: "#be123c",
    border: "1px solid #fecdd3",
    background: "#fff1f2",
  };
}

const styles = {
  page: {
    width: "100%",
  },

  headingSection: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "22px",
  },

  headingIcon: {
    width: "58px",
    height: "58px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    color: "white",
    borderRadius: "19px",
    background:
      "linear-gradient(135deg, #a21caf, #4f46e5)",
    boxShadow:
      "0 14px 30px rgba(79,70,229,0.22)",
  },

  label: {
    margin: "0 0 5px",
    color: "#7c3aed",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1.3px",
  },

  title: {
    margin: 0,
    fontSize: "32px",
  },

  description: {
    maxWidth: "760px",
    margin: "8px 0 0",
    color: "#747489",
    lineHeight: 1.6,
  },

  formCard: {
    padding: "25px",
    border: "1px solid #e8e6f0",
    borderRadius: "23px",
    background: "rgba(255,255,255,0.95)",
    boxShadow:
      "0 18px 45px rgba(66,52,104,0.07)",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "20px",
  },

  sectionDescription: {
    margin: "6px 0 0",
    color: "#858598",
    fontSize: "13px",
  },

  metricGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "15px",
    marginTop: "20px",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  inputLabel: {
    color: "#5f5f72",
    fontSize: "12px",
    fontWeight: "700",
  },

  inputWrapper: {
    position: "relative",
  },

  input: {
    width: "100%",
    padding: "13px 38px 13px 14px",
    border: "1px solid #ddd9e8",
    borderRadius: "12px",
    outline: "none",
    background: "#fafafe",
  },

  percent: {
    position: "absolute",
    right: "14px",
    top: "50%",
    color: "#8a8a9d",
    transform: "translateY(-50%)",
  },

  generateButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "20px",
    padding: "14px",
    color: "white",
    border: "none",
    borderRadius: "13px",
    background:
      "linear-gradient(135deg, #a21caf, #4f46e5)",
    cursor: "pointer",
    fontWeight: "700",
  },

  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    marginTop: "17px",
    padding: "14px 16px",
    color: "#be123c",
    border: "1px solid #fecdd3",
    borderRadius: "14px",
    background: "#fff1f2",
  },

  verdictCard: {
    display: "flex",
    alignItems: "center",
    gap: "17px",
    marginTop: "20px",
    padding: "24px",
    borderRadius: "22px",
  },

  verdictIcon: {
    width: "56px",
    height: "56px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    borderRadius: "17px",
    background: "rgba(255,255,255,0.8)",
  },

  verdictTitle: {
    margin: 0,
    fontSize: "23px",
  },

  verdictText: {
    margin: "7px 0 0",
    color: "#64748b",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "14px",
    marginTop: "20px",
  },

  summaryCard: {
    minHeight: "108px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "18px",
    borderRadius: "18px",
  },

  smallLabel: {
    color: "#858598",
    fontSize: "10px",
    fontWeight: "800",
  },

  summaryValue: {
    overflowWrap: "anywhere",
  },

  sectionCard: {
    marginTop: "20px",
    padding: "23px",
    border: "1px solid #e8e6f0",
    borderRadius: "21px",
    background: "white",
    boxShadow:
      "0 12px 35px rgba(66,52,104,0.05)",
  },

  sectionHeading: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "18px",
  },

  sectionIcon: {
    width: "47px",
    height: "47px",
    display: "grid",
    placeItems: "center",
    color: "#7c3aed",
    borderRadius: "14px",
    background: "#f3e8ff",
  },

  statusBadge: {
    display: "inline-block",
    padding: "7px 10px",
    color: "#7c3aed",
    borderRadius: "18px",
    background: "#f3e8ff",
    fontSize: "10px",
    fontWeight: "800",
  },

  issueList: {
    display: "flex",
    flexDirection: "column",
    gap: "9px",
    marginTop: "15px",
  },

  issueItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    padding: "11px",
    color: "#9f1239",
    borderRadius: "12px",
    background: "#fff1f2",
    fontSize: "12px",
  },

  successBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    marginTop: "10px",
    padding: "11px",
    color: "#047857",
    borderRadius: "12px",
    background: "#ecfdf5",
    fontSize: "12px",
  },

  summaryText: {
    margin: 0,
    color: "#64748b",
    lineHeight: 1.6,
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "14px",
    marginTop: "17px",
  },

  resultCard: {
    padding: "17px",
    border: "1px solid #ece8f2",
    borderRadius: "16px",
    background: "#fafafe",
  },

  resultTitle: {
    display: "block",
    marginTop: "5px",
    fontSize: "16px",
  },

  resultText: {
    margin: "9px 0 0",
    color: "#64748b",
    fontSize: "12px",
    lineHeight: 1.55,
  },

  cardTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "10px",
  },

  priorityBadge: {
    padding: "7px 10px",
    color: "#b45309",
    borderRadius: "18px",
    background: "#fef3c7",
    fontSize: "9px",
    fontWeight: "800",
  },

  deploymentGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "13px",
  },

  detailCard: {
    minHeight: "92px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "16px",
    border: "1px solid #ece8f2",
    borderRadius: "14px",
    background: "#fafafe",
  },

  detailValue: {
    fontSize: "14px",
    overflowWrap: "anywhere",
  },

  blockingList: {
    display: "flex",
    flexDirection: "column",
    gap: "9px",
    marginTop: "15px",
  },

  blockingItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    padding: "11px",
    color: "#9f1239",
    borderRadius: "12px",
    background: "#fff1f2",
    fontSize: "12px",
  },
};

export default AIInvestigation;
