from typing import Any

import networkx as nx


ISSUE_RELATIONS = {
    "noise_sensitivity": {
        "effect": "prediction_instability",
        "risk": "unreliable_predictions",
        "treatment": "robust_scaling_and_regularization",
    },
    "missing_value_instability": {
        "effect": "accuracy_drop",
        "risk": "incomplete_data_failure",
        "treatment": "imputation_strategy_comparison",
    },
    "outlier_sensitivity": {
        "effect": "decision_boundary_distortion",
        "risk": "extreme_input_failure",
        "treatment": "outlier_clipping_or_robust_scaling",
    },
    "feature_drift": {
        "effect": "production_performance_drop",
        "risk": "model_obsolescence",
        "treatment": "retraining_and_drift_monitoring",
    },
    "class_imbalance": {
        "effect": "low_minority_recall",
        "risk": "high_false_negatives",
        "treatment": "class_weights_or_stratified_sampling",
    },
    "data_leakage": {
        "effect": "inflated_validation_score",
        "risk": "unsafe_deployment",
        "treatment": "remove_leaking_features_and_retrain",
    },
    "duplicate_records": {
        "effect": "model_memorization",
        "risk": "unrealistic_validation",
        "treatment": "deduplicate_and_group_split",
    },
}


def build_reliability_graph(
    metrics: dict[str, Any],
) -> nx.DiGraph:
    graph = nx.DiGraph()

    graph.add_node(
        "model",
        node_type="model",
        label="Machine Learning Model",
    )

    detected_issues: list[str] = []

    if float(metrics.get("noise_stability", 100)) < 80:
        detected_issues.append("noise_sensitivity")

    if float(metrics.get("missing_stability", 100)) < 80:
        detected_issues.append("missing_value_instability")

    if float(metrics.get("outlier_stability", 100)) < 80:
        detected_issues.append("outlier_sensitivity")

    if float(metrics.get("drift_stability", 100)) < 80:
        detected_issues.append("feature_drift")

    if float(metrics.get("class_balance", 100)) < 60:
        detected_issues.append("class_imbalance")

    if float(metrics.get("leakage_score", 100)) < 100:
        detected_issues.append("data_leakage")

    if float(metrics.get("duplicate_score", 100)) < 95:
        detected_issues.append("duplicate_records")

    for issue in detected_issues:
        relation = ISSUE_RELATIONS[issue]

        effect = relation["effect"]
        risk = relation["risk"]
        treatment = relation["treatment"]

        graph.add_node(
            issue,
            node_type="issue",
            label=issue.replace("_", " ").title(),
        )

        graph.add_node(
            effect,
            node_type="effect",
            label=effect.replace("_", " ").title(),
        )

        graph.add_node(
            risk,
            node_type="risk",
            label=risk.replace("_", " ").title(),
        )

        graph.add_node(
            treatment,
            node_type="treatment",
            label=treatment.replace("_", " ").title(),
        )

        graph.add_edge(
            issue,
            effect,
            relation="causes",
        )

        graph.add_edge(
            effect,
            risk,
            relation="creates",
        )

        graph.add_edge(
            risk,
            "model",
            relation="affects",
        )

        graph.add_edge(
            treatment,
            issue,
            relation="treats",
        )

    return graph