from pathlib import Path

import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(
    prefix="/dataset",
    tags=["Dataset Validation"],
)

BASE_DIR = Path(__file__).resolve().parents[2]
UPLOAD_DIR = BASE_DIR / "uploads"


class TargetValidationRequest(BaseModel):
    saved_file_name: str
    target_column: str


@router.post("/validate-target")
def validate_target_column(request: TargetValidationRequest) -> dict:
    file_path = UPLOAD_DIR / request.saved_file_name

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Dataset file not found.",
        )

    try:
        dataframe = pd.read_csv(file_path)
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Unable to read the dataset.",
        ) from error

    if request.target_column not in dataframe.columns:
        raise HTTPException(
            status_code=400,
            detail=f"Target column '{request.target_column}' does not exist.",
        )

    target_series = dataframe[request.target_column]

    missing_target_values = int(target_series.isnull().sum())
    unique_classes = target_series.dropna().unique().tolist()
    class_count = int(target_series.nunique(dropna=True))

    if class_count < 2:
        raise HTTPException(
            status_code=400,
            detail="Target column must contain at least two classes.",
        )

    if class_count > 20:
        raise HTTPException(
            status_code=400,
            detail=(
                "Target column has too many unique values. "
                "This dataset may be suitable for regression, not classification."
            ),
        )

    class_distribution = {
        str(class_name): int(count)
        for class_name, count in target_series.value_counts(dropna=False).items()
    }

    feature_columns = [
        column
        for column in dataframe.columns
        if column != request.target_column
    ]

    numerical_features = dataframe[feature_columns].select_dtypes(
        include=["number"]
    ).columns.tolist()

    categorical_features = dataframe[feature_columns].select_dtypes(
        exclude=["number"]
    ).columns.tolist()

    warnings = []

    if missing_target_values > 0:
        warnings.append(
            f"Target column contains {missing_target_values} missing values."
        )

    minimum_class_size = int(
        target_series.value_counts(dropna=True).min()
    )

    if minimum_class_size < 5:
        warnings.append(
            "One or more target classes contain fewer than 5 records."
        )

    majority_class_ratio = float(
        target_series.value_counts(normalize=True, dropna=True).max()
    )

    if majority_class_ratio > 0.80:
        warnings.append(
            "Target column appears imbalanced."
        )

    return {
        "message": "Target column validated successfully.",
        "validation": {
            "saved_file_name": request.saved_file_name,
            "target_column": request.target_column,
            "problem_type": "classification",
            "rows": int(dataframe.shape[0]),
            "feature_count": len(feature_columns),
            "feature_columns": feature_columns,
            "numerical_features": numerical_features,
            "categorical_features": categorical_features,
            "class_count": class_count,
            "classes": [str(value) for value in unique_classes],
            "class_distribution": class_distribution,
            "missing_target_values": missing_target_values,
            "warnings": warnings,
            "is_valid": True,
        },
    }