from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from app.agents.specialist_agents import (
    DeploymentGuardianAgent,
    DiagnosisAgent,
    HealthAgent,
    InspectorAgent,
    TreatmentAgent,
)


class MultiAgentOrchestrator:
    """Saare specialist agents ko fixed workflow me execute karta hai."""

    def run(
        self,
        metrics: dict[str, Any],
    ) -> dict[str, Any]:
        investigation_id = uuid4().hex

        inspector_result = InspectorAgent.inspect(metrics)

        health_result = HealthAgent.evaluate(metrics)

        diagnosis_result = DiagnosisAgent.diagnose(metrics)

        treatment_result = TreatmentAgent.prescribe(metrics)

        deployment_result = DeploymentGuardianAgent.decide(
            metrics=metrics,
            health_report=health_result,
        )

        return {
            "investigation_id": investigation_id,
            "created_at": datetime.now(
                timezone.utc
            ).isoformat(),
            "workflow": [
                "Inspector Agent",
                "Health Agent",
                "Diagnosis Agent",
                "Treatment Agent",
                "Deployment Guardian Agent",
            ],
            "results": {
                "inspection": inspector_result,
                "health_evaluation": health_result,
                "diagnosis": diagnosis_result,
                "treatment": treatment_result,
                "deployment_decision": deployment_result,
            },
            "final_verdict": deployment_result["decision"],
            "risk_level": deployment_result["risk_level"],
        }


def run_multi_agent_investigation(
    metrics: dict[str, Any],
) -> dict[str, Any]:
    orchestrator = MultiAgentOrchestrator()
    return orchestrator.run(metrics)