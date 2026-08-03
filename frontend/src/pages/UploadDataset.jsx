import React, { useState } from "react";
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  CloudUpload,
  FileSpreadsheet,
  Gauge,
  LoaderCircle,
  Save,
  Target,
  TrendingUp,
} from "lucide-react";

import api from "../services/api";

function UploadDataset() {
  const [file, setFile] = useState(null);
  const [dataset, setDataset] = useState(null);
  const [targetColumn, setTargetColumn] = useState("");
  const [trainingResult, setTrainingResult] = useState(null);

  const [uploadLoading, setUploadLoading] = useState(false);
  const [trainingLoading, setTrainingLoading] = useState(false);

  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;

    setFile(selectedFile);
    setDataset(null);
    setTargetColumn("");
    setTrainingResult(null);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadLoading(true);
      setError("");

      setDataset(null);
      setTargetColumn("");
      setTrainingResult(null);

      const response = await api.post(
        "/dataset/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const uploadedDataset = response.data?.dataset;

      if (!uploadedDataset) {
        throw new Error(
          "Dataset information backend response me nahi mili."
        );
      }

      setDataset(uploadedDataset);

      // Crash Test page ke liye exact backend filename store kar rahe hain.
      localStorage.setItem(
        "modelguard_dataset_file",
        uploadedDataset.saved_file_name || ""
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          requestError.message ||
          "Dataset upload failed. Backend check karo."
      );
    } finally {
      setUploadLoading(false);
    }
  };

  const handleTrainModel = async () => {
    if (!dataset?.saved_file_name) {
      setError("Please upload a dataset first.");
      return;
    }

    if (!targetColumn) {
      setError("Please select a target column.");
      return;
    }

    try {
      setTrainingLoading(true);
      setError("");
      setTrainingResult(null);

      const response = await api.post("/model/train", {
        saved_file_name: dataset.saved_file_name,
        target_column: targetColumn,
      });

      const trainedModel = response.data?.model;

      if (!trainedModel) {
        throw new Error(
          "Training result backend response me nahi mila."
        );
      }

      setTrainingResult(trainedModel);

      // Doosre pages ke liye useful details save kar rahe hain.
      localStorage.setItem(
        "modelguard_model_file",
        trainedModel.model_file_name || ""
      );

      localStorage.setItem(
        "modelguard_target_column",
        targetColumn
      );

      localStorage.setItem(
        "modelguard_training_result",
        JSON.stringify(trainedModel)
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          requestError.message ||
          "Model training failed. Dataset aur target column check karo."
      );
    } finally {
      setTrainingLoading(false);
    }
  };

  const formatMetric = (value) => {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return "N/A";
    }

    /*
      Backend metrics 0–1 scale par deta hai:
      1 = 100%
      0.85 = 85%

      Agar future me backend 0–100 bheje, tab bhi ye safely handle karega.
    */
    const percentage =
      numericValue <= 1
        ? numericValue * 100
        : numericValue;

    return `${percentage.toFixed(2)}%`;
  };

  return (
    <main style={styles.page}>
      <section style={styles.container}>
        <header style={styles.headingSection}>
          <div style={styles.headingIcon}>
            <BrainCircuit size={29} />
          </div>

          <div>
            <p style={styles.label}>MODELGUARD AI</p>

            <h1 style={styles.heading}>
              Upload & Train Model
            </h1>

            <p style={styles.subheading}>
              CSV dataset upload karo, target column select karo aur
              Random Forest classification model train karo.
            </p>
          </div>
        </header>

        {/* Step 1: Upload Dataset */}

        <section style={styles.stepCard}>
          <div style={styles.stepHeader}>
            <div style={styles.stepNumber}>1</div>

            <div>
              <h2 style={styles.stepTitle}>
                Upload Dataset
              </h2>

              <p style={styles.stepDescription}>
                Valid CSV classification dataset select karo.
              </p>
            </div>
          </div>

          <div style={styles.uploadArea}>
            <div style={styles.uploadIcon}>
              <CloudUpload size={47} />
            </div>

            <h3 style={styles.uploadTitle}>
              Choose CSV Dataset
            </h3>

            <p style={styles.uploadDescription}>
              File ke andar feature columns aur target column hona
              chahiye.
            </p>

            <label style={styles.fileLabel}>
              <input
                type="file"
                accept=".csv,text/csv"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />

              <FileSpreadsheet size={18} />

              {file ? file.name : "Browse CSV File"}
            </label>

            <button
              type="button"
              style={{
                ...styles.primaryButton,
                opacity: uploadLoading ? 0.7 : 1,
              }}
              onClick={handleUpload}
              disabled={uploadLoading}
            >
              {uploadLoading ? (
                <>
                  <LoaderCircle size={19} />
                  Uploading Dataset...
                </>
              ) : (
                <>
                  <CloudUpload size={19} />
                  Upload Dataset
                </>
              )}
            </button>
          </div>
        </section>

        {error && (
          <div style={styles.errorBox}>
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Step 2: Target Selection */}

        {dataset && (
          <section style={styles.stepCard}>
            <div style={styles.stepHeader}>
              <div style={styles.stepNumber}>2</div>

              <div>
                <h2 style={styles.stepTitle}>
                  Select Target & Train
                </h2>

                <p style={styles.stepDescription}>
                  Target woh column hai jisko model predict karega.
                </p>
              </div>
            </div>

            <div style={styles.successBox}>
              <CheckCircle2 size={22} />

              <div>
                <strong>
                  Dataset uploaded successfully
                </strong>

                <p style={styles.successText}>
                  {dataset.original_file_name}
                </p>
              </div>
            </div>

            <div style={styles.summaryGrid}>
              <SummaryCard
                title="Rows"
                value={dataset.rows}
                background="#f3e8ff"
                color="#7c3aed"
              />

              <SummaryCard
                title="Columns"
                value={dataset.columns_count}
                background="#e0f2fe"
                color="#0284c7"
              />

              <SummaryCard
                title="Saved File"
                value={dataset.saved_file_name}
                background="#dcfce7"
                color="#059669"
                small
              />
            </div>

            <div style={styles.columnsBox}>
              <strong style={styles.columnsTitle}>
                Available Columns
              </strong>

              <div style={styles.columnList}>
                {dataset.columns?.map((column) => (
                  <span
                    style={styles.columnTag}
                    key={column}
                  >
                    {column}
                  </span>
                ))}
              </div>
            </div>

            <div style={styles.targetSection}>
              <div style={styles.targetHeading}>
                <Target size={22} />
                Select Target Column
              </div>

              <select
                value={targetColumn}
                style={styles.select}
                onChange={(event) => {
                  setTargetColumn(event.target.value);
                  setTrainingResult(null);
                  setError("");
                }}
              >
                <option value="">
                  Choose target column
                </option>

                {dataset.columns?.map((column) => (
                  <option value={column} key={column}>
                    {column}
                  </option>
                ))}
              </select>

              <button
                type="button"
                style={{
                  ...styles.trainButton,
                  opacity:
                    !targetColumn || trainingLoading
                      ? 0.65
                      : 1,
                }}
                disabled={
                  !targetColumn || trainingLoading
                }
                onClick={handleTrainModel}
              >
                {trainingLoading ? (
                  <>
                    <LoaderCircle size={19} />
                    Training Model...
                  </>
                ) : (
                  <>
                    <BrainCircuit size={19} />
                    Train Random Forest Model
                  </>
                )}
              </button>
            </div>
          </section>
        )}

        {/* Step 3: Training Result */}

        {trainingResult && (
          <section style={styles.stepCard}>
            <div style={styles.stepHeader}>
              <div style={styles.stepNumber}>3</div>

              <div>
                <h2 style={styles.stepTitle}>
                  Model Training Result
                </h2>

                <p style={styles.stepDescription}>
                  Random Forest model successfully trained.
                </p>
              </div>
            </div>

            <div style={styles.modelHeader}>
              <div style={styles.modelIcon}>
                <BrainCircuit size={29} />
              </div>

              <div>
                <strong style={styles.algorithmName}>
                  {trainingResult.algorithm}
                </strong>

                <p style={styles.modelFile}>
                  {trainingResult.model_file_name}
                </p>
              </div>
            </div>

            <div style={styles.metricsGrid}>
              <MetricCard
                title="Accuracy"
                value={formatMetric(
                  trainingResult.metrics?.accuracy
                )}
                background="#f3e8ff"
                color="#7c3aed"
                icon={TrendingUp}
              />

              <MetricCard
                title="Precision"
                value={formatMetric(
                  trainingResult.metrics?.precision
                )}
                background="#e0f2fe"
                color="#0284c7"
                icon={Target}
              />

              <MetricCard
                title="Recall"
                value={formatMetric(
                  trainingResult.metrics?.recall
                )}
                background="#dcfce7"
                color="#059669"
                icon={Activity}
              />

              <MetricCard
                title="F1 Score"
                value={formatMetric(
                  trainingResult.metrics?.f1_score
                )}
                background="#fef3c7"
                color="#d97706"
                icon={Gauge}
              />
            </div>

            <div style={styles.trainingInfoGrid}>
              <InfoCard
                title="Target Column"
                value={trainingResult.target_column}
              />

              <InfoCard
                title="Training Rows"
                value={trainingResult.training_rows}
              />

              <InfoCard
                title="Testing Rows"
                value={trainingResult.testing_rows}
              />

              <InfoCard
                title="Numerical Features"
                value={
                  trainingResult.numerical_features?.join(
                    ", "
                  ) || "None"
                }
              />

              <InfoCard
                title="Categorical Features"
                value={
                  trainingResult.categorical_features?.join(
                    ", "
                  ) || "None"
                }
              />
            </div>

            <div style={styles.nextStepBox}>
              <Save size={21} />

              <div>
                <strong>
                  Model details saved successfully
                </strong>

                <p>
                  Ab sidebar se Crash Test Lab kholo. Dataset,
                  model aur target-column values automatically
                  local storage me save ho chuki hain.
                </p>
              </div>
            </div>
          </section>
        )}
      </section>
    </main>
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
      <span style={styles.cardLabel}>{title}</span>

      <strong
        style={{
          ...styles.cardValue,
          color,
          fontSize: small ? "13px" : "27px",
        }}
      >
        {value}
      </strong>
    </article>
  );
}

function MetricCard({
  title,
  value,
  background,
  color,
  icon: Icon,
}) {
  return (
    <article
      style={{
        ...styles.metricCard,
        background,
      }}
    >
      <Icon size={22} color={color} />

      <span style={styles.cardLabel}>{title}</span>

      <strong
        style={{
          ...styles.metricValue,
          color,
        }}
      >
        {value}
      </strong>
    </article>
  );
}

function InfoCard({ title, value }) {
  return (
    <article style={styles.infoCard}>
      <span style={styles.infoLabel}>{title}</span>
      <strong style={styles.infoValue}>{value}</strong>
    </article>
  );
}

const styles = {
  page: {
    width: "100%",
    color: "#172033",
  },

  container: {
    width: "100%",
    maxWidth: "1100px",
    margin: "0 auto",
  },

  headingSection: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "25px",
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
      "linear-gradient(135deg, #7c3aed, #4f46e5)",
    boxShadow:
      "0 14px 30px rgba(124,58,237,0.22)",
  },

  label: {
    margin: "0 0 5px",
    color: "#7c3aed",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1.3px",
  },

  heading: {
    margin: 0,
    fontSize: "34px",
  },

  subheading: {
    margin: "8px 0 0",
    color: "#747489",
    lineHeight: 1.6,
  },

  stepCard: {
    marginBottom: "22px",
    padding: "26px",
    border: "1px solid #e8e6f0",
    borderRadius: "25px",
    background: "rgba(255,255,255,0.95)",
    boxShadow:
      "0 18px 45px rgba(66,52,104,0.07)",
  },

  stepHeader: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    marginBottom: "20px",
  },

  stepNumber: {
    width: "40px",
    height: "40px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    color: "white",
    borderRadius: "13px",
    background:
      "linear-gradient(135deg, #7c3aed, #6366f1)",
    fontWeight: "800",
  },

  stepTitle: {
    margin: 0,
    fontSize: "20px",
  },

  stepDescription: {
    margin: "4px 0 0",
    color: "#858598",
    fontSize: "13px",
  },

  uploadArea: {
    padding: "38px 20px",
    textAlign: "center",
    border: "2px dashed #c4b5fd",
    borderRadius: "22px",
    background:
      "linear-gradient(145deg, #fcfaff, #f5f7ff)",
  },

  uploadIcon: {
    width: "76px",
    height: "76px",
    display: "grid",
    placeItems: "center",
    margin: "0 auto 14px",
    color: "#7c3aed",
    borderRadius: "24px",
    background: "white",
    boxShadow:
      "0 14px 35px rgba(76,29,149,0.12)",
  },

  uploadTitle: {
    margin: "0 0 7px",
  },

  uploadDescription: {
    margin: "0 0 17px",
    color: "#858598",
    fontSize: "13px",
  },

  fileLabel: {
    width: "fit-content",
    maxWidth: "100%",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: "0 auto 14px",
    padding: "12px 17px",
    color: "#5f5f72",
    border: "1px solid #ddd9e8",
    borderRadius: "13px",
    background: "white",
    cursor: "pointer",
    fontWeight: "600",
    overflowWrap: "anywhere",
  },

  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "13px 22px",
    color: "white",
    border: "none",
    borderRadius: "13px",
    background:
      "linear-gradient(135deg, #7c3aed, #4f46e5)",
    cursor: "pointer",
    fontWeight: "700",
  },

  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    marginBottom: "20px",
    padding: "14px 16px",
    color: "#be123c",
    border: "1px solid #fecdd3",
    borderRadius: "14px",
    background: "#fff1f2",
  },

  successBox: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    padding: "15px",
    color: "#047857",
    border: "1px solid #bbf7d0",
    borderRadius: "15px",
    background: "#ecfdf5",
  },

  successText: {
    margin: "3px 0 0",
    fontSize: "12px",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    marginTop: "17px",
  },

  summaryCard: {
    minHeight: "105px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "18px",
    borderRadius: "18px",
  },

  cardLabel: {
    color: "#6e6e81",
    fontSize: "12px",
    fontWeight: "600",
  },

  cardValue: {
    overflowWrap: "anywhere",
  },

  columnsBox: {
    marginTop: "18px",
    padding: "17px",
    border: "1px solid #e8e5f0",
    borderRadius: "15px",
    background: "#fafafe",
  },

  columnsTitle: {
    fontSize: "13px",
  },

  columnList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "11px",
  },

  columnTag: {
    padding: "7px 10px",
    color: "#6d28d9",
    borderRadius: "18px",
    background: "#f3e8ff",
    fontSize: "11px",
    fontWeight: "700",
  },

  targetSection: {
    marginTop: "18px",
    padding: "19px",
    border: "1px solid #e8e5f0",
    borderRadius: "17px",
    background: "#fafafe",
  },

  targetHeading: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    marginBottom: "12px",
    color: "#5b21b6",
    fontWeight: "700",
  },

  select: {
    width: "100%",
    padding: "13px 15px",
    border: "1px solid #dcd8e8",
    borderRadius: "12px",
    outline: "none",
    background: "white",
  },

  trainButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "13px",
    padding: "14px",
    color: "white",
    border: "none",
    borderRadius: "13px",
    background:
      "linear-gradient(135deg, #0ea5e9, #6366f1)",
    cursor: "pointer",
    fontWeight: "700",
  },

  modelHeader: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
  },

  modelIcon: {
    width: "55px",
    height: "55px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    color: "#7c3aed",
    borderRadius: "17px",
    background: "#f3e8ff",
  },

  algorithmName: {
    fontSize: "17px",
  },

  modelFile: {
    margin: "5px 0 0",
    color: "#858598",
    fontSize: "11px",
    overflowWrap: "anywhere",
  },

  metricsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "14px",
    marginTop: "20px",
  },

  metricCard: {
    minHeight: "125px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "18px",
    borderRadius: "18px",
  },

  metricValue: {
    fontSize: "26px",
  },

  trainingInfoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
    marginTop: "18px",
  },

  infoCard: {
    minHeight: "85px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "15px",
    border: "1px solid #e8e5f0",
    borderRadius: "14px",
    background: "#fafafe",
  },

  infoLabel: {
    color: "#858598",
    fontSize: "11px",
    fontWeight: "700",
  },

  infoValue: {
    fontSize: "13px",
    overflowWrap: "anywhere",
  },

  nextStepBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "11px",
    marginTop: "20px",
    padding: "16px",
    color: "#075f49",
    border: "1px solid #bbf7d0",
    borderRadius: "15px",
    background: "#ecfdf5",
  },
};

export default UploadDataset;