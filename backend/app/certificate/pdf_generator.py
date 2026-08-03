from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


BASE_DIR = Path(__file__).resolve().parents[2]
REPORTS_DIR = BASE_DIR / "reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)


def generate_reliability_certificate(
    model_dna: dict[str, Any],
    health_score: float,
    grade: str,
    deployment_status: str,
    crash_test_results: dict[str, Any] | None = None,
) -> dict[str, Any]:
    certificate_id = f"MGC-{uuid4().hex[:12].upper()}"

    file_name = f"{certificate_id}_reliability_certificate.pdf"
    file_path = REPORTS_DIR / file_name

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        name="CertificateTitle",
        parent=styles["Title"],
        fontSize=23,
        leading=29,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#4F46E5"),
        spaceAfter=12,
    )

    subtitle_style = ParagraphStyle(
        name="CertificateSubtitle",
        parent=styles["Heading2"],
        fontSize=14,
        leading=18,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#475569"),
        spaceAfter=20,
    )

    body_style = ParagraphStyle(
        name="CertificateBody",
        parent=styles["BodyText"],
        fontSize=10,
        leading=15,
        textColor=colors.HexColor("#334155"),
    )

    document = SimpleDocTemplate(
        str(file_path),
        pagesize=A4,
        rightMargin=22 * mm,
        leftMargin=22 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
    )

    story = []

    story.append(
        Paragraph(
            "ModelGuard AI",
            title_style,
        )
    )

    story.append(
        Paragraph(
            "Machine Learning Reliability Certificate",
            subtitle_style,
        )
    )

    story.append(
        Paragraph(
            (
                "This internal engineering certificate confirms that the "
                "following machine-learning model was evaluated using "
                "ModelGuard AI reliability and robustness checks."
            ),
            body_style,
        )
    )

    story.append(Spacer(1, 14))

    model_information = [
        ["Certificate ID", certificate_id],
        ["Model ID", str(model_dna.get("model_id", "N/A"))],
        ["Model File", str(model_dna.get("model_file_name", "N/A"))],
        ["Algorithm", str(model_dna.get("algorithm", "N/A"))],
        ["Dataset", str(model_dna.get("dataset_file_name", "N/A"))],
        ["Target Column", str(model_dna.get("target_column", "N/A"))],
        ["Feature Count", str(model_dna.get("feature_count", "N/A"))],
        ["Fingerprint", str(model_dna.get("fingerprint", "N/A"))],
        ["Health Score", f"{health_score}/100"],
        ["Grade", grade],
        ["Deployment Status", deployment_status],
        [
            "Generated At",
            datetime.now(timezone.utc).strftime(
                "%Y-%m-%d %H:%M:%S UTC"
            ),
        ],
    ]

    model_table = Table(
        model_information,
        colWidths=[52 * mm, 100 * mm],
    )

    model_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.HexColor("#EEF2FF"),
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (0, -1),
                    colors.HexColor("#4338CA"),
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (0, -1),
                    "Helvetica-Bold",
                ),
                (
                    "FONTNAME",
                    (1, 0),
                    (1, -1),
                    "Helvetica",
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.HexColor("#CBD5E1"),
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE",
                ),
                (
                    "PADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
            ]
        )
    )

    story.append(model_table)
    story.append(Spacer(1, 20))

    if crash_test_results:
        story.append(
            Paragraph(
                "Crash Test Summary",
                styles["Heading2"],
            )
        )

        crash_rows = [
            ["Test", "Result"],
        ]

        for test_name, result in crash_test_results.items():
            if isinstance(result, dict):
                value = (
                    result.get("prediction_stability")
                    or result.get("overall_stability")
                    or result.get("status")
                    or "Completed"
                )
            else:
                value = result

            crash_rows.append(
                [
                    test_name.replace("_", " ").title(),
                    str(value),
                ]
            )

        crash_table = Table(
            crash_rows,
            colWidths=[75 * mm, 75 * mm],
        )

        crash_table.setStyle(
            TableStyle(
                [
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, 0),
                        colors.HexColor("#4F46E5"),
                    ),
                    (
                        "TEXTCOLOR",
                        (0, 0),
                        (-1, 0),
                        colors.white,
                    ),
                    (
                        "FONTNAME",
                        (0, 0),
                        (-1, 0),
                        "Helvetica-Bold",
                    ),
                    (
                        "GRID",
                        (0, 0),
                        (-1, -1),
                        0.5,
                        colors.HexColor("#CBD5E1"),
                    ),
                    (
                        "PADDING",
                        (0, 0),
                        (-1, -1),
                        8,
                    ),
                ]
            )
        )

        story.append(crash_table)
        story.append(Spacer(1, 18))

    story.append(
        Paragraph(
            (
                "<b>Important:</b> This certificate is an internal "
                "engineering reliability report. It is not a legal, medical, "
                "financial, regulatory or clinical certification."
            ),
            body_style,
        )
    )

    document.build(story)

    return {
        "certificate_id": certificate_id,
        "file_name": file_name,
        "file_path": str(file_path),
        "model_id": model_dna.get("model_id"),
        "health_score": health_score,
        "grade": grade,
        "deployment_status": deployment_status,
    }