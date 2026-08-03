from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.blackbox.recorder import (
    get_all_events,
    get_event_by_id,
    record_event,
)

router = APIRouter(
    prefix="/blackbox",
    tags=["AI Black Box"],
)


class BlackBoxEventRequest(BaseModel):
    event_type: str
    status: str
    model_file_name: str | None = None
    dataset_file_name: str | None = None
    details: dict[str, Any] = {}


@router.post("/record")
def create_blackbox_event(
    request: BlackBoxEventRequest,
) -> dict[str, Any]:

    event = record_event(
        event_type=request.event_type,
        status=request.status,
        model_file_name=request.model_file_name,
        dataset_file_name=request.dataset_file_name,
        details=request.details,
    )

    return {
        "message": "Black Box event recorded successfully.",
        "event": event,
    }


@router.get("/history")
def blackbox_history() -> dict[str, Any]:
    events = get_all_events()

    return {
        "total_events": len(events),
        "events": events,
    }


@router.get("/replay/{event_id}")
def replay_event(event_id: str) -> dict[str, Any]:
    event = get_event_by_id(event_id)

    if event is None:
        raise HTTPException(
            status_code=404,
            detail="Black Box event not found.",
        )

    return {
        "message": "Event replay loaded successfully.",
        "replay": event,
    }