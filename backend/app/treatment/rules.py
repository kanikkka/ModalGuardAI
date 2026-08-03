from typing import Any


def build_treatment_rules(
    metrics: dict[str, Any],
) -> list[dict[str, Any]]:
    treatments: list[dict[str, Any]] = []

    noise = float(metrics.get("noise_stability", 100))
    missing = float(metrics.get("missing_stability", 100))
    outlier = float(metrics.get("outlier_stability", 100))
    drift = float(metrics.get("drift_stability", 100))
    class_balance = float(metrics.get("class_balance", 100))
    duplicate_score = float(metrics.get("duplicate_score", 100))
    leakage_score = float(metrics.get("leakage_score", 100))
    health_score = float(metrics.get("health_score", 100))

    if leakage_score < 100:
        treatments.append(
            {
                "issue": "Possible Data Leakage",
                "priority": "CRITICAL",
                "recommended_action": (
                    "Remove suspicious target-related or future-information "
                    "features and retrain the model."
                ),
                "expected_benefit": (
                    "More realistic evaluation and safer deployment."
                ),
            }
        )

    if drift < 80:
        treatments.append(
            {
                "issue": "High Feature Drift",
                "priority": "HIGH",
                "recommended_action": (
                    "Compare current and training distributions, retrain the "
                    "model and add scheduled drift monitoring."
                ),
                "expected_benefit": (
                    "Better performance on changing production data."
                ),
            }
        )

    if noise < 80:
        treatments.append(
            {
                "issue": "Noise Sensitivity",
                "priority": "HIGH",
                "recommended_action": (
                    "Apply robust scaling, regularization and remove unstable "
                    "features."
                ),
                "expected_benefit": (
                    "Fewer prediction changes caused by small input noise."
                ),
            }
        )

    if missing < 80:
        treatments.append(
            {
                "issue": "Missing-Value Instability",
                "priority": "HIGH",
                "recommended_action": (
                    "Compare median, most-frequent and KNN imputation methods."
                ),
                "expected_benefit": (
                    "Stable predictions when production data is incomplete."
                ),
            }
        )

    if outlier < 80:
        treatments.append(
            {
                "issue": "Outlier Sensitivity",
                "priority": "MEDIUM",
                "recommended_action": (
                    "Use clipping, robust scaling or Isolation Forest for "
                    "outlier handling."
                ),
                "expected_benefit": (
                    "Improved reliability on extreme input values."
                ),
            }
        )

    if class_balance < 60:
        treatments.append(
            {
                "issue": "Class Imbalance",
                "priority": "HIGH",
                "recommended_action": (
                    "Try class weights, stratified sampling or SMOTE on the "
                    "training set only."
                ),
                "expected_benefit": (
                    "Improved minority-class recall and fewer false negatives."
                ),
            }
        )

    if duplicate_score < 95:
        treatments.append(
            {
                "issue": "Duplicate Records",
                "priority": "MEDIUM",
                "recommended_action": (
                    "Remove duplicate rows and ensure related entities do not "
                    "appear in both train and test sets."
                ),
                "expected_benefit": (
                    "Reduced memorization and more trustworthy validation."
                ),
            }
        )

    if health_score < 70:
        treatments.append(
            {
                "issue": "Low Overall Health Score",
                "priority": "CRITICAL",
                "recommended_action": (
                    "Block deployment, review the dataset pipeline and retrain "
                    "after resolving critical issues."
                ),
                "expected_benefit": (
                    "Prevents an unreliable model from reaching production."
                ),
            }
        )

    return treatments