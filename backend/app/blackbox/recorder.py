import json
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from app.blackbox.database import get_connection


def record_event(
    event_type: str,
    status: str,
    model_file_name: str | None = None,
    dataset_file_name: str | None = None,
    details: dict[str, Any] | None = None,
) -> dict[str, Any]:

    event_id = uuid4().hex

    created_at = datetime.now(timezone.utc).isoformat()

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO blackbox_events (
            event_id,
            event_type,
            model_file_name,
            dataset_file_name,
            status,
            details,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            event_id,
            event_type,
            model_file_name,
            dataset_file_name,
            status,
            json.dumps(details or {}),
            created_at,
        ),
    )

    connection.commit()
    connection.close()

    return {
        "event_id": event_id,
        "event_type": event_type,
        "model_file_name": model_file_name,
        "dataset_file_name": dataset_file_name,
        "status": status,
        "details": details or {},
        "created_at": created_at,
    }


def get_all_events() -> list[dict[str, Any]]:
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT *
        FROM blackbox_events
        ORDER BY id DESC
        """
    )

    rows = cursor.fetchall()
    connection.close()

    events = []

    for row in rows:
        events.append(
            {
                "event_id": row["event_id"],
                "event_type": row["event_type"],
                "model_file_name": row["model_file_name"],
                "dataset_file_name": row["dataset_file_name"],
                "status": row["status"],
                "details": json.loads(row["details"] or "{}"),
                "created_at": row["created_at"],
            }
        )

    return events


def get_event_by_id(event_id: str) -> dict[str, Any] | None:
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT *
        FROM blackbox_events
        WHERE event_id = ?
        """,
        (event_id,),
    )

    row = cursor.fetchone()
    connection.close()

    if row is None:
        return None

    return {
        "event_id": row["event_id"],
        "event_type": row["event_type"],
        "model_file_name": row["model_file_name"],
        "dataset_file_name": row["dataset_file_name"],
        "status": row["status"],
        "details": json.loads(row["details"] or "{}"),
        "created_at": row["created_at"],
    }