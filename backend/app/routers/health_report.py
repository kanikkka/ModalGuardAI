from fastapi import APIRouter

from app.schemas.health_report import *

from app.health_report.report_generator import *

router = APIRouter(

    prefix="/health-report",

    tags=["Health Report"]

)


@router.post(

    "/generate",

    response_model=HealthReportResponse

)

def generate_report(

    request: HealthReportRequest

):

    metrics = {

        "accuracy": request.accuracy,

        "noise": request.noise,

        "missing": request.missing,

        "outlier": request.outlier,

        "drift": request.drift,

        "label_noise": request.label_noise,

        "imbalance": request.imbalance,

        "duplicate": request.duplicate,

        "leakage": request.leakage

    }

    report = generate_health_report(

        metrics

    )

    return report