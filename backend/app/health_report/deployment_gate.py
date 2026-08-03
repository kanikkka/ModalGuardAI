"""
ModelGuard AI
Deployment Decision Engine
"""


class DeploymentGate:

    def evaluate(
        self,
        score,
        leakage,
        drift,
    ):

        if leakage < 100:

            return {

                "deployment": "BLOCKED",

                "reason":
                "Data leakage detected."

            }

        if drift < 80:

            return {

                "deployment": "BLOCKED",

                "reason":
                "Feature drift is too high."

            }

        if score >= 90:

            return {

                "deployment": "APPROVED",

                "reason":
                "Model passed all quality checks."

            }

        return {

            "deployment": "REJECTED",

            "reason":
            "Health score below deployment threshold."

        }


def deployment_decision(
    score,
    leakage,
    drift,
):

    gate = DeploymentGate()

    return gate.evaluate(
        score,
        leakage,
        drift,
    )