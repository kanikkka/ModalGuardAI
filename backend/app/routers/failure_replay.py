from fastapi import APIRouter, HTTPException

from app.failure_replay.replay_engine import (
    replay_model_history,
    replay_single_event,
)

router = APIRouter(
    prefix="/failure-replay",
    tags=["Failure Replay"],
)


@router.get("/event/{event_id}")
def replay_event(event_id: str) -> dict:
    replay = replay_single_event(event_id)

    if replay is None:
        raise HTTPException(
            status_code=404,
            detail="Event not found.",
        )

    return {
        "message": "Failure replay generated successfully.",
        "replay": replay,
    }


@router.get("/model/{model_file_name}")
def replay_model(
    model_file_name: str,
) -> dict:

    replay = replay_model_history(
        model_file_name
    )

    return {
        "message": "Model timeline generated successfully.",
        "replay": replay,
    }