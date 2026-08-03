from typing import Any

from app.health_report.report_generator import generate_health_report
from app.knowledge_graph.graph_builder import build_reliability_graph
from app.knowledge_graph.graph_queries import (
    export_graph_as_json,
    find_paths_to_model,
)
from app.knowledge_graph.root_cause import (
    find_root_causes,
    generate_root_cause_summary,
)
from app.treatment.treatment_plan import generate_treatment_plan


class InspectorAgent:
    """Dataset aur crash-test metrics ki initial inspection karta hai."""

    @staticmethod
    def inspect(metrics: dict[str, Any]) -> dict[str, Any]:
        detected_issues: list[str] = []

        if float(metrics.get("noise_stability", 100)) < 80:
            detected_issues.append("Noise sensitivity")

        if float(metrics.get("missing_stability", 100)) < 80:
            detected_issues.append("Missing-value instability")

        if float(metrics.get("outlier_stability", 100)) < 80:
            detected_issues.append("Outlier sensitivity")

        if float(metrics.get("drift_stability", 100)) < 80:
            detected_issues.append("Feature drift")

        if float(metrics.get("class_balance", 100)) < 60:
            detected_issues.append("Class imbalance")

        if float(metrics.get("duplicate_score", 100)) < 95:
            detected_issues.append("Duplicate records")

        if float(metrics.get("leakage_score", 100)) < 100:
            detected_issues.append("Possible data leakage")

        return {
            "agent": "Inspector Agent",
            "status": (
                "ISSUES_DETECTED"
                if detected_issues
                else "HEALTHY"
            ),
            "detected_issues": detected_issues,
            "issue_count": len(detected_issues),
        }


class DiagnosisAgent:
    """Knowledge graph ke through root-cause chain identify karta hai."""

    @staticmethod
    def diagnose(metrics: dict[str, Any]) -> dict[str, Any]:
        graph = build_reliability_graph(metrics)
        root_causes = find_root_causes(graph)

        return {
            "agent": "Diagnosis Agent",
            "summary": generate_root_cause_summary(root_causes),
            "root_causes": root_causes,
            "failure_paths": find_paths_to_model(graph),
            "graph": export_graph_as_json(graph),
        }


class TreatmentAgent:
    """Detected problems ke liye evidence-based treatment plan deta hai."""

    @staticmethod
    def prescribe(metrics: dict[str, Any]) -> dict[str, Any]:
        treatment_plan = generate_treatment_plan(metrics)

        return {
            "agent": "Treatment Agent",
            **treatment_plan,
        }


class HealthAgent:
    """Verified metrics se final model-health report generate karta hai."""

    @staticmethod
    def evaluate(metrics: dict[str, Any]) -> dict[str, Any]:
        health_metrics = {
            "accuracy": float(metrics.get("accuracy", 0)),
            "noise": float(metrics.get("noise_stability", 0)),
            "missing": float(metrics.get("missing_stability", 0)),
            "outlier": float(metrics.get("outlier_stability", 0)),
            "drift": float(metrics.get("drift_stability", 0)),
            "label_noise": float(metrics.get("label_noise", 100)),
            "imbalance": float(metrics.get("class_balance", 100)),
            "duplicate": float(metrics.get("duplicate_score", 100)),
            "leakage": float(metrics.get("leakage_score", 100)),
        }

        report = generate_health_report(health_metrics)

        return {
            "agent": "Health Agent",
            **report,
        }


class DeploymentGuardianAgent:
    """Final safety rules ke basis par deployment decision deta hai."""

    @staticmethod
    def decide(
        metrics: dict[str, Any],
        health_report: dict[str, Any],
    ) -> dict[str, Any]:
        health_score = float(
            health_report.get("health_score", 0)
        )

        leakage_score = float(
            metrics.get("leakage_score", 100)
        )

        drift_stability = float(
            metrics.get("drift_stability", 100)
        )

        class_balance = float(
            metrics.get("class_balance", 100)
        )

        blocking_reasons: list[str] = []

        if leakage_score < 100:
            blocking_reasons.append(
                "Possible data leakage detected."
            )

        if drift_stability < 70:
            blocking_reasons.append(
                "Feature-drift stability is below 70%."
            )

        if class_balance < 40:
            blocking_reasons.append(
                "Class balance is critically low."
            )

        if health_score < 70:
            blocking_reasons.append(
                "Overall health score is below 70."
            )

        if blocking_reasons:
            decision = "BLOCKED"
            risk_level = "HIGH"
        elif health_score >= 90:
            decision = "APPROVED"
            risk_level = "LOW"
        else:
            decision = "CONDITIONAL_APPROVAL"
            risk_level = "MEDIUM"

        return {
            "agent": "Deployment Guardian Agent",
            "decision": decision,
            "risk_level": risk_level,
            "health_score": health_score,
            "blocking_reasons": blocking_reasons,
        }