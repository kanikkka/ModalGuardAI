import numpy as np
import pandas as pd

from app.crash_tests.model_loader import load_trained_model


class MissingValueTester:
    def __init__(self, model_path):
        self.model = load_trained_model(model_path)

    def inject_missing_values(
        self,
        dataframe: pd.DataFrame,
        missing_rate: float = 0.10,
    ) -> pd.DataFrame:
        modified_data = dataframe.copy()

        if modified_data.empty:
            raise ValueError("Input dataframe is empty.")

        if not 0 < missing_rate < 1:
            raise ValueError(
                "missing_rate must be between 0 and 1."
            )

        numeric_columns = modified_data.select_dtypes(
            include=["number"]
        ).columns.tolist()

        categorical_columns = modified_data.select_dtypes(
            exclude=["number"]
        ).columns.tolist()

        random_generator = np.random.default_rng(seed=42)

        total_cells = (
            len(modified_data)
            * len(modified_data.columns)
        )

        missing_count = max(
            1,
            int(total_cells * missing_rate),
        )

        for _ in range(missing_count):
            row_position = random_generator.integers(
                0,
                len(modified_data),
            )

            column_name = random_generator.choice(
                modified_data.columns
            )

            modified_data.loc[
                modified_data.index[row_position],
                column_name,
            ] = np.nan

        for column in numeric_columns:
            median_value = modified_data[column].median()

            if pd.isna(median_value):
                median_value = 0

            modified_data[column] = modified_data[
                column
            ].fillna(median_value)

        for column in categorical_columns:
            mode_values = modified_data[column].mode(
                dropna=True
            )

            fill_value = (
                mode_values.iloc[0]
                if not mode_values.empty
                else "Unknown"
            )

            modified_data[column] = modified_data[
                column
            ].fillna(fill_value)

        return modified_data

    def run(
        self,
        dataframe: pd.DataFrame,
        missing_rate: float = 0.10,
    ) -> dict:
        if dataframe.empty:
            raise ValueError("Input dataframe is empty.")

        original_predictions = self.model.predict(
            dataframe
        )

        modified_data = self.inject_missing_values(
            dataframe=dataframe,
            missing_rate=missing_rate,
        )

        modified_predictions = self.model.predict(
            modified_data
        )

        changed_predictions = int(
            np.sum(
                original_predictions
                != modified_predictions
            )
        )

        total_predictions = len(
            original_predictions
        )

        stability = round(
            (
                1
                - changed_predictions
                / total_predictions
            )
            * 100,
            2,
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
            "test_name": "Missing Value Test",
            "prediction_stability": stability,
            "changed_predictions": changed_predictions,
            "total_predictions": total_predictions,
            "missing_rate": missing_rate,
            "status": status,
        }


def run_missing_value_test(
    model_path,
    dataframe,
    missing_rate: float = 0.10,
):
    tester = MissingValueTester(model_path)

    return tester.run(
        dataframe=dataframe,
        missing_rate=missing_rate,
    )