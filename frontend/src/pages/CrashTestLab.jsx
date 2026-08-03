import React, { useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Database,
  FlaskConical,
  LoaderCircle,
  ShieldCheck,
  Target,
} from "lucide-react";

import api from "../services/api";

function CrashTestLab() {
  const [datasetFileName, setDatasetFileName] = useState("");
  const [modelFileName, setModelFileName] = useState("");
  const [targetColumn, setTargetColumn] = useState("");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runCrashTests = async () => {
    if (!datasetFileName.trim()) {
      setError("Dataset saved file name enter karo.");
      return;
    }

    if (!modelFileName.trim()) {
      setError("Trained model file name enter karo.");
      return;
    }

    if (!targetColumn.trim()) {
      setError("Target column enter karo.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await api.post("/crash-test/run", {
        model_path: `trained_models/${modelFileName.trim()}`,
        dataset_path: `uploads/${datasetFileName.trim()}`,
        target_column: targetColumn.trim(),
      });

      setResult(response.data);

      localStorage.setItem(
  "modelguard_crash_result",
  JSON.stringify(response.data)
);
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          "Crash tests run nahi ho paaye. File names aur backend check karo."
      );
    } finally {
      setLoading(false);
    }
  };

  const getTestScore = (test) => {
    if (!test) {
      return "N/A";
    }

    if (test.prediction_stability !== undefined) {
      return `${test.prediction_stability}%`;
    }

    if (test.overall_stability !== undefined) {
      return `${test.overall_stability}%`;
    }

    if (test.balance_ratio !== undefined) {
      return `${(Number(test.balance_ratio) * 100).toFixed(2)}%`;
    }

    if (test.duplicate_percentage !== undefined) {
      return `${test.duplicate_percentage}% duplicate`;
    }

    return test.status || "Completed";
  };

  const testCards = result
    ? [
        {
          title: "Noise Stability",
          data: result.noise_test,
          background: "#f3e8ff",
          color: "#7c3aed",
          icon: Activity,
        },
        {
          title: "Missing Value Stability",
          data: result.missing_value_test,
          background: "#e0f2fe",
          color: "#0284c7",
          icon: Database,
        },
        {
          title: "Outlier Stability",
          data: result.outlier_test,
          background: "#fef3c7",
          color: "#d97706",
          icon: AlertTriangle,
        },
        {
          title: "Feature Drift",
          data: result.feature_drift_test,
          background: "#dcfce7",
          color: "#059669",
          icon: FlaskConical,
        },
        {
          title: "Label Noise",
          data: result.label_noise_test,
          background: "#fae8ff",
          color: "#a21caf",
          icon: Target,
        },
        {
          title: "Class Balance",
          data: result.class_imbalance_test,
          background: "#cffafe",
          color: "#0891b2",
          icon: ShieldCheck,
        },
        {
          title: "Duplicate Detection",
          data: result.duplicate_detection,
          background: "#fee2e2",
          color: "#dc2626",
          icon: Database,
        },
        {
          title: "Data Leakage",
          data: result.data_leakage_test,
          background: "#ffedd5",
          color: "#ea580c",
          icon: AlertTriangle,
        },
      ]
    : [];

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroIcon}>
          <FlaskConical size={30} />
        </div>

        <div>
          <p style={styles.label}>ML RELIABILITY TESTING</p>

          <h1 style={styles.title}>Crash Test Lab</h1>

          <p style={styles.description}>
            Trained model ko noisy, missing, outlier, drift aur dataset-quality
            conditions ke against test karo.
          </p>
        </div>
      </section>

      <section style={styles.formCard}>
        <h2 style={styles.sectionTitle}>Select Trained Experiment</h2>

        <p style={styles.sectionDescription}>
          Upload aur training API se mile exact saved file names enter karo.
        </p>

        <div style={styles.inputGrid}>
          <label style={styles.inputGroup}>
            <span style={styles.inputLabel}>Dataset saved file name</span>

            <input
              type="text"
              value={datasetFileName}
              onChange={(event) => {
                setDatasetFileName(event.target.value);
                setError("");
              }}
              placeholder="abc123_sample_ml_dataset.csv"
              style={styles.input}
            />
          </label>

          <label style={styles.inputGroup}>
            <span style={styles.inputLabel}>Trained model file name</span>

            <input
              type="text"
              value={modelFileName}
              onChange={(event) => {
                setModelFileName(event.target.value);
                setError("");
              }}
              placeholder="abc123_random_forest.pkl"
              style={styles.input}
            />
          </label>

          <label style={styles.inputGroup}>
            <span style={styles.inputLabel}>Target column</span>

            <input
              type="text"
              value={targetColumn}
              onChange={(event) => {
                setTargetColumn(event.target.value);
                setError("");
              }}
              placeholder="Purchased"
              style={styles.input}
            />
          </label>
        </div>

        <button
          type="button"
          onClick={runCrashTests}
          disabled={loading}
          style={{
            ...styles.runButton,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <>
              <LoaderCircle size={19} />
              Running Reliability Tests...
            </>
          ) : (
            <>
              <FlaskConical size={19} />
              Run Complete Crash Test
            </>
          )}
        </button>

        {error && (
          <div style={styles.errorBox}>
            <AlertTriangle size={19} />
            <span>{error}</span>
          </div>
        )}
      </section>

      {result && (
        <>
          <section style={styles.scoreSection}>
            <div style={styles.scoreCircle}>
              <strong>{result.robustness_score}</strong>
              <span>/100</span>
            </div>

            <div>
              <p style={styles.label}>OVERALL ROBUSTNESS</p>
              <h2 style={styles.grade}>Grade {result.grade}</h2>

              <div
                style={{
                  ...styles.statusBadge,
                  ...(result.deployment_ready
                    ? styles.approvedBadge
                    : styles.blockedBadge),
                }}
              >
                {result.deployment_ready ? (
                  <CheckCircle2 size={17} />
                ) : (
                  <AlertTriangle size={17} />
                )}

                {result.deployment_ready
                  ? "Deployment Ready"
                  : "Needs Improvement"}
              </div>
            </div>
          </section>

          <section style={styles.testsGrid}>
            {testCards.map((test) => {
              const Icon = test.icon;

              return (
                <article
                  key={test.title}
                  style={{
                    ...styles.testCard,
                    background: test.background,
                  }}
                >
                  <div style={styles.testCardTop}>
                    <div
                      style={{
                        ...styles.testIcon,
                        color: test.color,
                      }}
                    >
                      <Icon size={23} />
                    </div>

                    <span style={styles.testStatus}>
                      {test.data?.status || "Completed"}
                    </span>
                  </div>

                  <p style={styles.testTitle}>{test.title}</p>

                  <strong
                    style={{
                      ...styles.testValue,
                      color: test.color,
                    }}
                  >
                    {getTestScore(test.data)}
                  </strong>

                  {test.data?.changed_predictions !== undefined && (
                    <p style={styles.testDetail}>
                      Changed predictions:{" "}
                      {test.data.changed_predictions}
                    </p>
                  )}
                </article>
              );
            })}
          </section>
        </>
      )}
    </main>
  );
}

const styles = {
  page: {
    width: "100%",
  },

  hero: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "22px",
  },

  heroIcon: {
    width: "58px",
    height: "58px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    color: "white",
    borderRadius: "19px",
    background: "linear-gradient(135deg, #ec4899, #7c3aed)",
    boxShadow: "0 14px 30px rgba(124,58,237,0.22)",
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
    maxWidth: "700px",
    margin: "8px 0 0",
    color: "#747489",
    lineHeight: 1.6,
  },

  formCard: {
    padding: "26px",
    border: "1px solid #e8e6f0",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.95)",
    boxShadow: "0 18px 45px rgba(66,52,104,0.07)",
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

  inputGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
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

  input: {
    width: "100%",
    padding: "13px 14px",
    border: "1px solid #ddd9e8",
    borderRadius: "12px",
    outline: "none",
    background: "#fafafe",
  },

  runButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "18px",
    padding: "14px",
    color: "white",
    border: "none",
    borderRadius: "13px",
    background: "linear-gradient(135deg, #ec4899, #7c3aed)",
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

  scoreSection: {
    display: "flex",
    alignItems: "center",
    gap: "22px",
    marginTop: "22px",
    padding: "25px",
    border: "1px solid #bbf7d0",
    borderRadius: "24px",
    background:
      "radial-gradient(circle at 100% 0%, rgba(167,243,208,0.45), transparent 35%), #f5fff9",
    boxShadow: "0 18px 45px rgba(5,150,105,0.08)",
  },

  scoreCircle: {
    width: "125px",
    height: "125px",
    display: "flex",
    alignItems: "baseline",
    justifyContent: "center",
    paddingTop: "38px",
    border: "11px solid #a7f3d0",
    borderRadius: "50%",
    background: "white",
  },

  grade: {
    margin: 0,
    color: "#075f49",
    fontSize: "27px",
  },

  statusBadge: {
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

  testsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "15px",
    marginTop: "20px",
  },

  testCard: {
    minHeight: "170px",
    padding: "19px",
    borderRadius: "19px",
  },

  testCardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  testIcon: {
    width: "42px",
    height: "42px",
    display: "grid",
    placeItems: "center",
    borderRadius: "13px",
    background: "rgba(255,255,255,0.75)",
  },

  testStatus: {
    padding: "6px 10px",
    color: "#047857",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.8)",
    fontSize: "9px",
    fontWeight: "800",
  },

  testTitle: {
    margin: "17px 0 0",
    color: "#6e6e81",
    fontSize: "12px",
    fontWeight: "600",
  },

  testValue: {
    display: "block",
    marginTop: "5px",
    fontSize: "27px",
  },

  testDetail: {
    margin: "7px 0 0",
    color: "#747487",
    fontSize: "11px",
  },
};

export default CrashTestLab;