from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sklearn.metrics import accuracy_score

router = APIRouter(
    prefix="/health-report",
    tags=["Health Report"],
)

BASE_DIR = Path(__file__).resolve().parents[2]
UPLOAD_DIR = BASE_DIR / "uploads"
MODEL_DIR = BASE_DIR / "trained_models"


class HealthReportRequest(BaseModel):
    model_file_name: str
    noise_level: float = 0.05
    missing_percentage: float = 0.10


@router.post("/generate")
def generate_health_report(request: HealthReportRequest) -> dict:

    model_path = MODEL_DIR / request.model_file_name

    if not model_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Trained model file not found.",
        )

    if request.noise_level <= 0 or request.noise_level > 0.50:
        raise HTTPException(
            status_code=400,
            detail="Noise level must be between 0 and 0.50.",
        )

    if (
        request.missing_percentage <= 0
        or request.missing_percentage > 0.50
    ):
        raise HTTPException(
            status_code=400,
            detail="Missing percentage must be between 0 and 0.50.",
        )

    try:
        saved_model = joblib.load(model_path)
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Unable to load trained model.",
        ) from error

    model_pipeline = saved_model["pipeline"]
    target_column = saved_model["target_column"]
    dataset_file_name = saved_model["dataset_file_name"]

    dataset_path = UPLOAD_DIR / dataset_file_name

    if not dataset_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Original dataset file not found.",
        )

    try:
        dataframe = pd.read_csv(dataset_path)
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Unable to read dataset.",
        ) from error

    dataframe = dataframe.dropna(subset=[target_column])

    if dataframe.empty:
        raise HTTPException(
            status_code=400,
            detail="No valid rows available.",
        )

    X = dataframe.drop(columns=[target_column])
    y = dataframe[target_column]

    original_predictions = model_pipeline.predict(X)

    original_accuracy = accuracy_score(
        y,
        original_predictions,
    )

    # -----------------------------
    # Noise Crash Test
    # -----------------------------

    numerical_columns = X.select_dtypes(
        include=["number"]
    ).columns.tolist()

    noisy_data = X.copy()

    random_generator = np.random.default_rng(seed=42)

    for column in numerical_columns:
        standard_deviation = noisy_data[column].std()

        if pd.isna(standard_deviation) or standard_deviation == 0:
            continue

        noise = random_generator.normal(
            loc=0,
            scale=standard_deviation * request.noise_level,
            size=len(noisy_data),
        )

        noisy_data[column] = noisy_data[column] + noise

    noisy_predictions = model_pipeline.predict(noisy_data)

    noise_changed_predictions = int(
        np.sum(original_predictions != noisy_predictions)
    )

    total_predictions = len(original_predictions)

    noise_stability = (
        1 - noise_changed_predictions / total_predictions
    ) * 100

    noisy_accuracy = accuracy_score(
        y,
        noisy_predictions,
    )

    noise_accuracy_drop = max(
        0,
        (original_accuracy - noisy_accuracy) * 100,
    )

    # -----------------------------
    # Missing Value Crash Test
    # -----------------------------

    missing_data = X.copy()

    total_cells = (
        missing_data.shape[0]
        * missing_data.shape[1]
    )

    cells_to_remove = int(
        total_cells * request.missing_percentage
    )

    row_indexes = random_generator.integers(
        0,
        missing_data.shape[0],
        size=cells_to_remove,
    )

    column_indexes = random_generator.integers(
        0,
        missing_data.shape[1],
        size=cells_to_remove,
    )

    for row_index, column_index in zip(
        row_indexes,
        column_indexes,
    ):
        missing_data.iat[
            row_index,
            column_index,
        ] = np.nan

    try:
        missing_predictions = model_pipeline.predict(
            missing_data
        )
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Model failed during missing value test.",
        ) from error

    missing_changed_predictions = int(
        np.sum(
            original_predictions
            != missing_predictions
        )
    )

    missing_stability = (
        1
        - missing_changed_predictions
        / total_predictions
    ) * 100

    missing_accuracy = accuracy_score(
        y,
        missing_predictions,
    )

    missing_accuracy_drop = max(
        0,
        (original_accuracy - missing_accuracy) * 100,
    )

    # -----------------------------
    # Final Health Score
    # -----------------------------

    accuracy_score_value = original_accuracy * 100

    overall_health_score = (
        accuracy_score_value * 0.40
        + noise_stability * 0.30
        + missing_stability * 0.30
    )

    overall_health_score = round(
        float(overall_health_score),
        2,
    )

    if overall_health_score >= 90:
        grade = "A"
        deployment_status = "Ready for Deployment"
    elif overall_health_score >= 75:
        grade = "B"
        deployment_status = "Deployment with Monitoring"
    elif overall_health_score >= 60:
        grade = "C"
        deployment_status = "Needs Improvement"
    else:
        grade = "D"
        deployment_status = "Deployment Blocked"

    recommendations = []

    if original_accuracy < 0.75:
        recommendations.append(
            "Improve model accuracy using feature engineering or tuning."
        )

    if noise_stability < 80:
        recommendations.append(
            "Model predictions are sensitive to numerical noise."
        )

    if missing_stability < 80:
        recommendations.append(
            "Improve missing value handling and preprocessing."
        )

    if not recommendations:
        recommendations.append(
            "Model is stable under current crash test conditions."
        )

    return {
        "message": "Model health report generated successfully.",
        "health_report": {
            "model_file_name": request.model_file_name,
            "overall_health_score": overall_health_score,
            "grade": grade,
            "deployment_status": deployment_status,
            "original_accuracy": round(
                float(original_accuracy),
                4,
            ),
            "tests": {
                "noise_test": {
                    "noise_level": request.noise_level,
                    "stability": round(
                        float(noise_stability),
                        2,
                    ),
                    "accuracy_drop_percentage": round(
                        float(noise_accuracy_drop),
                        2,
                    ),
                    "changed_predictions": noise_changed_predictions,
                },
                "missing_value_test": {
                    "missing_percentage": request.missing_percentage,
                    "stability": round(
                        float(missing_stability),
                        2,
                    ),
                    "accuracy_drop_percentage": round(
                        float(missing_accuracy_drop),
                        2,
                    ),
                    "changed_predictions": missing_changed_predictions,
                },
            },
            "recommendations": recommendations,
        },
    }