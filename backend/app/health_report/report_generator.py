from app.health_report.score_calculator import *
from app.health_report.grade_generator import *
from app.health_report.recommendation_engine import *
from app.health_report.deployment_gate import *


class HealthReportGenerator:

    def generate(
        self,
        metrics,
    ):

        score = generate_health_score(

            metrics["accuracy"],

            metrics["noise"],

            metrics["missing"],

            metrics["outlier"],

            metrics["drift"],

            metrics["label_noise"],

            metrics["imbalance"],

            metrics["duplicate"],

            metrics["leakage"]

        )

        grade = generate_grade(score)

        recommendations = generate_recommendations(

            score,

            metrics["noise"],

            metrics["drift"],

            metrics["leakage"],

            metrics["imbalance"],

            metrics["duplicate"]

        )

        deployment = deployment_decision(

            score,

            metrics["leakage"],

            metrics["drift"]

        )

        return {

            "health_score": score,

            "grade": grade,

            "deployment": deployment,

            "recommendations": recommendations

        }


def generate_health_report(metrics):

    generator = HealthReportGenerator()

    return generator.generate(metrics)