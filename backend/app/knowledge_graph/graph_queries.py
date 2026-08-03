from typing import Any

import networkx as nx


def export_graph_as_json(
    graph: nx.DiGraph,
) -> dict[str, Any]:
    nodes = []

    for node_id, attributes in graph.nodes(data=True):
        nodes.append(
            {
                "id": node_id,
                "label": attributes.get("label", node_id),
                "type": attributes.get(
                    "node_type",
                    "unknown",
                ),
            }
        )

    edges = []

    for source, target, attributes in graph.edges(data=True):
        edges.append(
            {
                "source": source,
                "target": target,
                "relation": attributes.get(
                    "relation",
                    "related_to",
                ),
            }
        )

    return {
        "nodes": nodes,
        "edges": edges,
    }


def find_paths_to_model(
    graph: nx.DiGraph,
) -> list[list[str]]:
    paths: list[list[str]] = []

    issue_nodes = [
        node
        for node, attributes in graph.nodes(data=True)
        if attributes.get("node_type") == "issue"
    ]

    for issue in issue_nodes:
        try:
            issue_paths = nx.all_simple_paths(
                graph,
                source=issue,
                target="model",
            )

            paths.extend(list(issue_paths))

        except nx.NetworkXNoPath:
            continue

    return paths