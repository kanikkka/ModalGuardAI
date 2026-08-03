from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sklearn.metrics import accuracy_score

router = APIRouter(
    prefix="/crash-test",
    tags=["Crash Tests"],
)

BASE_DIR = Path(__file__).resolve().parents[2]
UPLOAD_DIR = BASE_DIR / "uploads"
MODEL_DIR = BASE_DIR / "trained_models"


class NoiseTestRequest(BaseModel):
    model_file_name: str
    noise_level: float = 0.05


@router.post("/noise")
def run_noise_test(request: NoiseTestRequest) -> dict:
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
            detail="Unable to read original dataset.",
        ) from error

    dataframe = dataframe.dropna(subset=[target_column])

    X = dataframe.drop(columns=[target_column])
    y = dataframe[target_column]

    numerical_columns = X.select_dtypes(
        include=["number"]
    ).columns.tolist()

    if not numerical_columns:
        raise HTTPException(
            status_code=400,
            detail="Dataset does not contain numerical features.",
        )

    original_predictions = model_pipeline.predict(X)

    noisy_data = X.copy()

    random_generator = np.random.default_rng(seed=42)

    for column in numerical_columns:
        column_standard_deviation = noisy_data[column].std()

        if pd.isna(column_standard_deviation) or column_standard_deviation == 0:
            continue

        noise = random_generator.normal(
            loc=0,
            scale=column_standard_deviation * request.noise_level,
            size=len(noisy_data),
        )

        noisy_data[column] = noisy_data[column] + noise

    noisy_predictions = model_pipeline.predict(noisy_data)

    original_accuracy = accuracy_score(
        y,
        original_predictions,
    )

    noisy_accuracy = accuracy_score(
        y,
        noisy_predictions,
    )

    changed_predictions = int(
        np.sum(original_predictions != noisy_predictions)
    )

    total_predictions = len(original_predictions)

    prediction_stability = (
        1 - changed_predictions / total_predictions
    ) * 100

    accuracy_drop = (
        original_accuracy - noisy_accuracy
    ) * 100

    if prediction_stability >= 90:
        status = "Excellent"
    elif prediction_stability >= 75:
        status = "Good"
    elif prediction_stability >= 50:
        status = "Risky"
    else:
        status = "Unsafe"

    return {
        "message": "Noise crash test completed successfully.",
        "noise_test": {
            "model_file_name": request.model_file_name,
            "noise_level": request.noise_level,
            "numerical_features_tested": numerical_columns,
            "total_predictions": total_predictions,
            "changed_predictions": changed_predictions,
            "prediction_stability": round(
                float(prediction_stability),
                2,
            ),
            "original_accuracy": round(
                float(original_accuracy),
                4,
            ),
            "noisy_accuracy": round(
                float(noisy_accuracy),
                4,
            ),
            "accuracy_drop_percentage": round(
                float(accuracy_drop),
                2,
            ),
            "status": status,
        },
    }