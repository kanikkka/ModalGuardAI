import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  HeartPulse,
  LoaderCircle,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Wrench,
} from "lucide-react";

import api from "../services/api";

const initialMetrics = {
  health_score: 82,
  noise_stability: 85,
  missing_stability: 88,
  outlier_stability: 80,
  drift_stability: 78,
  class_balance: 75,
  duplicate_score: 98,
  leakage_score: 100,
};

function TreatmentEngine() {
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
      "Treatment plan generate nahi ho paaya."
    );
  };

  const generateTreatmentPlan = async () => {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await api.post(
        "/treatment/generate",
        {
          ...metrics,
          extra_metrics: {},
        }
      );

      setResult(response.data?.treatment_plan || null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const isCritical =
    result?.deployment_advice === "BLOCK DEPLOYMENT";

  return (
    <main style={styles.page}>
      <section style={styles.headingSection}>
        <div style={styles.headingIcon}>
          <Stethoscope size={30} />
        </div>

        <div>
          <p style={styles.label}>AI MODEL DOCTOR</p>

          <h1 style={styles.title}>Treatment Engine</h1>

          <p style={styles.description}>
            Reliability metrics ke basis par issue-wise corrective actions,
            priorities aur deployment advice generate karo.
          </p>
        </div>
      </section>

      <section style={styles.formCard}>
        <h2 style={styles.sectionTitle}>
          Enter Model Reliability Metrics
        </h2>

        <p style={styles.sectionDescription}>
          Health Report aur Crash Test Lab se verified values enter karo.
        </p>

        <div style={styles.metricGrid}>
          <MetricInput
            label="Health Score"
            name="health_score"
            value={metrics.health_score}
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
          onClick={generateTreatmentPlan}
          disabled={loading}
          style={{
            ...styles.generateButton,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <>
              <LoaderCircle size={19} />
              Generating Treatment Plan...
            </>
          ) : (
            <>
              <Sparkles size={19} />
              Generate Treatment Plan
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
              ...(isCritical
                ? styles.criticalVerdict
                : styles.safeVerdict),
            }}
          >
            <div style={styles.verdictIcon}>
              {isCritical ? (
                <ShieldAlert size={31} />
              ) : (
                <CheckCircle2 size={31} />
              )}
            </div>

            <div>
              <p style={styles.label}>TREATMENT VERDICT</p>

              <h2 style={styles.verdictTitle}>
                {result.treatment_status}
              </h2>

              <p style={styles.verdictText}>
                Deployment Advice:{" "}
                <strong>{result.deployment_advice}</strong>
              </p>
            </div>
          </section>

          <section style={styles.summaryGrid}>
            <SummaryCard
              title="Total Recommendations"
              value={result.total_recommendations ?? 0}
              background="#f3e8ff"
              color="#7c3aed"
            />

            <SummaryCard
              title="Critical Issues"
              value={result.critical_issues ?? 0}
              background="#fee2e2"
              color="#dc2626"
            />

            <SummaryCard
              title="High Priority Issues"
              value={result.high_priority_issues ?? 0}
              background="#fef3c7"
              color="#d97706"
            />
          </section>

          <section style={styles.treatmentSection}>
            <div style={styles.treatmentHeading}>
              <div style={styles.treatmentIcon}>
                <Wrench size={24} />
              </div>

              <div>
                <p style={styles.label}>CORRECTIVE ACTIONS</p>
                <h2 style={styles.sectionTitle}>
                  Recommended Treatments
                </h2>
              </div>
            </div>

            <div style={styles.treatmentGrid}>
              {result.treatments?.map((treatment, index) => (
                <article
                  key={`${treatment.issue}-${index}`}
                  style={styles.treatmentCard}
                >
                  <div style={styles.treatmentTop}>
                    <div>
                      <span style={styles.issueLabel}>Issue</span>
                      <h3 style={styles.issueTitle}>
                        {treatment.issue}
                      </h3>
                    </div>

                    <span
                      style={{
                        ...styles.priorityBadge,
                        ...getPriorityStyle(
                          treatment.priority
                        ),
                      }}
                    >
                      {treatment.priority}
                    </span>
                  </div>

                  <div style={styles.actionBox}>
                    <HeartPulse size={18} />
                    <div>
                      <span style={styles.boxLabel}>
                        Recommended Action
                      </span>
                      <p style={styles.boxText}>
                        {treatment.recommended_action}
                      </p>
                    </div>
                  </div>

                  <div style={styles.benefitBox}>
                    <CheckCircle2 size={18} />
                    <div>
                      <span style={styles.boxLabel}>
                        Expected Benefit
                      </span>
                      <p style={styles.boxText}>
                        {treatment.expected_benefit}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
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
}) {
  return (
    <article
      style={{
        ...styles.summaryCard,
        background,
      }}
    >
      <span style={styles.summaryLabel}>{title}</span>

      <strong
        style={{
          ...styles.summaryValue,
          color,
        }}
      >
        {value}
      </strong>
    </article>
  );
}

function getPriorityStyle(priority) {
  const normalized = String(priority || "").toUpperCase();

  if (normalized === "CRITICAL") {
    return {
      color: "#be123c",
      background: "#ffe4e6",
    };
  }

  if (normalized === "HIGH") {
    return {
      color: "#b45309",
      background: "#fef3c7",
    };
  }

  if (normalized === "MEDIUM") {
    return {
      color: "#0369a1",
      background: "#e0f2fe",
    };
  }

  return {
    color: "#047857",
    background: "#d1fae5",
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
      "linear-gradient(135deg, #f59e0b, #ef4444)",
    boxShadow:
      "0 14px 30px rgba(239,68,68,0.2)",
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
      "linear-gradient(135deg, #f59e0b, #ef4444)",
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

  safeVerdict: {
    color: "#047857",
    border: "1px solid #bbf7d0",
    background: "#ecfdf5",
  },

  criticalVerdict: {
    color: "#be123c",
    border: "1px solid #fecdd3",
    background: "#fff1f2",
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
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    marginTop: "20px",
  },

  summaryCard: {
    minHeight: "110px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "18px",
    borderRadius: "18px",
  },

  summaryLabel: {
    color: "#6e6e81",
    fontSize: "12px",
    fontWeight: "600",
  },

  summaryValue: {
    fontSize: "30px",
  },

  treatmentSection: {
    marginTop: "20px",
    padding: "24px",
    border: "1px solid #e8e6f0",
    borderRadius: "22px",
    background: "white",
    boxShadow:
      "0 12px 35px rgba(66,52,104,0.05)",
  },

  treatmentHeading: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  treatmentIcon: {
    width: "49px",
    height: "49px",
    display: "grid",
    placeItems: "center",
    color: "#d97706",
    borderRadius: "15px",
    background: "#fef3c7",
  },

  treatmentGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px",
    marginTop: "20px",
  },

  treatmentCard: {
    padding: "19px",
    border: "1px solid #ece8f2",
    borderRadius: "18px",
    background: "#fafafe",
  },

  treatmentTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
  },

  issueLabel: {
    color: "#858598",
    fontSize: "10px",
    fontWeight: "700",
  },

  issueTitle: {
    margin: "5px 0 0",
    fontSize: "17px",
  },

  priorityBadge: {
    padding: "7px 10px",
    borderRadius: "18px",
    fontSize: "9px",
    fontWeight: "800",
  },

  actionBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "9px",
    marginTop: "16px",
    padding: "13px",
    color: "#7c2d12",
    borderRadius: "13px",
    background: "#fff7ed",
  },

  benefitBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "9px",
    marginTop: "11px",
    padding: "13px",
    color: "#065f46",
    borderRadius: "13px",
    background: "#ecfdf5",
  },

  boxLabel: {
    fontSize: "10px",
    fontWeight: "800",
  },

  boxText: {
    margin: "5px 0 0",
    fontSize: "12px",
    lineHeight: 1.55,
  },
};

export default TreatmentEngine;
