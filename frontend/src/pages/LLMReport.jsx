import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  FileText,
  LoaderCircle,
  Sparkles,
} from "lucide-react";

import api from "../services/api";

const initialMetrics = {
  health_score: 82,
  grade: "B",
  deployment_status: "RETEST BEFORE DEPLOYMENT",
  accuracy: 91,
  noise_stability: 76,
  missing_stability: 88,
  outlier_stability: 79,
  drift_stability: 70,
};

function LLMReport() {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [recommendations, setRecommendations] = useState(
    "Apply robust scaling.\nMonitor feature drift weekly.\nRetest before deployment."
  );

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setMetrics((previous) => ({
      ...previous,
      [name]:
        name === "grade" ||
        name === "deployment_status"
          ? value
          : Number(value),
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
      "LLM report generate nahi ho paayi."
    );
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      const recommendationList = recommendations
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      const response = await api.post(
        "/llm-report/generate",
        {
          ...metrics,
          recommendations: recommendationList,
          extra_metrics: {},
        }
      );

      setResult(response.data?.result || null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const copyReport = async () => {
    const reportText = result?.report;

    if (!reportText) {
      return;
    }

    await navigator.clipboard.writeText(reportText);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <main style={styles.page}>
      <section style={styles.headingSection}>
        <div style={styles.headingIcon}>
          <FileText size={30} />
        </div>

        <div>
          <p style={styles.label}>HUMAN-READABLE AI REPORTING</p>

          <h1 style={styles.title}>LLM Report Generator</h1>

          <p style={styles.description}>
            Verified model-health metrics ko executive summary,
            reliability diagnosis, risks aur deployment recommendation
            me convert karo.
          </p>
        </div>
      </section>

      <section style={styles.formCard}>
        <h2 style={styles.sectionTitle}>Enter Verified Metrics</h2>

        <p style={styles.sectionDescription}>
          Ye report sirf supplied metrics use karegi. LLM unavailable hone
          par deterministic fallback report generate hogi.
        </p>

        <div style={styles.metricGrid}>
          <MetricInput
            label="Health Score"
            name="health_score"
            value={metrics.health_score}
            onChange={handleChange}
          />

          <label style={styles.inputGroup}>
            <span style={styles.inputLabel}>Grade</span>

            <select
              name="grade"
              value={metrics.grade}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="F">F</option>
            </select>
          </label>

          <label style={styles.inputGroup}>
            <span style={styles.inputLabel}>
              Deployment Status
            </span>

            <input
              type="text"
              name="deployment_status"
              value={metrics.deployment_status}
              onChange={handleChange}
              style={styles.input}
            />
          </label>

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
        </div>

        <label style={styles.recommendationGroup}>
          <span style={styles.inputLabel}>
            Recommendations
          </span>

          <textarea
            value={recommendations}
            onChange={(event) => {
              setRecommendations(event.target.value);
              setError("");
              setResult(null);
            }}
            rows={6}
            placeholder="Har recommendation nayi line me likho."
            style={styles.textarea}
          />
        </label>

        <button
          type="button"
          onClick={generateReport}
          disabled={loading}
          style={{
            ...styles.generateButton,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <>
              <LoaderCircle size={19} />
              Generating LLM Report...
            </>
          ) : (
            <>
              <Sparkles size={19} />
              Generate Reliability Report
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
          <section style={styles.resultHeader}>
            <div>
              <p style={styles.label}>REPORT GENERATED</p>

              <h2 style={styles.resultTitle}>
                Reliability Report Ready
              </h2>

              <div style={styles.badgeRow}>
                <span style={styles.providerBadge}>
                  Provider: {result.provider || "unknown"}
                </span>

                {result.model && (
                  <span style={styles.modelBadge}>
                    Model: {result.model}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={copyReport}
              style={styles.copyButton}
            >
              {copied ? (
                <CheckCircle2 size={17} />
              ) : (
                <Copy size={17} />
              )}

              {copied ? "Copied" : "Copy Report"}
            </button>
          </section>

          {result.warning && (
            <div style={styles.warningBox}>
              <AlertTriangle size={19} />
              <span>{result.warning}</span>
            </div>
          )}

          <section style={styles.reportCard}>
            <pre style={styles.reportText}>
              {result.report || "No report returned."}
            </pre>
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
      "linear-gradient(135deg, #f97316, #7c3aed)",
    boxShadow:
      "0 14px 30px rgba(124,58,237,0.22)",
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

  recommendationGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "18px",
  },

  textarea: {
    width: "100%",
    padding: "13px 14px",
    border: "1px solid #ddd9e8",
    borderRadius: "12px",
    outline: "none",
    resize: "vertical",
    background: "#fafafe",
    fontFamily: "inherit",
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
      "linear-gradient(135deg, #f97316, #7c3aed)",
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

  resultHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    marginTop: "20px",
    padding: "22px",
    border: "1px solid #ddd6fe",
    borderRadius: "21px",
    background:
      "linear-gradient(145deg, white, #faf7ff)",
  },

  resultTitle: {
    margin: 0,
    fontSize: "22px",
  },

  badgeRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "10px",
  },

  providerBadge: {
    padding: "7px 10px",
    color: "#6d28d9",
    borderRadius: "18px",
    background: "#f3e8ff",
    fontSize: "10px",
    fontWeight: "800",
  },

  modelBadge: {
    padding: "7px 10px",
    color: "#c2410c",
    borderRadius: "18px",
    background: "#ffedd5",
    fontSize: "10px",
    fontWeight: "800",
  },

  copyButton: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "10px 13px",
    color: "#6d28d9",
    border: "1px solid #ddd6fe",
    borderRadius: "11px",
    background: "white",
    cursor: "pointer",
    fontWeight: "700",
  },

  warningBox: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    marginTop: "16px",
    padding: "14px 16px",
    color: "#b45309",
    border: "1px solid #fde68a",
    borderRadius: "14px",
    background: "#fffbeb",
  },

  reportCard: {
    marginTop: "16px",
    padding: "24px",
    border: "1px solid #e8e6f0",
    borderRadius: "21px",
    background: "white",
    boxShadow:
      "0 12px 35px rgba(66,52,104,0.05)",
  },

  reportText: {
    margin: 0,
    color: "#334155",
    fontFamily: "'DM Sans', Arial, sans-serif",
    fontSize: "13px",
    lineHeight: 1.8,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },
};

export default LLMReport;
