import React, { useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import api from "../services/api";

const initialMetrics = {
  accuracy: 90,
  noise_score: 90,
  missing_value_score: 90,
  outlier_score: 90,
  drift_score: 90,
  label_noise_score: 95,
  class_balance_score: 90,
  duplicate_score: 100,
  leakage_score: 100,
};

function HealthReport() {
  const [modelFileName, setModelFileName] = useState(
    localStorage.getItem("modelguard_model_file") || ""
  );
  const [metrics, setMetrics] = useState(initialMetrics);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setMetrics((previous) => ({
      ...previous,
      [name]: Number(value),
    }));

    setError("");
    setReport(null);
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

    return requestError.message || "Health report generate nahi ho paayi.";
  };

  const generateReport = async () => {
    if (!modelFileName.trim()) {
      setError("Model file name required hai.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setReport(null);

      const response = await api.post(
        "/health-report/generate",
        {
          model_file_name: modelFileName.trim(),
          ...metrics,
        }
      );

      setReport(response.data);
      localStorage.setItem(
  "modelguard_health_report",
  JSON.stringify(response.data)
);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const deployment =
    report?.deployment?.deployment || "NOT EVALUATED";

  const approved = deployment === "APPROVED";

  return (
    <main style={styles.page}>
      <section style={styles.heading}>
        <div style={styles.headingIcon}>
          <Gauge size={30} />
        </div>

        <div>
          <p style={styles.label}>MODEL RELIABILITY ANALYSIS</p>
          <h1 style={styles.title}>Model Health Report</h1>

          <p style={styles.description}>
            Crash-test aur model-performance scores ko combine karke final
            health score, grade aur deployment decision generate karo.
          </p>
        </div>
      </section>

      <section style={styles.formCard}>
        <h2 style={styles.sectionTitle}>Enter Verified Metrics</h2>

        <p style={styles.sectionDescription}>
          Crash Test Lab aur training result se mile values yahan enter karo.
          Sab values 0–100 scale par honi chahiye.
        </p>

        <label style={styles.modelInputGroup}>
          <span style={styles.inputLabel}>Model File Name</span>

          <input
            type="text"
            value={modelFileName}
            onChange={(event) => {
              setModelFileName(event.target.value);
              setError("");
              setReport(null);
            }}
            placeholder="068863e1247849d59b6e0e5851802924_random_forest.pkl"
            style={styles.modelInput}
          />
        </label>

        <div style={styles.metricInputGrid}>
          <MetricInput
            label="Model Accuracy"
            name="accuracy"
            value={metrics.accuracy}
            onChange={handleChange}
          />

          <MetricInput
            label="Noise Stability"
            name="noise_score"
            value={metrics.noise_score}
            onChange={handleChange}
          />

          <MetricInput
            label="Missing Stability"
            name="missing_value_score"
            value={metrics.missing_value_score}
            onChange={handleChange}
          />

          <MetricInput
            label="Outlier Stability"
            name="outlier_score"
            value={metrics.outlier_score}
            onChange={handleChange}
          />

          <MetricInput
            label="Drift Stability"
            name="drift_score"
            value={metrics.drift_score}
            onChange={handleChange}
          />

          <MetricInput
            label="Label Noise Score"
            name="label_noise_score"
            value={metrics.label_noise_score}
            onChange={handleChange}
          />

          <MetricInput
            label="Class Balance Score"
            name="class_balance_score"
            value={metrics.class_balance_score}
            onChange={handleChange}
          />

          <MetricInput
            label="Duplicate Quality Score"
            name="duplicate_score"
            value={metrics.duplicate_score}
            onChange={handleChange}
          />

          <MetricInput
            label="Leakage Safety Score"
            name="leakage_score"
            value={metrics.leakage_score}
            onChange={handleChange}
          />
        </div>

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
              Generating Health Report...
            </>
          ) : (
            <>
              <Sparkles size={19} />
              Generate Health Report
            </>
          )}
        </button>

        {error && (
          <div style={styles.errorBox}>
            <AlertTriangle size={19} />
            {String(error)}
          </div>
        )}
      </section>

      {report && (
        <>
          <section style={styles.reportHero}>
            <div style={styles.scoreCircle}>
              <strong style={styles.score}>
                {report.health_score}
              </strong>
              <span style={styles.scoreSuffix}>/100</span>
            </div>

            <div>
              <p style={styles.label}>FINAL MODEL HEALTH</p>

              <h2 style={styles.grade}>
                Grade {report.grade}
              </h2>

              <div
                style={{
                  ...styles.deploymentBadge,
                  ...(approved
                    ? styles.approvedBadge
                    : styles.blockedBadge),
                }}
              >
                {approved ? (
                  <CheckCircle2 size={17} />
                ) : (
                  <AlertTriangle size={17} />
                )}

                {deployment}
              </div>

              <p style={styles.reason}>
                {report.deployment?.reason}
              </p>
            </div>
          </section>

          <section style={styles.summaryGrid}>
            <SummaryCard
              title="Accuracy"
              value={`${metrics.accuracy}%`}
              background="#f3e8ff"
              color="#7c3aed"
            />

            <SummaryCard
              title="Noise Stability"
              value={`${metrics.noise_score}%`}
              background="#e0f2fe"
              color="#0284c7"
            />

            <SummaryCard
              title="Drift Stability"
              value={`${metrics.drift_score}%`}
              background="#dcfce7"
              color="#059669"
            />

            <SummaryCard
              title="Leakage Safety"
              value={`${metrics.leakage_score}%`}
              background="#fef3c7"
              color="#d97706"
            />
          </section>

          <section style={styles.recommendationCard}>
            <div style={styles.recommendationHeading}>
              <div style={styles.recommendationIcon}>
                <ShieldCheck size={23} />
              </div>

              <div>
                <p style={styles.label}>AI DOCTOR OUTPUT</p>
                <h2 style={styles.sectionTitle}>
                  Reliability Recommendations
                </h2>
              </div>
            </div>

            <div style={styles.recommendationList}>
              {report.recommendations?.map(
                (recommendation, index) => (
                  <div
                    key={`${recommendation}-${index}`}
                    style={styles.recommendationItem}
                  >
                    <CheckCircle2 size={18} />
                    <span>{String(recommendation)}</span>
                  </div>
                )
              )}
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

const styles = {
  page: {
    width: "100%",
  },

  heading: {
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
      "linear-gradient(135deg, #0ea5e9, #6366f1)",
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
    maxWidth: "720px",
    margin: "8px 0 0",
    color: "#747489",
    lineHeight: 1.6,
  },

  formCard: {
    padding: "26px",
    border: "1px solid #e8e6f0",
    borderRadius: "24px",
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

  modelInputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "20px",
  },

  modelInput: {
    width: "100%",
    padding: "13px 14px",
    border: "1px solid #ddd9e8",
    borderRadius: "12px",
    outline: "none",
    background: "#fafafe",
  },

  metricInputGrid: {
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
      "linear-gradient(135deg, #0ea5e9, #6366f1)",
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

  reportHero: {
    display: "flex",
    alignItems: "center",
    gap: "22px",
    marginTop: "22px",
    padding: "27px",
    border: "1px solid #bbf7d0",
    borderRadius: "25px",
    background:
      "radial-gradient(circle at 100% 0%, rgba(167,243,208,0.45), transparent 35%), #f5fff9",
    boxShadow:
      "0 18px 45px rgba(5,150,105,0.08)",
  },

  scoreCircle: {
    width: "135px",
    height: "135px",
    display: "flex",
    alignItems: "baseline",
    justifyContent: "center",
    paddingTop: "41px",
    border: "12px solid #a7f3d0",
    borderRadius: "50%",
    background: "white",
  },

  score: {
    color: "#047857",
    fontSize: "37px",
  },

  scoreSuffix: {
    color: "#78948a",
    fontSize: "12px",
  },

  grade: {
    margin: 0,
    color: "#075f49",
    fontSize: "28px",
  },

  deploymentBadge: {
    width: "fit-content",
    display: "flex",
    alignItems: "center",
    gap: "7px",
    marginTop: "10px",
    padding: "8px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
  },

  approvedBadge: {
    color: "#047857",
    background: "#d1fae5",
  },

  blockedBadge: {
    color: "#be123c",
    background: "#ffe4e6",
  },

  reason: {
    margin: "10px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "15px",
    marginTop: "20px",
  },

  summaryCard: {
    minHeight: "115px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "19px",
    borderRadius: "19px",
  },

  summaryLabel: {
    color: "#6e6e81",
    fontSize: "12px",
    fontWeight: "600",
  },

  summaryValue: {
    fontSize: "28px",
  },

  recommendationCard: {
    marginTop: "20px",
    padding: "25px",
    border: "1px solid #e7e5f0",
    borderRadius: "23px",
    background:
      "linear-gradient(145deg, white, #faf7ff)",
    boxShadow:
      "0 14px 35px rgba(66,52,104,0.07)",
  },

  recommendationHeading: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  recommendationIcon: {
    width: "49px",
    height: "49px",
    display: "grid",
    placeItems: "center",
    color: "#7c3aed",
    borderRadius: "15px",
    background: "#f3e8ff",
  },

  recommendationList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "20px",
  },

  recommendationItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "9px",
    padding: "13px",
    color: "#4f5f58",
    border: "1px solid #dcfce7",
    borderRadius: "13px",
    background: "#f0fdf4",
    fontSize: "13px",
  },
};

export default HealthReport;