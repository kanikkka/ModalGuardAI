"""
ModelGuard AI
Recommendation Engine
"""


class RecommendationEngine:

    def generate(
        self,
        score,
        noise,
        drift,
        leakage,
        imbalance,
        duplicate,
    ):

        recommendations = []

        if score >= 95:
            recommendations.append(
                "Model is production ready."
            )

        if noise < 90:
            recommendations.append(
                "Improve robustness against noisy data."
            )

        if drift < 90:
            recommendations.append(
                "Monitor feature drift every week."
            )

        if leakage < 100:
            recommendations.append(
                "Possible data leakage detected."
            )

        if imbalance < 80:
            recommendations.append(
                "Apply SMOTE or class balancing."
            )

        if duplicate < 95:
            recommendations.append(
                "Remove duplicate records."
            )

        if len(recommendations) == 0:

            recommendations.append(
                "No major issues detected."
            )

        return recommendations


def generate_recommendations(
    score,
    noise,
    drift,
    leakage,
    imbalance,
    duplicate,
):

    engine = RecommendationEngine()

    return engine.generate(
        score,
        noise,
        drift,
        leakage,
        imbalance,
        duplicate,
    )