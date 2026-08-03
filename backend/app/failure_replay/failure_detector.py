from typing import Any


FAILURE_KEYWORDS = {
    "FAIL",
    "FAILED",
    "ERROR",
    "BLOCKED",
    "REJECTED",
    "UNSAFE",
    "POOR",
}


def detect_failure(event: dict[str, Any]) -> dict[str, Any]:
    status = str(event.get("status", "")).upper()

    details = event.get("details", {}) or {}

    deployment_status = str(
        details.get("deployment_status", "")
    ).upper()

    test_status = str(
        details.get("test_status", "")
    ).upper()

    failure_detected = any(
        keyword in {status, deployment_status, test_status}
        for keyword in FAILURE_KEYWORDS
    )

    reasons = []

    if status in FAILURE_KEYWORDS:
        reasons.append(
            f"Event status is {status}."
        )

    if deployment_status in FAILURE_KEYWORDS:
        reasons.append(
            f"Deployment status is {deployment_status}."
        )

    if test_status in FAILURE_KEYWORDS:
        reasons.append(
            f"Crash-test status is {test_status}."
        )

    health_score = details.get("health_score")

    if health_score is not None and float(health_score) < 70:
        failure_detected = True
        reasons.append(
            f"Health score is low: {health_score}."
        )

    accuracy = details.get("accuracy")

    if accuracy is not None and float(accuracy) < 0.70:
        failure_detected = True
        reasons.append(
            f"Model accuracy is low: {accuracy}."
        )

    return {
        "failure_detected": failure_detected,
        "failure_reasons": reasons,
    }