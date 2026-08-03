from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.training import router as training_router
from app.api.dataset import router as dataset_router
from app.api.validation import router as validation_router
from app.api.crash_test import router as crash_test_router
from app.api.missing_value_test import router as missing_value_test_router
from app.api.health_report import router as health_report_router
from app.routers.crash_test import router as crash_router
from app.routers.health_report import router as health_router
from app.blackbox.database import initialize_blackbox_database
from app.routers.blackbox import router as blackbox_router
from app.routers.failure_replay import (
    router as failure_replay_router,
)
from app.routers.treatment import router as treatment_router
from app.routers.knowledge_graph import (
    router as knowledge_graph_router,
)
from app.routers.model_dna import router as model_dna_router
from app.routers.certificate import router as certificate_router
from app.routers.llm_report import (
    router as llm_report_router,
)
from app.routers.agents import router as agents_router
app = FastAPI(
    title="ModelGuard AI API",
    description="Backend API for ML model reliability and crash testing.",
    version="1.0.0",
)
initialize_blackbox_database()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dataset_router)
app.include_router(validation_router)
app.include_router(training_router)
app.include_router(crash_test_router)
app.include_router(missing_value_test_router)
app.include_router(health_report_router)
app.include_router(crash_router)
app.include_router(health_router)
app.include_router(blackbox_router)
app.include_router(failure_replay_router)
app.include_router(treatment_router)
app.include_router(knowledge_graph_router)
app.include_router(model_dna_router)
app.include_router(certificate_router)
app.include_router(llm_report_router)
app.include_router(agents_router)
@app.get("/")
def root() -> dict[str, str]:
    return {
        "message": "ModelGuard AI backend is running.",
        "status": "success",
    }


@app.get("/health")
def health_check() -> dict[str, str]:
    return {
        "service": "ModelGuard AI API",
        "status": "healthy",
    }