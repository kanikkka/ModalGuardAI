import numpy as np
import pandas as pd
import joblib
from app.crash_tests.model_loader import load_trained_model

class OutlierTester:

    def __init__(self, model_path):
     self.model = load_trained_model(model_path)

    def inject_outliers(self, X):

        X = X.copy()

        numeric_cols = X.select_dtypes(
            include=["int64", "float64"]
        ).columns

        for col in numeric_cols:

            std = X[col].std()

            X[col] = X[col].apply(

                lambda value:

                value + (5 * std)

                if np.random.rand() < 0.05

                else value

            )

        return X

    def run(self, X):

        original = self.model.predict(X)

        outlier_X = self.inject_outliers(X)

        new_prediction = self.model.predict(outlier_X)

        changed = int(np.sum(original != new_prediction))

        total = len(original)

        stability = round(

            (1 - changed / total) * 100,

            2

        )

        return {

            "test_name": "Outlier Test",

            "prediction_stability": stability,

            "changed_predictions": changed,

            "total_predictions": total,

            "status": "PASS" if stability > 90 else "FAIL"

        }


def run_outlier_test(model_path, dataframe):

    tester = OutlierTester(model_path)

    return tester.run(dataframe)