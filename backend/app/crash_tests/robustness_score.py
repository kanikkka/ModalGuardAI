import numpy as np


class RobustnessScore:

    def generate(
        self,
        noise,
        missing,
        outlier,
        drift,
    ):

        scores = [

            noise["prediction_stability"],

            missing["prediction_stability"],

            outlier["prediction_stability"],

            drift["overall_stability"]

        ]

        final_score = round(

            np.mean(scores),

            2

        )

        if final_score >= 95:

            grade = "A+"

        elif final_score >= 90:

            grade = "A"

        elif final_score >= 80:

            grade = "B"

        elif final_score >= 70:

            grade = "C"

        else:

            grade = "F"

        return {

            "robustness_score": final_score,

            "grade": grade,

            "deployment_ready": final_score >= 90

        }


def generate_score(
    noise,
    missing,
    outlier,
    drift,
):

    return RobustnessScore().generate(

        noise,

        missing,

        outlier,

        drift

    )