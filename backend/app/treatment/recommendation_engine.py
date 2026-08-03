from typing import Any

from app.treatment.rules import build_treatment_rules


PRIORITY_ORDER = {
    "CRITICAL": 1,
    "HIGH": 2,
    "MEDIUM": 3,
    "LOW": 4,
}


def generate_recommendations(
    metrics: dict[str, Any],
) -> list[dict[str, Any]]:
    recommendations = build_treatment_rules(metrics)

    recommendations.sort(
        key=lambda item: PRIORITY_ORDER.get(
            item.get("priority", "LOW"),
            99,
        )
    )

    if not recommendations:
        recommendations.append(
            {
                "issue": "No Major Reliability Issue",
                "priority": "LOW",
                "recommended_action": (
                    "Continue monitoring model performance and feature drift."
                ),
                "expected_benefit": (
                    "Maintains reliability after deployment."
                ),
            }
        )

    return recommendations