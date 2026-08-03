from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel

from app.knowledge_graph.graph_builder import (
    build_reliability_graph,
)
from app.knowledge_graph.graph_queries import (
    export_graph_as_json,
    find_paths_to_model,
)
from app.knowledge_graph.root_cause import (
    find_root_causes,
    generate_root_cause_summary,
)

router = APIRouter(
    prefix="/knowledge-graph",
    tags=["Knowledge Graph"],
)


class KnowledgeGraphRequest(BaseModel):
    health_score: float = 100
    noise_stability: float = 100
    missing_stability: float = 100
    outlier_stability: float = 100
    drift_stability: float = 100
    class_balance: float = 100
    duplicate_score: float = 100
    leakage_score: float = 100


@router.post("/build")
def build_knowledge_graph(
    request: KnowledgeGraphRequest,
) -> dict[str, Any]:
    metrics = request.model_dump()

    graph = build_reliability_graph(metrics)

    root_causes = find_root_causes(graph)

    return {
        "message": "Knowledge graph generated successfully.",
        "summary": generate_root_cause_summary(
            root_causes
        ),
        "root_causes": root_causes,
        "failure_paths": find_paths_to_model(graph),
        "graph": export_graph_as_json(graph),
    }