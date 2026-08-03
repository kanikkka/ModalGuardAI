from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.llm_report.generator import (
    generate_llm_report,
)

router = APIRouter(
    prefix="/llm-report",
    tags=["LLM Report Generator"],
)


class LLMReportRequest(BaseModel):
    health_score: float
    grade: str
    deployment_status: str

    accuracy: float = 0
    noise_stability: float = 0
    missing_stability: float = 0
    outlier_stability: float = 0
    drift_stability: float = 0

    recommendations: list[str] = Field(
        default_factory=list
    )

    extra_metrics: dict[str, Any] = Field(
        default_factory=dict
    )


@router.post("/generate")
async def create_llm_report(
    request: LLMReportRequest,
) -> dict[str, Any]:
    request_data = request.model_dump()

    recommendations = request_data.pop(
        "recommendations"
    )

    extra_metrics = request_data.pop(
        "extra_metrics"
    )

    request_data.update(extra_metrics)

    result = await generate_llm_report(
        metrics=request_data,
        recommendations=recommendations,
    )

    return {
        "message": "Reliability report generated successfully.",
        "result": result,
    }