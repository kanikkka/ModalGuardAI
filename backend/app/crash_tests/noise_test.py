"""
ModelGuard AI
Noise Robustness Test

Purpose:
- Evaluate model robustness by injecting Gaussian noise
- Compare original predictions vs noisy predictions
- Generate stability score
"""
from app.crash_tests.model_loader import load_trained_model
import joblib
import numpy as np
import pandas as pd


class NoiseTester:

    def __init__(self, model_path):
     self.model = load_trained_model(model_path)
    def add_noise(self, X, noise_level=0.05):

        X = X.copy()

        numeric_columns = X.select_dtypes(
            include=["int64", "float64"]
        ).columns

        for column in numeric_columns:

            std = X[column].std()

            if std == 0:
                continue

            noise = np.random.normal(
                0,
                std * noise_level,
                size=len(X)
            )

            X[column] = X[column] + noise

        return X

    def run(self, X):

        original_prediction = self.model.predict(X)

        noisy_X = self.add_noise(X)

        noisy_prediction = self.model.predict(noisy_X)

        changed = int(
            np.sum(original_prediction != noisy_prediction)
        )

        total = len(original_prediction)

        stability = round(
            (1 - changed / total) * 100,
            2
        )

        if stability >= 95:
            status = "Excellent"

        elif stability >= 90:
            status = "Good"

        elif stability >= 80:
            status = "Moderate"

        else:
            status = "Poor"

        return {

            "test_name": "Noise Robustness Test",

            "prediction_stability": stability,

            "changed_predictions": changed,

            "total_predictions": total,

            "noise_level": 0.05,

            "status": status
        }


def run_noise_test(
    model_path,
    dataframe
):

    tester = NoiseTester(model_path)

    return tester.run(dataframe)