import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Activity,
  BrainCircuit,
  Database,
  FileBadge,
  FileText,
  FlaskConical,
  GitBranch,
  LayoutDashboard,
  Network,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";

const navigationItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Upload & Train",
    path: "/upload",
    icon: BrainCircuit,
  },
  {
    name: "Crash Test Lab",
    path: "/crash-tests",
    icon: FlaskConical,
  },
  {
    name: "Health Report",
    path: "/health-report",
    icon: Activity,
  },
  {
    name: "Black Box",
    path: "/blackbox",
    icon: Database,
  },
  {
    name: "Failure Replay",
    path: "/failure-replay",
    icon: GitBranch,
  },
  {
    name: "Treatment Engine",
    path: "/treatment",
    icon: Stethoscope,
  },
  {
    name: "Knowledge Graph",
    path: "/knowledge-graph",
    icon: Network,
  },
  {
    name: "Model DNA",
    path: "/model-dna",
    icon: FileBadge,
  },
  {
    name: "AI Investigation",
    path: "/agents",
    icon: Sparkles,
  },
  {
    name: "LLM Report",
    path: "/llm-report",
    icon: FileText,
  },
];

function AppLayout() {
  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.logo}>
            <ShieldCheck size={25} />
          </div>

          <div>
            <h2 style={styles.brandName}>ModelGuard</h2>
            <p style={styles.brandSubtitle}>AI Reliability</p>
          </div>
        </div>

        <p style={styles.menuLabel}>WORKSPACE</p>

        <nav style={styles.navigation}>
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                style={({ isActive }) => ({
                  ...styles.navigationItem,
                  ...(isActive
                    ? styles.activeNavigationItem
                    : {}),
                })}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.statusCard}>
            <div style={styles.statusIcon}>
              <ShieldCheck size={19} />
            </div>

            <div>
              <strong style={styles.statusTitle}>
                Backend Connected
              </strong>

              <p style={styles.statusText}>
                ModelGuard API
              </p>
            </div>
          </div>
        </div>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <p style={styles.headerLabel}>
              MODEL RELIABILITY WORKSPACE
            </p>

            <h1 style={styles.headerTitle}>
              ModelGuard AI
            </h1>
          </div>

          <div style={styles.headerBadge}>
            <ShieldCheck size={17} />
            System Active
          </div>
        </header>

        <section style={styles.content}>
          <Outlet />
        </section>
      </main>
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    display: "flex",
    color: "#172033",
    background:
      "radial-gradient(circle at 85% 10%, rgba(224,242,254,0.75), transparent 27%), radial-gradient(circle at 25% 12%, rgba(243,232,255,0.6), transparent 25%), #f8f9fd",
    fontFamily: "'DM Sans', Arial, sans-serif",
  },

  sidebar: {
    position: "fixed",
    top: 0,
    bottom: 0,
    left: 0,
    width: "255px",
    display: "flex",
    flexDirection: "column",
    padding: "24px 18px",
    borderRight: "1px solid #ececf3",
    background: "rgba(255,255,255,0.94)",
    backdropFilter: "blur(18px)",
    overflowY: "auto",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "34px",
    padding: "0 9px",
  },

  logo: {
    width: "45px",
    height: "45px",
    display: "grid",
    placeItems: "center",
    color: "white",
    borderRadius: "15px",
    background:
      "linear-gradient(135deg, #7c3aed, #4f46e5, #38bdf8)",
    boxShadow: "0 12px 25px rgba(124,58,237,0.24)",
  },

  brandName: {
    margin: 0,
    fontSize: "19px",
  },

  brandSubtitle: {
    margin: "2px 0 0",
    color: "#8a8aa0",
    fontSize: "11px",
  },

  menuLabel: {
    margin: "0 12px 10px",
    color: "#9999aa",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1.3px",
  },

  navigation: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  navigationItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "11px 13px",
    color: "#707082",
    borderRadius: "12px",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: "600",
  },

  activeNavigationItem: {
    color: "#6d28d9",
    background:
      "linear-gradient(90deg, #f1eafe, #f7f5ff)",
    boxShadow: "inset 3px 0 #7c3aed",
  },

  sidebarFooter: {
    marginTop: "auto",
    paddingTop: "20px",
  },

  statusCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "13px",
    border: "1px solid #bbf7d0",
    borderRadius: "15px",
    background: "#ecfdf5",
  },

  statusIcon: {
    width: "37px",
    height: "37px",
    display: "grid",
    placeItems: "center",
    color: "#059669",
    borderRadius: "12px",
    background: "white",
  },

  statusTitle: {
    color: "#047857",
    fontSize: "11px",
  },

  statusText: {
    margin: "2px 0 0",
    color: "#6f857e",
    fontSize: "9px",
  },

  main: {
    width: "calc(100% - 255px)",
    marginLeft: "255px",
  },

  header: {
    minHeight: "88px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 32px",
    borderBottom: "1px solid #e9e9f1",
    background: "rgba(248,249,253,0.76)",
    backdropFilter: "blur(12px)",
  },

  headerLabel: {
    margin: 0,
    color: "#8a8aa0",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1.2px",
  },

  headerTitle: {
    margin: "4px 0 0",
    fontSize: "23px",
  },

  headerBadge: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "9px 13px",
    color: "#047857",
    border: "1px solid #bbf7d0",
    borderRadius: "20px",
    background: "#ecfdf5",
    fontSize: "11px",
    fontWeight: "700",
  },

  content: {
    padding: "28px 32px 45px",
  },
};

export default AppLayout;