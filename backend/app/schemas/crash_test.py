from pydantic import BaseModel


class CrashTestRequest(BaseModel):
    model_path: str
    dataset_path: str
    target_column: str


class CrashTestResponse(BaseModel):
    robustness_score: float
    grade: str
    deployment_ready: bool

    noise_test: dict
    missing_value_test: dict
    outlier_test: dict
    feature_drift_test: dict

    label_noise_test: dict
    class_imbalance_test: dict
    duplicate_detection: dict
    data_leakage_test: dict