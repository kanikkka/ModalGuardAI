import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  GitBranch,
  LoaderCircle,
  PlayCircle,
  Search,
  ShieldAlert,
} from "lucide-react";

import api from "../services/api";

function FailureReplay() {
  const [mode, setMode] = useState("event");
  const [eventId, setEventId] = useState("");
  const [modelFileName, setModelFileName] = useState(
    localStorage.getItem("modelguard_model_file") || ""
  );

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      "Failure replay load nahi ho paaya."
    );
  };

  const runReplay = async () => {
    if (mode === "event" && !eventId.trim()) {
      setError("Event ID required hai.");
      return;
    }

    if (mode === "model" && !modelFileName.trim()) {
      setError("Model file name required hai.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const endpoint =
        mode === "event"
          ? `/failure-replay/event/${encodeURIComponent(
              eventId.trim()
            )}`
          : `/failure-replay/model/${encodeURIComponent(
              modelFileName.trim()
            )}`;

      const response = await api.get(endpoint);

      setResult(response.data?.replay || null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.page}>
      <section style={styles.headingSection}>
        <div style={styles.headingIcon}>
          <GitBranch size={30} />
        </div>

        <div>
          <p style={styles.label}>MODEL FAILURE INVESTIGATION</p>

          <h1 style={styles.title}>Failure Replay Engine</h1>

          <p style={styles.description}>
            Black Box event ya trained model ki reliability timeline replay
            karke failure reason aur possible root cause inspect karo.
          </p>
        </div>
      </section>

      <section style={styles.formCard}>
        <div style={styles.modeSwitch}>
          <button
            type="button"
            onClick={() => {
              setMode("event");
              setResult(null);
              setError("");
            }}
            style={{
              ...styles.modeButton,
              ...(mode === "event"
                ? styles.activeModeButton
                : {}),
            }}
          >
            Event Replay
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("model");
              setResult(null);
              setError("");
            }}
            style={{
              ...styles.modeButton,
              ...(mode === "model"
                ? styles.activeModeButton
                : {}),
            }}
          >
            Model Timeline
          </button>
        </div>

        {mode === "event" ? (
          <label style={styles.inputGroup}>
            <span style={styles.inputLabel}>
              Black Box Event ID
            </span>

            <input
              type="text"
              value={eventId}
              onChange={(event) => {
                setEventId(event.target.value);
                setError("");
                setResult(null);
              }}
              placeholder="Black Box page se event_id copy karo"
              style={styles.input}
            />
          </label>
        ) : (
          <label style={styles.inputGroup}>
            <span style={styles.inputLabel}>
              Trained Model File Name
            </span>

            <input
              type="text"
              value={modelFileName}
              onChange={(event) => {
                setModelFileName(event.target.value);
                setError("");
                setResult(null);
              }}
              placeholder="068863e1247849d59b6e0e5851802924_random_forest.pkl"
              style={styles.input}
            />
          </label>
        )}

        <button
          type="button"
          onClick={runReplay}
          disabled={loading}
          style={{
            ...styles.replayButton,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <>
              <LoaderCircle size={19} />
              Loading Replay...
            </>
          ) : (
            <>
              <PlayCircle size={19} />
              {mode === "event"
                ? "Replay Event"
                : "Load Model Timeline"}
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

      {result && mode === "event" && (
        <EventReplayResult result={result} />
      )}

      {result && mode === "model" && (
        <ModelReplayResult result={result} />
      )}
    </main>
  );
}

function EventReplayResult({ result }) {
  const event = result.event || {};
  const analysis = result.failure_analysis || {};
  const failed = Boolean(analysis.failure_detected);

  return (
    <>
      <section
        style={{
          ...styles.verdictCard,
          ...(failed
            ? styles.failedVerdict
            : styles.safeVerdict),
        }}
      >
        <div style={styles.verdictIcon}>
          {failed ? (
            <ShieldAlert size={31} />
          ) : (
            <CheckCircle2 size={31} />
          )}
        </div>

        <div>
          <p style={styles.label}>REPLAY VERDICT</p>

          <h2 style={styles.verdictTitle}>
            {failed
              ? "Failure Detected"
              : "No Critical Failure"}
          </h2>

          <p style={styles.verdictText}>
            {result.root_cause_summary ||
              "No root-cause summary returned."}
          </p>
        </div>
      </section>

      <section style={styles.detailGrid}>
        <DetailCard
          label="Event Type"
          value={formatText(event.event_type)}
        />

        <DetailCard
          label="Status"
          value={event.status || "Unknown"}
        />

        <DetailCard
          label="Model"
          value={event.model_file_name || "Not linked"}
        />

        <DetailCard
          label="Dataset"
          value={event.dataset_file_name || "Not linked"}
        />

        <DetailCard
          label="Created At"
          value={formatDate(event.created_at)}
        />

        <DetailCard
          label="Event ID"
          value={event.event_id || "Unknown"}
        />
      </section>

      {analysis.failure_reasons?.length > 0 && (
        <section style={styles.sectionCard}>
          <h2 style={styles.sectionTitle}>
            Failure Reasons
          </h2>

          <div style={styles.reasonList}>
            {analysis.failure_reasons.map(
              (reason, index) => (
                <div
                  key={`${reason}-${index}`}
                  style={styles.reasonItem}
                >
                  <AlertTriangle size={17} />
                  <span>{String(reason)}</span>
                </div>
              )
            )}
          </div>
        </section>
      )}

      {event.details &&
        Object.keys(event.details).length > 0 && (
          <section style={styles.sectionCard}>
            <h2 style={styles.sectionTitle}>
              Recorded Event Details
            </h2>

            <pre style={styles.jsonBlock}>
              {JSON.stringify(event.details, null, 2)}
            </pre>
          </section>
        )}
    </>
  );
}

function ModelReplayResult({ result }) {
  const timeline = result.timeline || [];
  const failures = result.failures || [];

  return (
    <>
      <section style={styles.summaryGrid}>
        <SummaryCard
          title="Total Events"
          value={result.total_events ?? 0}
          background="#f3e8ff"
          color="#7c3aed"
        />

        <SummaryCard
          title="Failures"
          value={result.failure_count ?? 0}
          background="#fee2e2"
          color="#dc2626"
        />

        <SummaryCard
          title="Model"
          value={result.model_file_name || "Unknown"}
          background="#e0f2fe"
          color="#0284c7"
          small
        />
      </section>

      <section style={styles.sectionCard}>
        <h2 style={styles.sectionTitle}>
          Model Reliability Timeline
        </h2>

        {timeline.length === 0 ? (
          <div style={styles.emptyState}>
            <Search size={30} />
            <p>
              Is model ke liye Black Box events nahi mile.
            </p>
          </div>
        ) : (
          <div style={styles.timeline}>
            {timeline.map((item, index) => (
              <article
                key={item.event_id || index}
                style={styles.timelineItem}
              >
                <div style={styles.timelineMarker}>
                  <Clock3 size={18} />
                </div>

                <div style={styles.timelineContent}>
                  <div style={styles.timelineTop}>
                    <strong>
                      Step {item.step}:{" "}
                      {formatText(item.event_type)}
                    </strong>

                    <span style={styles.statusBadge}>
                      {item.status || "UNKNOWN"}
                    </span>
                  </div>

                  <p style={styles.timelineDate}>
                    {formatDate(item.created_at)}
                  </p>

                  {item.details &&
                    Object.keys(item.details).length >
                      0 && (
                      <pre style={styles.smallJsonBlock}>
                        {JSON.stringify(
                          item.details,
                          null,
                          2
                        )}
                      </pre>
                    )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {failures.length > 0 && (
        <section style={styles.sectionCard}>
          <h2 style={styles.sectionTitle}>
            Detected Failures
          </h2>

          <div style={styles.failureGrid}>
            {failures.map((failure, index) => (
              <article
                key={failure.event_id || index}
                style={styles.failureCard}
              >
                <strong>
                  {formatText(failure.event_type)}
                </strong>

                <p style={styles.timelineDate}>
                  {formatDate(failure.created_at)}
                </p>

                {failure.failure_reasons?.map(
                  (reason, reasonIndex) => (
                    <div
                      key={`${reason}-${reasonIndex}`}
                      style={styles.reasonItem}
                    >
                      <AlertTriangle size={16} />
                      <span>{String(reason)}</span>
                    </div>
                  )
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function DetailCard({ label, value }) {
  return (
    <article style={styles.detailCard}>
      <span style={styles.detailLabel}>{label}</span>
      <strong style={styles.detailValue}>{value}</strong>
    </article>
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
      <span style={styles.detailLabel}>{title}</span>

      <strong
        style={{
          ...styles.summaryValue,
          color,
          fontSize: small ? "13px" : "30px",
        }}
      >
        {value}
      </strong>
    </article>
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

function formatDate(value) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString();
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
      "linear-gradient(135deg, #8b5cf6, #ec4899)",
    boxShadow:
      "0 14px 30px rgba(139,92,246,0.22)",
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

  modeSwitch: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    padding: "6px",
    borderRadius: "14px",
    background: "#f4f1fa",
  },

  modeButton: {
    padding: "11px",
    color: "#737386",
    border: "none",
    borderRadius: "10px",
    background: "transparent",
    cursor: "pointer",
    fontWeight: "700",
  },

  activeModeButton: {
    color: "#6d28d9",
    background: "white",
    boxShadow:
      "0 6px 18px rgba(76,29,149,0.09)",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "19px",
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

  replayButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "17px",
    padding: "14px",
    color: "white",
    border: "none",
    borderRadius: "13px",
    background:
      "linear-gradient(135deg, #8b5cf6, #ec4899)",
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

  failedVerdict: {
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
    lineHeight: 1.55,
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "13px",
    marginTop: "20px",
  },

  detailCard: {
    minHeight: "95px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "17px",
    border: "1px solid #e8e6f0",
    borderRadius: "16px",
    background: "white",
  },

  detailLabel: {
    color: "#858598",
    fontSize: "11px",
    fontWeight: "700",
  },

  detailValue: {
    fontSize: "13px",
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

  sectionTitle: {
    margin: 0,
    fontSize: "20px",
  },

  reasonList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "15px",
  },

  reasonItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    marginTop: "8px",
    color: "#9f1239",
    fontSize: "12px",
  },

  jsonBlock: {
    margin: "15px 0 0",
    padding: "16px",
    overflowX: "auto",
    borderRadius: "14px",
    background: "#0f172a",
    color: "#e2e8f0",
    fontSize: "11px",
    whiteSpace: "pre-wrap",
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

  summaryValue: {
    overflowWrap: "anywhere",
  },

  timeline: {
    marginTop: "18px",
  },

  timelineItem: {
    display: "flex",
    gap: "13px",
    marginTop: "13px",
  },

  timelineMarker: {
    width: "40px",
    height: "40px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    color: "#7c3aed",
    borderRadius: "13px",
    background: "#f3e8ff",
  },

  timelineContent: {
    flex: 1,
    padding: "16px",
    border: "1px solid #ebe8f2",
    borderRadius: "15px",
    background: "#fafafe",
  },

  timelineTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
  },

  statusBadge: {
    padding: "6px 9px",
    color: "#047857",
    borderRadius: "17px",
    background: "#d1fae5",
    fontSize: "9px",
    fontWeight: "800",
  },

  timelineDate: {
    margin: "6px 0 0",
    color: "#858598",
    fontSize: "10px",
  },

  smallJsonBlock: {
    margin: "12px 0 0",
    padding: "12px",
    overflowX: "auto",
    borderRadius: "11px",
    background: "#f1f5f9",
    color: "#475569",
    fontSize: "10px",
    whiteSpace: "pre-wrap",
  },

  failureGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "13px",
    marginTop: "16px",
  },

  failureCard: {
    padding: "17px",
    border: "1px solid #fecdd3",
    borderRadius: "15px",
    background: "#fff1f2",
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

export default FailureReplay;
