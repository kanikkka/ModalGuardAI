from pydantic import BaseModel
from typing import List


class HealthReportRequest(BaseModel):
    accuracy: float

    noise: float
    missing: float
    outlier: float
    drift: float

    label_noise: float
    imbalance: float
    duplicate: float
    leakage: float


class DeploymentResponse(BaseModel):
    deployment: str
    reason: str


class HealthReportResponse(BaseModel):

    health_score: float

    grade: str

    deployment: DeploymentResponse

    recommendations: List[str]