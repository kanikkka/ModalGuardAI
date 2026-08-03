import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  LoaderCircle,
  Network,
  Sparkles,
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

function KnowledgeGraph() {
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
      "Knowledge Graph generate nahi ho paaya."
    );
  };

  const generateGraph = async () => {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await api.post(
        "/knowledge-graph/build",
        metrics
      );

      setResult(response.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const nodeMap = useMemo(() => {
    const map = {};

    result?.graph?.nodes?.forEach((node) => {
      map[node.id] = node;
    });

    return map;
  }, [result]);

  return (
    <main style={styles.page}>
      <section style={styles.headingSection}>
        <div style={styles.headingIcon}>
          <Network size={30} />
        </div>

        <div>
          <p style={styles.label}>ROOT-CAUSE INTELLIGENCE</p>

          <h1 style={styles.title}>Knowledge Graph</h1>

          <p style={styles.description}>
            Model issues ko effects, deployment risks aur recommended
            treatments ke saath connected graph me inspect karo.
          </p>
        </div>
      </section>

      <section style={styles.formCard}>
        <h2 style={styles.sectionTitle}>
          Enter Reliability Metrics
        </h2>

        <p style={styles.sectionDescription}>
          Weak values use karke root-cause relationships clearly test kar
          sakte ho.
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
          onClick={generateGraph}
          disabled={loading}
          style={{
            ...styles.generateButton,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <>
              <LoaderCircle size={19} />
              Building Knowledge Graph...
            </>
          ) : (
            <>
              <Sparkles size={19} />
              Build Knowledge Graph
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
          <section style={styles.summaryCard}>
            <div style={styles.summaryIcon}>
              <BrainCircuit size={27} />
            </div>

            <div>
              <p style={styles.label}>ROOT-CAUSE SUMMARY</p>

              <h2 style={styles.summaryTitle}>
                {result.summary ||
                  "No major reliability issue detected."}
              </h2>
            </div>
          </section>

          <section style={styles.statsGrid}>
            <StatCard
              title="Root Causes"
              value={result.root_causes?.length ?? 0}
              background="#fee2e2"
              color="#dc2626"
            />

            <StatCard
              title="Failure Paths"
              value={result.failure_paths?.length ?? 0}
              background="#fef3c7"
              color="#d97706"
            />

            <StatCard
              title="Graph Nodes"
              value={result.graph?.nodes?.length ?? 0}
              background="#f3e8ff"
              color="#7c3aed"
            />

            <StatCard
              title="Graph Edges"
              value={result.graph?.edges?.length ?? 0}
              background="#e0f2fe"
              color="#0284c7"
            />
          </section>

          <section style={styles.sectionCard}>
            <h2 style={styles.sectionTitle}>Root Causes</h2>

            {result.root_causes?.length ? (
              <div style={styles.rootCauseGrid}>
                {result.root_causes.map(
                  (rootCause, index) => (
                    <article
                      key={`${rootCause.issue}-${index}`}
                      style={styles.rootCauseCard}
                    >
                      <div style={styles.cardTop}>
                        <div>
                          <span style={styles.smallLabel}>
                            Severity Rank
                          </span>

                          <strong style={styles.rank}>
                            #{rootCause.severity_rank}
                          </strong>
                        </div>

                        <span style={styles.issueBadge}>
                          {rootCause.issue_label}
                        </span>
                      </div>

                      <InfoList
                        title="Effects"
                        items={rootCause.effects}
                      />

                      <InfoList
                        title="Recommended Treatments"
                        items={
                          rootCause.recommended_treatments
                        }
                        success
                      />
                    </article>
                  )
                )}
              </div>
            ) : (
              <EmptyState />
            )}
          </section>

          <section style={styles.sectionCard}>
            <h2 style={styles.sectionTitle}>
              Failure Paths
            </h2>

            {result.failure_paths?.length ? (
              <div style={styles.pathList}>
                {result.failure_paths.map(
                  (path, pathIndex) => (
                    <div
                      key={`path-${pathIndex}`}
                      style={styles.pathCard}
                    >
                      {path.map((nodeId, nodeIndex) => (
                        <React.Fragment
                          key={`${nodeId}-${nodeIndex}`}
                        >
                          <span
                            style={{
                              ...styles.pathNode,
                              ...getNodeStyle(
                                nodeMap[nodeId]?.type
                              ),
                            }}
                          >
                            {nodeMap[nodeId]?.label ||
                              formatText(nodeId)}
                          </span>

                          {nodeIndex < path.length - 1 && (
                            <ArrowRight
                              size={17}
                              color="#8a8a9d"
                            />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )
                )}
              </div>
            ) : (
              <EmptyState />
            )}
          </section>

          <section style={styles.sectionCard}>
            <h2 style={styles.sectionTitle}>
              Graph Relationships
            </h2>

            <div style={styles.edgeGrid}>
              {result.graph?.edges?.map(
                (edge, index) => (
                  <article
                    key={`${edge.source}-${edge.target}-${index}`}
                    style={styles.edgeCard}
                  >
                    <span
                      style={{
                        ...styles.pathNode,
                        ...getNodeStyle(
                          nodeMap[edge.source]?.type
                        ),
                      }}
                    >
                      {nodeMap[edge.source]?.label ||
                        formatText(edge.source)}
                    </span>

                    <div style={styles.relationship}>
                      <ArrowRight size={17} />
                      <strong>{edge.relation}</strong>
                    </div>

                    <span
                      style={{
                        ...styles.pathNode,
                        ...getNodeStyle(
                          nodeMap[edge.target]?.type
                        ),
                      }}
                    >
                      {nodeMap[edge.target]?.label ||
                        formatText(edge.target)}
                    </span>
                  </article>
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

function StatCard({
  title,
  value,
  background,
  color,
}) {
  return (
    <article
      style={{
        ...styles.statCard,
        background,
      }}
    >
      <span style={styles.smallLabel}>{title}</span>

      <strong
        style={{
          ...styles.statValue,
          color,
        }}
      >
        {value}
      </strong>
    </article>
  );
}

function InfoList({ title, items = [], success = false }) {
  return (
    <div style={styles.infoBlock}>
      <span style={styles.smallLabel}>{title}</span>

      {items.length ? (
        items.map((item, index) => (
          <div
            key={`${item}-${index}`}
            style={{
              ...styles.infoItem,
              ...(success
                ? styles.successInfoItem
                : styles.riskInfoItem),
            }}
          >
            {success ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertTriangle size={16} />
            )}

            <span>{formatText(item)}</span>
          </div>
        ))
      ) : (
        <p style={styles.emptyText}>None</p>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={styles.emptyState}>
      <CheckCircle2 size={30} />
      <p>No issue relationship found.</p>
    </div>
  );
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

function getNodeStyle(type) {
  if (type === "issue") {
    return {
      color: "#be123c",
      background: "#ffe4e6",
    };
  }

  if (type === "effect") {
    return {
      color: "#b45309",
      background: "#fef3c7",
    };
  }

  if (type === "risk") {
    return {
      color: "#c2410c",
      background: "#ffedd5",
    };
  }

  if (type === "treatment") {
    return {
      color: "#047857",
      background: "#d1fae5",
    };
  }

  return {
    color: "#6d28d9",
    background: "#f3e8ff",
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
      "linear-gradient(135deg, #7c3aed, #0891b2)",
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
      "linear-gradient(135deg, #7c3aed, #0891b2)",
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

  summaryCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginTop: "20px",
    padding: "24px",
    border: "1px solid #ddd6fe",
    borderRadius: "22px",
    background:
      "linear-gradient(145deg, #ffffff, #faf7ff)",
  },

  summaryIcon: {
    width: "56px",
    height: "56px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    color: "#7c3aed",
    borderRadius: "17px",
    background: "#f3e8ff",
  },

  summaryTitle: {
    margin: 0,
    fontSize: "18px",
    lineHeight: 1.5,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "14px",
    marginTop: "20px",
  },

  statCard: {
    minHeight: "105px",
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

  statValue: {
    fontSize: "29px",
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

  rootCauseGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "15px",
    marginTop: "17px",
  },

  rootCauseCard: {
    padding: "18px",
    border: "1px solid #ece8f2",
    borderRadius: "17px",
    background: "#fafafe",
  },

  cardTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
  },

  rank: {
    display: "block",
    marginTop: "5px",
    color: "#7c3aed",
    fontSize: "23px",
  },

  issueBadge: {
    padding: "7px 10px",
    color: "#be123c",
    borderRadius: "18px",
    background: "#ffe4e6",
    fontSize: "10px",
    fontWeight: "800",
  },

  infoBlock: {
    marginTop: "15px",
  },

  infoItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    marginTop: "8px",
    padding: "10px",
    borderRadius: "11px",
    fontSize: "11px",
  },

  riskInfoItem: {
    color: "#9f1239",
    background: "#fff1f2",
  },

  successInfoItem: {
    color: "#047857",
    background: "#ecfdf5",
  },

  emptyText: {
    margin: "8px 0 0",
    color: "#858598",
    fontSize: "11px",
  },

  pathList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "17px",
  },

  pathCard: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "9px",
    padding: "14px",
    borderRadius: "14px",
    background: "#fafafe",
  },

  pathNode: {
    padding: "8px 11px",
    borderRadius: "18px",
    fontSize: "10px",
    fontWeight: "800",
  },

  edgeGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "12px",
    marginTop: "17px",
  },

  edgeCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "9px",
    padding: "14px",
    border: "1px solid #ece8f2",
    borderRadius: "14px",
    background: "#fafafe",
  },

  relationship: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    color: "#858598",
    fontSize: "9px",
  },

  emptyState: {
    display: "grid",
    placeItems: "center",
    gap: "8px",
    padding: "35px",
    color: "#059669",
    textAlign: "center",
  },
};

export default KnowledgeGraph;
