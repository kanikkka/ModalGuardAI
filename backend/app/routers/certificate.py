from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from app.certificate.pdf_generator import (
    generate_reliability_certificate,
)
from app.model_dna.registry import (
    get_model_dna_by_id,
)


router = APIRouter(
    prefix="/certificate",
    tags=["Reliability Certificate"],
)


class CertificateRequest(BaseModel):
    model_id: str
    health_score: float
    grade: str
    deployment_status: str
    crash_test_results: dict[str, Any] = Field(
        default_factory=dict
    )


@router.post("/generate")
def create_certificate(
    request: CertificateRequest,
) -> dict[str, Any]:
    model_dna = get_model_dna_by_id(
        request.model_id
    )

    if model_dna is None:
        raise HTTPException(
            status_code=404,
            detail="Model DNA not found.",
        )

    certificate = generate_reliability_certificate(
        model_dna=model_dna,
        health_score=request.health_score,
        grade=request.grade,
        deployment_status=request.deployment_status,
        crash_test_results=request.crash_test_results,
    )

    return {
        "message": (
            "Reliability certificate generated successfully."
        ),
        "certificate": certificate,
    }


@router.get("/download/{file_name}")
def download_certificate(
    file_name: str,
) -> FileResponse:
    base_dir = Path(__file__).resolve().parents[2]
    file_path = base_dir / "reports" / file_name

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Certificate file not found.",
        )

    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=file_name,
    )