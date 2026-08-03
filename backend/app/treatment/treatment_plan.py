from typing import Any

from app.treatment.recommendation_engine import (
    generate_recommendations,
)


def generate_treatment_plan(
    metrics: dict[str, Any],
) -> dict[str, Any]:
    recommendations = generate_recommendations(metrics)

    critical_count = sum(
        1
        for item in recommendations
        if item.get("priority") == "CRITICAL"
    )

    high_count = sum(
        1
        for item in recommendations
        if item.get("priority") == "HIGH"
    )

    if critical_count > 0:
        treatment_status = "IMMEDIATE ACTION REQUIRED"
        deployment_advice = "BLOCK DEPLOYMENT"
    elif high_count > 0:
        treatment_status = "IMPROVEMENT REQUIRED"
        deployment_advice = "RETEST BEFORE DEPLOYMENT"
    else:
        treatment_status = "MODEL STABLE"
        deployment_advice = "DEPLOY WITH MONITORING"

    return {
        "treatment_status": treatment_status,
        "deployment_advice": deployment_advice,
        "total_recommendations": len(recommendations),
        "critical_issues": critical_count,
        "high_priority_issues": high_count,
        "treatments": recommendations,
    }