from fastapi import APIRouter
import pandas as pd

from app.schemas.crash_test import *

from app.crash_tests.noise_test import *
from app.crash_tests.missing_value_test import *
from app.crash_tests.outlier_test import *
from app.crash_tests.drift_test import *

from app.crash_tests.label_noise_test import *
from app.crash_tests.class_imbalance_test import *
from app.crash_tests.duplicate_detection import *
from app.crash_tests.data_leakage_test import *

from app.crash_tests.robustness_score import *

router = APIRouter(
    prefix="/crash-test",
    tags=["Crash Test"]
)


@router.post(
    "/run",
    response_model=CrashTestResponse
)
def run_crash_tests(request: CrashTestRequest):

    df = pd.read_csv(request.dataset_path)

    X = df.drop(columns=[request.target_column])

    y = df[request.target_column]

    noise = run_noise_test(
        request.model_path,
        X
    )

    missing = run_missing_value_test(
        request.model_path,
        X
    )

    outlier = run_outlier_test(
        request.model_path,
        X
    )

    drift = run_drift_test(
        X,
        X.copy()
    )

    label_noise = run_label_noise_test(
        y
    )

    imbalance = run_class_imbalance_test(
        y
    )

    duplicate = run_duplicate_detection(
        df
    )

    leakage = run_data_leakage_test(
        df,
        request.target_column
    )

    score = generate_score(
        noise,
        missing,
        outlier,
        drift
    )

    return {

        **score,

        "noise_test": noise,

        "missing_value_test": missing,

        "outlier_test": outlier,

        "feature_drift_test": drift,

        "label_noise_test": label_noise,

        "class_imbalance_test": imbalance,

        "duplicate_detection": duplicate,

        "data_leakage_test": leakage

    }