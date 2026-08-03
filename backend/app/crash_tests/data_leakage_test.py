from typing import Any

import numpy as np
import pandas as pd


class DataLeakageTester:
    def run(
        self,
        dataframe: pd.DataFrame,
        target_column: str,
        correlation_threshold: float = 0.95,
    ) -> dict[str, Any]:

        if dataframe.empty:
            raise ValueError("Dataset is empty.")

        if target_column not in dataframe.columns:
            raise ValueError(
                f"Target column '{target_column}' dataset me nahi mila. "
                f"Available columns: {dataframe.columns.tolist()}"
            )

        working_data = dataframe.copy()

        target_series = working_data[target_column]

        # Target categorical/string ho to numeric codes me convert karo.
        if not pd.api.types.is_numeric_dtype(target_series):
            encoded_target, _ = pd.factorize(
                target_series.astype(str)
            )

            working_data["__encoded_target__"] = encoded_target
            correlation_target = "__encoded_target__"
        else:
            correlation_target = target_column

        feature_columns = [
            column
            for column in working_data.columns
            if column not in {
                target_column,
                "__encoded_target__",
            }
        ]

        suspicious_features: dict[str, float] = {}

        for column in feature_columns:
            feature_series = working_data[column]

            # Categorical feature ko encode karo.
            if not pd.api.types.is_numeric_dtype(feature_series):
                encoded_feature, _ = pd.factorize(
                    feature_series.astype(str)
                )

                feature_series = pd.Series(
                    encoded_feature,
                    index=working_data.index,
                )

            feature_series = pd.to_numeric(
                feature_series,
                errors="coerce",
            )

            numeric_target = pd.to_numeric(
                working_data[correlation_target],
                errors="coerce",
            )

            valid_mask = (
                feature_series.notna()
                & numeric_target.notna()
            )

            if valid_mask.sum() < 2:
                continue

            feature_values = feature_series[valid_mask]
            target_values = numeric_target[valid_mask]

            # Constant columns ka correlation meaningful nahi hota.
            if (
                feature_values.nunique() <= 1
                or target_values.nunique() <= 1
            ):
                continue

            correlation = feature_values.corr(
                target_values
            )

            if pd.isna(correlation):
                continue

            absolute_correlation = abs(
                float(correlation)
            )

            if absolute_correlation >= correlation_threshold:
                suspicious_features[column] = round(
                    absolute_correlation,
                    4,
                )

        leakage_detected = bool(suspicious_features)

        return {
            "test_name": "Data Leakage Test",
            "target_column": target_column,
            "correlation_threshold": correlation_threshold,
            "leakage_detected": leakage_detected,
            "leaked_features": suspicious_features,
            "suspicious_feature_count": len(
                suspicious_features
            ),
            "status": (
                "FAIL"
                if leakage_detected
                else "PASS"
            ),
        }


def run_data_leakage_test(
    dataframe: pd.DataFrame,
    target_column: str,
    correlation_threshold: float = 0.95,
) -> dict[str, Any]:

    tester = DataLeakageTester()

    return tester.run(
        dataframe=dataframe,
        target_column=target_column,
        correlation_threshold=correlation_threshold,
    )