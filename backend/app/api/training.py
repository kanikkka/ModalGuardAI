from pathlib import Path
from uuid import uuid4

import joblib
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

router = APIRouter(
    prefix="/model",
    tags=["Model Training"],
)

BASE_DIR = Path(__file__).resolve().parents[2]
UPLOAD_DIR = BASE_DIR / "uploads"
MODEL_DIR = BASE_DIR / "trained_models"

MODEL_DIR.mkdir(parents=True, exist_ok=True)


class TrainingRequest(BaseModel):
    saved_file_name: str
    target_column: str


@router.post("/train")
def train_model(request: TrainingRequest) -> dict:
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
            detail="Unable to read dataset.",
        ) from error

    if request.target_column not in dataframe.columns:
        raise HTTPException(
            status_code=400,
            detail="Target column does not exist.",
        )

    dataframe = dataframe.dropna(subset=[request.target_column])

    if dataframe.empty:
        raise HTTPException(
            status_code=400,
            detail="No valid rows available for training.",
        )

    X = dataframe.drop(columns=[request.target_column])
    y = dataframe[request.target_column]

    if y.nunique() < 2:
        raise HTTPException(
            status_code=400,
            detail="Target column must contain at least two classes.",
        )

    numerical_columns = X.select_dtypes(include=["number"]).columns.tolist()
    categorical_columns = X.select_dtypes(exclude=["number"]).columns.tolist()

    numerical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
        ]
    )

    categorical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            (
                "encoder",
                OneHotEncoder(
                    handle_unknown="ignore",
                    sparse_output=False,
                ),
            ),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("numerical", numerical_pipeline, numerical_columns),
            ("categorical", categorical_pipeline, categorical_columns),
        ]
    )

    model_pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            (
                "classifier",
                RandomForestClassifier(
                    n_estimators=100,
                    random_state=42,
                ),
            ),
        ]
    )

    try:
        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=0.2,
            random_state=42,
            stratify=y,
        )
    except ValueError:
        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=0.2,
            random_state=42,
        )

    model_pipeline.fit(X_train, y_train)

    predictions = model_pipeline.predict(X_test)

    accuracy = accuracy_score(y_test, predictions)
    precision = precision_score(
        y_test,
        predictions,
        average="weighted",
        zero_division=0,
    )
    recall = recall_score(
        y_test,
        predictions,
        average="weighted",
        zero_division=0,
    )
    f1 = f1_score(
        y_test,
        predictions,
        average="weighted",
        zero_division=0,
    )

    model_file_name = f"{uuid4().hex}_random_forest.pkl"
    model_path = MODEL_DIR / model_file_name

    joblib.dump(
        {
            "pipeline": model_pipeline,
            "target_column": request.target_column,
            "feature_columns": X.columns.tolist(),
            "dataset_file_name": request.saved_file_name,
        },
        model_path,
    )

    return {
        "message": "Model trained successfully.",
        "model": {
            "model_file_name": model_file_name,
            "algorithm": "Random Forest Classifier",
            "target_column": request.target_column,
            "training_rows": int(len(X_train)),
            "testing_rows": int(len(X_test)),
            "numerical_features": numerical_columns,
            "categorical_features": categorical_columns,
            "metrics": {
                "accuracy": round(float(accuracy), 4),
                "precision": round(float(precision), 4),
                "recall": round(float(recall), 4),
                "f1_score": round(float(f1), 4),
            },
        },
    }