from typing import Any

from app.blackbox.recorder import (
    get_all_events,
    get_event_by_id,
)
from app.failure_replay.failure_detector import (
    detect_failure,
)
from app.failure_replay.timeline import (
    build_event_timeline,
)


def replay_single_event(
    event_id: str,
) -> dict[str, Any] | None:

    event = get_event_by_id(event_id)

    if event is None:
        return None

    failure_analysis = detect_failure(event)

    return {
        "event": event,
        "failure_analysis": failure_analysis,
        "root_cause_summary": generate_root_cause_summary(
            event,
            failure_analysis,
        ),
    }


def replay_model_history(
    model_file_name: str,
) -> dict[str, Any]:

    all_events = get_all_events()

    model_events = [
        event
        for event in all_events
        if event.get("model_file_name")
        == model_file_name
    ]

    timeline = build_event_timeline(model_events)

    failures = []

    for event in model_events:
        analysis = detect_failure(event)

        if analysis["failure_detected"]:
            failures.append(
                {
                    "event_id": event.get("event_id"),
                    "event_type": event.get(
                        "event_type"
                    ),
                    "created_at": event.get(
                        "created_at"
                    ),
                    "failure_reasons": analysis[
                        "failure_reasons"
                    ],
                }
            )

    return {
        "model_file_name": model_file_name,
        "total_events": len(model_events),
        "failure_count": len(failures),
        "timeline": timeline,
        "failures": failures,
    }


def generate_root_cause_summary(
    event: dict[str, Any],
    failure_analysis: dict[str, Any],
) -> str:

    if not failure_analysis["failure_detected"]:
        return (
            "No critical failure was detected in this event."
        )

    details = event.get("details", {}) or {}

    if details.get("leakage_detected"):
        return (
            "Possible root cause: data leakage was detected "
            "during model evaluation."
        )

    if details.get("drift_score") is not None:
        if float(details["drift_score"]) < 80:
            return (
                "Possible root cause: significant feature drift "
                "reduced model reliability."
            )

    if details.get("noise_stability") is not None:
        if float(details["noise_stability"]) < 80:
            return (
                "Possible root cause: the model is highly "
                "sensitive to noisy input values."
            )

    if details.get("missing_stability") is not None:
        if float(details["missing_stability"]) < 80:
            return (
                "Possible root cause: the model is unstable "
                "when feature values are missing."
            )

    if details.get("health_score") is not None:
        if float(details["health_score"]) < 70:
            return (
                "Possible root cause: overall model-health score "
                "fell below the safety threshold."
            )

    return (
        "Failure detected, but the current event does not "
        "contain enough evidence for an exact root cause."
    )