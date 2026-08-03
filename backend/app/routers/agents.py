from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.agents.orchestrator import (
    run_multi_agent_investigation,
)

router = APIRouter(
    prefix="/agents",
    tags=["Multi-Agent AI"],
)


class MultiAgentRequest(BaseModel):
    accuracy: float

    noise_stability: float = 100
    missing_stability: float = 100
    outlier_stability: float = 100
    drift_stability: float = 100

    label_noise: float = 100
    class_balance: float = 100
    duplicate_score: float = 100
    leakage_score: float = 100

    extra_metrics: dict[str, Any] = Field(
        default_factory=dict
    )


@router.post("/investigate")
def investigate_model(
    request: MultiAgentRequest,
) -> dict[str, Any]:
    metrics = request.model_dump()

    extra_metrics = metrics.pop(
        "extra_metrics",
        {}
    )

    metrics.update(extra_metrics)

    investigation = run_multi_agent_investigation(
        metrics
    )

    return {
        "message": (
            "Multi-agent model investigation completed successfully."
        ),
        "investigation": investigation,
    }