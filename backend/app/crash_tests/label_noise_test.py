import numpy as np
import pandas as pd


class LabelNoiseTester:
    def run(self, y: pd.Series, noise_rate: float = 0.05) -> dict:
        y = y.copy().reset_index(drop=True)

        if len(y) == 0:
            raise ValueError("Target column is empty.")

        if not 0 < noise_rate <= 0.5:
            raise ValueError("noise_rate must be between 0 and 0.5.")

        changed_count = max(1, int(len(y) * noise_rate))

        rng = np.random.default_rng(seed=42)

        selected_indexes = rng.choice(
            len(y),
            size=min(changed_count, len(y)),
            replace=False,
        )

        unique_classes = y.dropna().unique().tolist()

        if len(unique_classes) < 2:
            raise ValueError(
                "Label noise test requires at least two target classes."
            )

        noisy_y = y.copy()

        for index in selected_indexes:
            current_value = noisy_y.iloc[index]

            alternative_classes = [
                value
                for value in unique_classes
                if value != current_value
            ]

            noisy_y.iloc[index] = rng.choice(alternative_classes)

        actual_changed = int((y != noisy_y).sum())

        stability = round(
            (1 - actual_changed / len(y)) * 100,
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
            "test_name": "Label Noise Test",
            "prediction_stability": stability,
            "changed_labels": actual_changed,
            "total_labels": int(len(y)),
            "noise_rate": noise_rate,
            "status": status,
        }


def run_label_noise_test(
    y: pd.Series,
    noise_rate: float = 0.05,
) -> dict:
    tester = LabelNoiseTester()
    return tester.run(y, noise_rate)