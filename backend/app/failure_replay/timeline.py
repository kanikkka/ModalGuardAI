from typing import Any


def build_event_timeline(
    events: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    sorted_events = sorted(
        events,
        key=lambda event: event.get("created_at", ""),
    )

    timeline = []

    for position, event in enumerate(sorted_events, start=1):
        timeline.append(
            {
                "step": position,
                "event_id": event.get("event_id"),
                "event_type": event.get("event_type"),
                "status": event.get("status"),
                "model_file_name": event.get("model_file_name"),
                "dataset_file_name": event.get("dataset_file_name"),
                "details": event.get("details", {}),
                "created_at": event.get("created_at"),
            }
        )

    return timeline