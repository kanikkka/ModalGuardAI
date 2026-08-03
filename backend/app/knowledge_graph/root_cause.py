from typing import Any

import networkx as nx


SEVERITY_ORDER = {
    "data_leakage": 1,
    "feature_drift": 2,
    "class_imbalance": 3,
    "noise_sensitivity": 4,
    "missing_value_instability": 5,
    "outlier_sensitivity": 6,
    "duplicate_records": 7,
}


def find_root_causes(
    graph: nx.DiGraph,
) -> list[dict[str, Any]]:
    root_causes: list[dict[str, Any]] = []

    issue_nodes = [
        node
        for node, attributes in graph.nodes(data=True)
        if attributes.get("node_type") == "issue"
    ]

    issue_nodes.sort(
        key=lambda issue: SEVERITY_ORDER.get(issue, 99)
    )

    for issue in issue_nodes:
        effects = [
            target
            for _, target, edge_data in graph.out_edges(
                issue,
                data=True,
            )
            if edge_data.get("relation") == "causes"
        ]

        treatments = [
            source
            for source, _, edge_data in graph.in_edges(
                issue,
                data=True,
            )
            if edge_data.get("relation") == "treats"
        ]

        root_causes.append(
            {
                "issue": issue,
                "issue_label": graph.nodes[issue].get(
                    "label",
                    issue,
                ),
                "effects": effects,
                "recommended_treatments": treatments,
                "severity_rank": SEVERITY_ORDER.get(
                    issue,
                    99,
                ),
            }
        )

    return root_causes


def generate_root_cause_summary(
    root_causes: list[dict[str, Any]],
) -> str:
    if not root_causes:
        return (
            "No major root cause was detected. "
            "The model appears stable under current tests."
        )

    primary = root_causes[0]

    issue = primary["issue_label"]

    effects = ", ".join(
        effect.replace("_", " ")
        for effect in primary["effects"]
    )

    return (
        f"Primary root cause: {issue}. "
        f"This issue may cause {effects}."
    )