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


class MissingValueTestRequest(BaseModel):
    model_file_name: str
    missing_percentage: float = 0.10


@router.post("/missing-values")
def run_missing_value_test(
    request: MissingValueTestRequest,
) -> dict:

    model_path = MODEL_DIR / request.model_file_name

    if not model_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Trained model file not found.",
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

    dataframe = dataframe.dropna(
        subset=[target_column]
    )

    X = dataframe.drop(
        columns=[target_column]
    )

    y = dataframe[target_column]

    if X.empty:
        raise HTTPException(
            status_code=400,
            detail="No feature columns available.",
        )

    original_predictions = model_pipeline.predict(X)

    missing_data = X.copy()

    random_generator = np.random.default_rng(
        seed=42
    )

    total_cells = (
        missing_data.shape[0]
        * missing_data.shape[1]
    )

    cells_to_remove = int(
        total_cells
        * request.missing_percentage
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
            detail=(
                "Model failed when missing values "
                "were introduced."
            ),
        ) from error

    original_accuracy = accuracy_score(
        y,
        original_predictions,
    )

    missing_accuracy = accuracy_score(
        y,
        missing_predictions,
    )

    changed_predictions = int(
        np.sum(
            original_predictions
            != missing_predictions
        )
    )

    total_predictions = len(
        original_predictions
    )

    prediction_stability = (
        1
        - changed_predictions
        / total_predictions
    ) * 100

    accuracy_drop = (
        original_accuracy
        - missing_accuracy
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
        "message": (
            "Missing value crash test "
            "completed successfully."
        ),
        "missing_value_test": {
            "model_file_name": (
                request.model_file_name
            ),
            "missing_percentage": (
                request.missing_percentage
            ),
            "total_cells": total_cells,
            "cells_changed_to_missing": (
                cells_to_remove
            ),
            "total_predictions": (
                total_predictions
            ),
            "changed_predictions": (
                changed_predictions
            ),
            "prediction_stability": round(
                float(prediction_stability),
                2,
            ),
            "original_accuracy": round(
                float(original_accuracy),
                4,
            ),
            "missing_value_accuracy": round(
                float(missing_accuracy),
                4,
            ),
            "accuracy_drop_percentage": round(
                float(accuracy_drop),
                2,
            ),
            "status": status,
        },
    }