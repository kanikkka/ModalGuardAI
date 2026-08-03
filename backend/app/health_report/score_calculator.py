"""
ModelGuard AI
Health Score Calculator
"""

class HealthScoreCalculator:

    def calculate(
        self,
        accuracy,
        noise,
        missing,
        outlier,
        drift,
        label_noise,
        imbalance,
        duplicate,
        leakage,
    ):

        score = (

            accuracy * 0.30 +

            noise * 0.20 +

            missing * 0.15 +

            outlier * 0.10 +

            drift * 0.10 +

            label_noise * 0.05 +

            imbalance * 0.05 +

            duplicate * 0.03 +

            leakage * 0.02

        )

        return round(score,2)


def generate_health_score(
    accuracy,
    noise,
    missing,
    outlier,
    drift,
    label_noise,
    imbalance,
    duplicate,
    leakage,
):

    calculator = HealthScoreCalculator()

    return calculator.calculate(

        accuracy,
        noise,
        missing,
        outlier,
        drift,
        label_noise,
        imbalance,
        duplicate,
        leakage,

    )