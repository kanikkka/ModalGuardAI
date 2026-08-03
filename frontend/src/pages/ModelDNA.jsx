import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Dna,
  FileBadge,
  Fingerprint,
  Hash,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import api from "../services/api";

function ModelDNA() {
  const [modelFileName, setModelFileName] = useState(
    localStorage.getItem("modelguard_model_file") || ""
  );

  const [healthScore, setHealthScore] = useState(90);
  const [grade, setGrade] = useState("A");
  const [deploymentStatus, setDeploymentStatus] =
    useState("APPROVED");

  const [modelDNA, setModelDNA] = useState(null);
  const [registry, setRegistry] = useState([]);

  const [loading, setLoading] = useState(false);
  const [registryLoading, setRegistryLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

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
      "Model DNA generate nahi ho paaya."
    );
  };

  const generateModelDNA = async () => {
    if (!modelFileName.trim()) {
      setError("Model file name required hai.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setModelDNA(null);

      const response = await api.post(
        "/model-dna/generate",
        {
          model_file_name: modelFileName.trim(),
          health_score: Number(healthScore),
          grade: grade.trim(),
          deployment_status:
            deploymentStatus.trim(),
        }
      );

      const dna =
        response.data?.model_dna ||
        response.data?.dna ||
        null;

      if (!dna) {
        throw new Error(
          "Backend response me Model DNA nahi mila."
        );
      }

      setModelDNA(dna);

      localStorage.setItem(
        "modelguard_model_id",
        dna.model_id || ""
      );

      await loadRegistry();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const loadRegistry = async () => {
    try {
      setRegistryLoading(true);

      const response = await api.get(
        "/model-dna/registry"
      );

      setRegistry(response.data?.models || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setRegistryLoading(false);
    }
  };

  useEffect(() => {
    loadRegistry();
  }, []);

  const copyValue = async (label, value) => {
    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(String(value));
    setCopied(label);

    window.setTimeout(() => {
      setCopied("");
    }, 1500);
  };

  return (
    <main style={styles.page}>
      <section style={styles.headingSection}>
        <div style={styles.headingIcon}>
          <Dna size={30} />
        </div>

        <div>
          <p style={styles.label}>
            MODEL IDENTITY & VERSIONING
          </p>

          <h1 style={styles.title}>Model DNA</h1>

          <p style={styles.description}>
            Trained ML model ka unique fingerprint,
            metadata, lineage aur registry version
            generate karo.
          </p>
        </div>
      </section>

      <section style={styles.formCard}>
        <h2 style={styles.sectionTitle}>
          Generate Model DNA
        </h2>

        <p style={styles.sectionDescription}>
          Upload & Train page se saved model filename
          automatically load ho sakta hai.
        </p>

        <div style={styles.formGrid}>
          <label style={styles.inputGroup}>
            <span style={styles.inputLabel}>
              Model File Name
            </span>

            <input
              type="text"
              value={modelFileName}
              onChange={(event) => {
                setModelFileName(event.target.value);
                setError("");
                setModelDNA(null);
              }}
              placeholder="068863e1247849d59b6e0e5851802924_random_forest.pkl"
              style={styles.input}
            />
          </label>

          <label style={styles.inputGroup}>
            <span style={styles.inputLabel}>
              Health Score
            </span>

            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={healthScore}
              onChange={(event) =>
                setHealthScore(event.target.value)
              }
              style={styles.input}
            />
          </label>

          <label style={styles.inputGroup}>
            <span style={styles.inputLabel}>
              Grade
            </span>

            <select
              value={grade}
              onChange={(event) =>
                setGrade(event.target.value)
              }
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

            <select
              value={deploymentStatus}
              onChange={(event) =>
                setDeploymentStatus(
                  event.target.value
                )
              }
              style={styles.input}
            >
              <option value="APPROVED">
                APPROVED
              </option>
              <option value="CONDITIONAL_APPROVAL">
                CONDITIONAL_APPROVAL
              </option>
              <option value="BLOCKED">
                BLOCKED
              </option>
              <option value="RETEST_REQUIRED">
                RETEST_REQUIRED
              </option>
            </select>
          </label>
        </div>

        <button
          type="button"
          onClick={generateModelDNA}
          disabled={loading}
          style={{
            ...styles.generateButton,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <>
              <LoaderCircle size={19} />
              Generating Model DNA...
            </>
          ) : (
            <>
              <Sparkles size={19} />
              Generate Model DNA
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

      {modelDNA && (
        <>
          <section style={styles.heroCard}>
            <div style={styles.heroIcon}>
              <Fingerprint size={39} />
            </div>

            <div style={styles.heroContent}>
              <p style={styles.label}>
                UNIQUE MODEL IDENTITY
              </p>

              <h2 style={styles.modelId}>
                {modelDNA.model_id}
              </h2>

              <div style={styles.badgeRow}>
                <span style={styles.versionBadge}>
                  {modelDNA.registry_version ||
                    modelDNA.dna_version ||
                    "v1"}
                </span>

                <span
                  style={{
                    ...styles.statusBadge,
                    ...getStatusStyle(
                      modelDNA.deployment_status
                    ),
                  }}
                >
                  <ShieldCheck size={15} />
                  {modelDNA.deployment_status ||
                    "NOT EVALUATED"}
                </span>
              </div>
            </div>
          </section>

          <section style={styles.summaryGrid}>
            <SummaryCard
              title="Algorithm"
              value={
                modelDNA.algorithm || "Unknown"
              }
              background="#f3e8ff"
              color="#7c3aed"
              small
            />

            <SummaryCard
              title="Health Score"
              value={
                modelDNA.health_score ??
                "Not provided"
              }
              background="#dcfce7"
              color="#059669"
            />

            <SummaryCard
              title="Grade"
              value={modelDNA.grade || "N/A"}
              background="#e0f2fe"
              color="#0284c7"
            />

            <SummaryCard
              title="Feature Count"
              value={
                modelDNA.feature_count ?? 0
              }
              background="#fef3c7"
              color="#d97706"
            />
          </section>

          <section style={styles.sectionCard}>
            <div style={styles.sectionHeading}>
              <div style={styles.sectionIcon}>
                <Hash size={22} />
              </div>

              <div>
                <p style={styles.label}>
                  CRYPTOGRAPHIC IDENTITY
                </p>
                <h2 style={styles.sectionTitle}>
                  Fingerprint & Hash
                </h2>
              </div>
            </div>

            <CopyField
              label="Short Fingerprint"
              value={modelDNA.fingerprint}
              onCopy={() =>
                copyValue(
                  "fingerprint",
                  modelDNA.fingerprint
                )
              }
              copied={
                copied === "fingerprint"
              }
            />

            <CopyField
              label="SHA-256 Model Hash"
              value={modelDNA.model_hash}
              onCopy={() =>
                copyValue(
                  "hash",
                  modelDNA.model_hash
                )
              }
              copied={copied === "hash"}
            />

            <CopyField
              label="DNA Record ID"
              value={modelDNA.dna_id}
              onCopy={() =>
                copyValue(
                  "dna",
                  modelDNA.dna_id
                )
              }
              copied={copied === "dna"}
            />
          </section>

          <section style={styles.sectionCard}>
            <div style={styles.sectionHeading}>
              <div style={styles.sectionIcon}>
                <FileBadge size={22} />
              </div>

              <div>
                <p style={styles.label}>
                  MODEL LINEAGE
                </p>
                <h2 style={styles.sectionTitle}>
                  Metadata
                </h2>
              </div>
            </div>

            <div style={styles.detailGrid}>
              <DetailCard
                label="Model File"
                value={
                  modelDNA.model_file_name
                }
              />

              <DetailCard
                label="Dataset File"
                value={
                  modelDNA.dataset_file_name ||
                  "Not recorded"
                }
              />

              <DetailCard
                label="Target Column"
                value={
                  modelDNA.target_column ||
                  "Not recorded"
                }
              />

              <DetailCard
                label="DNA Version"
                value={
                  modelDNA.dna_version || "1.0"
                }
              />

              <DetailCard
                label="Created At"
                value={formatDate(
                  modelDNA.created_at
                )}
              />

              <DetailCard
                label="Registry Version"
                value={
                  modelDNA.registry_version ||
                  "Not assigned"
                }
              />
            </div>

            {modelDNA.feature_columns?.length >
              0 && (
              <div style={styles.featureBox}>
                <span style={styles.inputLabel}>
                  Feature Columns
                </span>

                <div style={styles.featureList}>
                  {modelDNA.feature_columns.map(
                    (feature) => (
                      <span
                        key={feature}
                        style={styles.featureTag}
                      >
                        {feature}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </section>
        </>
      )}

      <section style={styles.sectionCard}>
        <div style={styles.registryHeader}>
          <div>
            <p style={styles.label}>
              VERSION HISTORY
            </p>

            <h2 style={styles.sectionTitle}>
              Model DNA Registry
            </h2>
          </div>

          <button
            type="button"
            onClick={loadRegistry}
            disabled={registryLoading}
            style={styles.refreshButton}
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {registryLoading ? (
          <div style={styles.emptyState}>
            <LoaderCircle size={27} />
            <p>Registry load ho rahi hai...</p>
          </div>
        ) : registry.length === 0 ? (
          <div style={styles.emptyState}>
            <Dna size={31} />
            <p>
              Abhi koi Model DNA register nahi hua.
            </p>
          </div>
        ) : (
          <div style={styles.registryGrid}>
            {registry.map((item, index) => (
              <article
                key={item.dna_id || index}
                style={styles.registryCard}
              >
                <div style={styles.registryTop}>
                  <div>
                    <span style={styles.smallLabel}>
                      Model ID
                    </span>

                    <strong style={styles.registryId}>
                      {item.model_id}
                    </strong>
                  </div>

                  <span style={styles.versionBadge}>
                    {item.registry_version ||
                      item.dna_version ||
                      "v1"}
                  </span>
                </div>

                <div style={styles.registryInfo}>
                  <span>
                    {item.algorithm ||
                      "Unknown algorithm"}
                  </span>

                  <span>
                    Grade {item.grade || "N/A"}
                  </span>

                  <span>
                    {formatDate(
                      item.created_at
                    )}
                  </span>
                </div>
              </article>
            ))}
          </div>
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
      <span style={styles.smallLabel}>
        {title}
      </span>

      <strong
        style={{
          ...styles.summaryValue,
          color,
          fontSize: small ? "15px" : "29px",
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
      <span style={styles.smallLabel}>
        {label}
      </span>

      <strong style={styles.detailValue}>
        {value}
      </strong>
    </article>
  );
}

function CopyField({
  label,
  value,
  onCopy,
  copied,
}) {
  return (
    <div style={styles.copyField}>
      <div style={styles.copyContent}>
        <span style={styles.smallLabel}>
          {label}
        </span>

        <code style={styles.codeValue}>
          {value || "Not available"}
        </code>
      </div>

      <button
        type="button"
        onClick={onCopy}
        disabled={!value}
        style={styles.copyButton}
      >
        {copied ? (
          <CheckCircle2 size={17} />
        ) : (
          <Copy size={17} />
        )}

        {copied ? "Copied" : "Copy"}
      </button>
    </div>
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

function getStatusStyle(status) {
  const normalized = String(
    status || ""
  ).toUpperCase();

  if (normalized === "APPROVED") {
    return {
      color: "#047857",
      background: "#d1fae5",
    };
  }

  if (
    normalized ===
    "CONDITIONAL_APPROVAL"
  ) {
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
      "linear-gradient(135deg, #06b6d4, #7c3aed)",
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

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
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
      "linear-gradient(135deg, #06b6d4, #7c3aed)",
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

  heroCard: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    marginTop: "20px",
    padding: "26px",
    border: "1px solid #ddd6fe",
    borderRadius: "23px",
    background:
      "radial-gradient(circle at 100% 0%, rgba(165,243,252,0.5), transparent 35%), linear-gradient(145deg, white, #faf7ff)",
  },

  heroIcon: {
    width: "72px",
    height: "72px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    color: "#7c3aed",
    borderRadius: "22px",
    background: "#f3e8ff",
  },

  heroContent: {
    minWidth: 0,
  },

  modelId: {
    margin: 0,
    color: "#172033",
    fontSize: "25px",
    overflowWrap: "anywhere",
  },

  badgeRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "9px",
    marginTop: "11px",
  },

  versionBadge: {
    padding: "7px 10px",
    color: "#6d28d9",
    borderRadius: "18px",
    background: "#f3e8ff",
    fontSize: "10px",
    fontWeight: "800",
  },

  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 10px",
    borderRadius: "18px",
    fontSize: "10px",
    fontWeight: "800",
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

  copyField: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "14px",
    marginTop: "12px",
    padding: "14px",
    border: "1px solid #ece8f2",
    borderRadius: "14px",
    background: "#fafafe",
  },

  copyContent: {
    minWidth: 0,
  },

  codeValue: {
    display: "block",
    marginTop: "6px",
    color: "#334155",
    fontSize: "11px",
    overflowWrap: "anywhere",
  },

  copyButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flexShrink: 0,
    padding: "9px 11px",
    color: "#6d28d9",
    border: "1px solid #ddd6fe",
    borderRadius: "10px",
    background: "white",
    cursor: "pointer",
    fontWeight: "700",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(190px, 1fr))",
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
    fontSize: "12px",
    overflowWrap: "anywhere",
  },

  featureBox: {
    marginTop: "17px",
    padding: "16px",
    borderRadius: "14px",
    background: "#fafafe",
  },

  featureList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "10px",
  },

  featureTag: {
    padding: "7px 10px",
    color: "#0891b2",
    borderRadius: "17px",
    background: "#cffafe",
    fontSize: "10px",
    fontWeight: "700",
  },

  registryHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "14px",
  },

  refreshButton: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "10px 12px",
    color: "#6d28d9",
    border: "1px solid #ddd6fe",
    borderRadius: "11px",
    background: "#faf7ff",
    cursor: "pointer",
    fontWeight: "700",
  },

  registryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "14px",
    marginTop: "18px",
  },

  registryCard: {
    padding: "17px",
    border: "1px solid #ece8f2",
    borderRadius: "16px",
    background: "#fafafe",
  },

  registryTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "10px",
  },

  registryId: {
    display: "block",
    marginTop: "6px",
    fontSize: "12px",
    overflowWrap: "anywhere",
  },

  registryInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    marginTop: "13px",
    color: "#747489",
    fontSize: "10px",
  },

  emptyState: {
    display: "grid",
    placeItems: "center",
    gap: "8px",
    padding: "35px",
    color: "#858598",
    textAlign: "center",
  },
};

export default ModelDNA;
