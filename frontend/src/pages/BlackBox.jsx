import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  Download,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import api from "../services/api";

function BlackBox() {
  const [events, setEvents] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/blackbox/history");

      setEvents(response.data.events || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          "Black Box history load nahi ho paayi."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const searchableText = [
        event.event_id,
        event.event_type,
        event.status,
        event.model_file_name,
        event.dataset_file_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(
        searchText.toLowerCase()
      );

      const matchesStatus =
        selectedStatus === "ALL" ||
        String(event.status).toUpperCase() === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [events, searchText, selectedStatus]);

  const exportHistory = () => {
    const fileContent = JSON.stringify(events, null, 2);

    const blob = new Blob([fileContent], {
      type: "application/json",
    });

    const downloadUrl = URL.createObjectURL(blob);

    const anchor = document.createElement("a");

    anchor.href = downloadUrl;
    anchor.download = "modelguard_blackbox_history.json";

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <main style={styles.page}>
      <section style={styles.headingSection}>
        <div style={styles.headingIcon}>
          <Database size={29} />
        </div>

        <div>
          <p style={styles.label}>AI TRACEABILITY SYSTEM</p>

          <h1 style={styles.title}>Black Box Recorder</h1>

          <p style={styles.description}>
            Model training, testing, health reports aur deployment events ki
            complete reliability history inspect karo.
          </p>
        </div>
      </section>

      <section style={styles.controlsCard}>
        <div style={styles.searchBox}>
          <Search size={18} />

          <input
            type="text"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search event, model or dataset..."
            style={styles.searchInput}
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(event) => setSelectedStatus(event.target.value)}
          style={styles.select}
        >
          <option value="ALL">All Status</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
          <option value="ERROR">Error</option>
          <option value="BLOCKED">Blocked</option>
        </select>

        <button
          type="button"
          onClick={fetchEvents}
          style={styles.secondaryButton}
        >
          <RefreshCw size={17} />
          Refresh
        </button>

        <button
          type="button"
          onClick={exportHistory}
          disabled={events.length === 0}
          style={styles.primaryButton}
        >
          <Download size={17} />
          Export JSON
        </button>
      </section>

      <section style={styles.summaryGrid}>
        <SummaryCard
          title="Total Events"
          value={events.length}
          background="#f3e8ff"
          color="#7c3aed"
        />

        <SummaryCard
          title="Successful"
          value={
            events.filter(
              (event) =>
                String(event.status).toUpperCase() === "SUCCESS"
            ).length
          }
          background="#dcfce7"
          color="#059669"
        />

        <SummaryCard
          title="Failures"
          value={
            events.filter((event) =>
              ["FAILED", "ERROR", "BLOCKED"].includes(
                String(event.status).toUpperCase()
              )
            ).length
          }
          background="#fee2e2"
          color="#dc2626"
        />
      </section>

      {loading && (
        <section style={styles.stateCard}>
          <LoaderCircle size={28} />
          <p>Black Box history load ho rahi hai...</p>
        </section>
      )}

      {error && (
        <section style={styles.errorBox}>
          <AlertTriangle size={20} />
          <span>{error}</span>
        </section>
      )}

      {!loading && !error && filteredEvents.length === 0 && (
        <section style={styles.stateCard}>
          <Database size={35} />
          <h3>No events found</h3>
          <p>
            Pehle backend ke through koi Black Box event record karo.
          </p>
        </section>
      )}

      {!loading && filteredEvents.length > 0 && (
        <section style={styles.timeline}>
          {filteredEvents.map((event, index) => {
            const status = String(event.status || "").toUpperCase();

            const statusStyle = getStatusStyle(status);

            return (
              <article
                key={event.event_id || index}
                style={styles.eventCard}
              >
                <div style={styles.timelineLeft}>
                  <div
                    style={{
                      ...styles.eventIcon,
                      color: statusStyle.color,
                      background: statusStyle.background,
                    }}
                  >
                    {getStatusIcon(status)}
                  </div>

                  {index !== filteredEvents.length - 1 && (
                    <div style={styles.timelineLine} />
                  )}
                </div>

                <div style={styles.eventContent}>
                  <div style={styles.eventTop}>
                    <div>
                      <p style={styles.eventType}>
                        {formatEventType(event.event_type)}
                      </p>

                      <p style={styles.eventId}>
                        Event ID: {event.event_id}
                      </p>
                    </div>

                    <span
                      style={{
                        ...styles.statusBadge,
                        color: statusStyle.color,
                        background: statusStyle.background,
                      }}
                    >
                      {status || "UNKNOWN"}
                    </span>
                  </div>

                  <div style={styles.detailGrid}>
                    <EventDetail
                      label="Model"
                      value={event.model_file_name || "Not linked"}
                    />

                    <EventDetail
                      label="Dataset"
                      value={event.dataset_file_name || "Not linked"}
                    />

                    <EventDetail
                      label="Created At"
                      value={formatDate(event.created_at)}
                    />
                  </div>

                  {event.details &&
                    Object.keys(event.details).length > 0 && (
                      <div style={styles.detailsBox}>
                        <strong style={styles.detailsTitle}>
                          Event Details
                        </strong>

                        <pre style={styles.detailsPre}>
                          {JSON.stringify(event.details, null, 2)}
                        </pre>
                      </div>
                    )}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
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

function EventDetail({ label, value }) {
  return (
    <div style={styles.eventDetail}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatEventType(eventType) {
  if (!eventType) {
    return "Unknown Event";
  }

  return eventType
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function getStatusStyle(status) {
  if (status === "SUCCESS") {
    return {
      color: "#047857",
      background: "#d1fae5",
    };
  }

  if (status === "BLOCKED") {
    return {
      color: "#d97706",
      background: "#fef3c7",
    };
  }

  if (status === "FAILED" || status === "ERROR") {
    return {
      color: "#be123c",
      background: "#ffe4e6",
    };
  }

  return {
    color: "#475569",
    background: "#e2e8f0",
  };
}

function getStatusIcon(status) {
  if (status === "SUCCESS") {
    return <CheckCircle2 size={22} />;
  }

  if (status === "FAILED" || status === "ERROR") {
    return <XCircle size={22} />;
  }

  if (status === "BLOCKED") {
    return <AlertTriangle size={22} />;
  }

  return <Clock3 size={22} />;
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
    color: "white",
    borderRadius: "19px",
    background:
      "linear-gradient(135deg, #10b981, #0891b2)",
    boxShadow:
      "0 14px 30px rgba(5,150,105,0.2)",
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

  controlsCard: {
    display: "grid",
    gridTemplateColumns: "minmax(220px, 1fr) auto auto auto",
    gap: "12px",
    padding: "18px",
    border: "1px solid #e8e6f0",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.95)",
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "0 13px",
    border: "1px solid #ddd9e8",
    borderRadius: "12px",
    background: "#fafafe",
  },

  searchInput: {
    width: "100%",
    padding: "12px 0",
    border: "none",
    outline: "none",
    background: "transparent",
  },

  select: {
    padding: "12px 14px",
    border: "1px solid #ddd9e8",
    borderRadius: "12px",
    background: "white",
  },

  secondaryButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    padding: "12px 15px",
    color: "#6d28d9",
    border: "1px solid #ddd6fe",
    borderRadius: "12px",
    background: "#faf7ff",
    fontWeight: "700",
  },

  primaryButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    padding: "12px 15px",
    color: "white",
    border: "none",
    borderRadius: "12px",
    background:
      "linear-gradient(135deg, #7c3aed, #4f46e5)",
    fontWeight: "700",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "14px",
    marginTop: "18px",
  },

  summaryCard: {
    minHeight: "105px",
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
    fontSize: "29px",
  },

  stateCard: {
    display: "grid",
    placeItems: "center",
    gap: "8px",
    marginTop: "20px",
    padding: "45px 20px",
    color: "#747489",
    border: "1px solid #e8e6f0",
    borderRadius: "22px",
    background: "white",
    textAlign: "center",
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

  timeline: {
    marginTop: "22px",
  },

  eventCard: {
    display: "flex",
    gap: "16px",
  },

  timelineLeft: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  eventIcon: {
    width: "46px",
    height: "46px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    borderRadius: "15px",
  },

  timelineLine: {
    width: "2px",
    minHeight: "155px",
    flex: 1,
    margin: "7px 0",
    background: "#e2e8f0",
  },

  eventContent: {
    flex: 1,
    marginBottom: "18px",
    padding: "21px",
    border: "1px solid #e8e6f0",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.95)",
    boxShadow:
      "0 12px 35px rgba(66,52,104,0.05)",
  },

  eventTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
  },

  eventType: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "800",
  },

  eventId: {
    margin: "5px 0 0",
    color: "#8a8a9d",
    fontSize: "10px",
  },

  statusBadge: {
    padding: "7px 11px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: "800",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
    marginTop: "17px",
  },

  eventDetail: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    padding: "12px",
    borderRadius: "12px",
    background: "#f8fafc",
    overflowWrap: "anywhere",
  },

  detailsBox: {
    marginTop: "16px",
    padding: "14px",
    borderRadius: "13px",
    background: "#f8fafc",
  },

  detailsTitle: {
    fontSize: "12px",
  },

  detailsPre: {
    margin: "10px 0 0",
    overflowX: "auto",
    color: "#475569",
    fontSize: "11px",
    whiteSpace: "pre-wrap",
  },
};

export default BlackBox;