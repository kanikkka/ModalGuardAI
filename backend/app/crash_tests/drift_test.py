import pandas as pd
import numpy as np


class DriftTester:

    def calculate_drift(self, train_df, test_df):

        numeric_cols = train_df.select_dtypes(
            include=["int64", "float64"]
        ).columns

        drift = {}

        scores = []

        for col in numeric_cols:

            train_mean = train_df[col].mean()
            test_mean = test_df[col].mean()

            train_std = train_df[col].std()

            if train_std == 0:
                score = 100

            else:
                difference = abs(train_mean - test_mean)

                score = max(
                    0,
                    100 - (difference / train_std) * 100
                )

            score = round(score, 2)

            drift[col] = score

            scores.append(score)

        overall = round(np.mean(scores), 2)

        return {

            "test_name": "Feature Drift Test",

            "overall_stability": overall,

            "feature_scores": drift,

            "status": "PASS" if overall >= 85 else "FAIL"

        }


def run_drift_test(train_df, test_df):

    tester = DriftTester()

    return tester.calculate_drift(train_df, test_df)