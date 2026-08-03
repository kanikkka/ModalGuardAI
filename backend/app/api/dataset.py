from pathlib import Path
from uuid import uuid4

import pandas as pd
from fastapi import APIRouter, File, HTTPException, UploadFile

router = APIRouter(
    prefix="/dataset",
    tags=["Dataset"],
)

BASE_DIR = Path(__file__).resolve().parents[2]
UPLOAD_DIR = BASE_DIR / "uploads"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".csv"}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)) -> dict:
    """
    Upload a CSV dataset and return its basic information.
    """

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="File name is missing.",
        )

    file_extension = Path(file.filename).suffix.lower()

    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are allowed.",
        )

    file_content = await file.read()

    if not file_content:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty.",
        )

    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size must be less than 20 MB.",
        )

    unique_file_name = f"{uuid4().hex}_{Path(file.filename).name}"
    saved_file_path = UPLOAD_DIR / unique_file_name

    try:
        saved_file_path.write_bytes(file_content)

        dataframe = pd.read_csv(saved_file_path)

    except UnicodeDecodeError as error:
        saved_file_path.unlink(missing_ok=True)

        raise HTTPException(
            status_code=400,
            detail="Unable to read the file. Please upload a valid CSV file.",
        ) from error

    except pd.errors.EmptyDataError as error:
        saved_file_path.unlink(missing_ok=True)

        raise HTTPException(
            status_code=400,
            detail="CSV file does not contain any data.",
        ) from error

    except pd.errors.ParserError as error:
        saved_file_path.unlink(missing_ok=True)

        raise HTTPException(
            status_code=400,
            detail="CSV file format is invalid.",
        ) from error

    except Exception as error:
        saved_file_path.unlink(missing_ok=True)

        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing the dataset.",
        ) from error

    if dataframe.empty:
        saved_file_path.unlink(missing_ok=True)

        raise HTTPException(
            status_code=400,
            detail="Dataset does not contain any rows.",
        )

    missing_values = {
        str(column): int(value)
        for column, value in dataframe.isnull().sum().items()
    }

    column_types = {
        str(column): str(data_type)
        for column, data_type in dataframe.dtypes.items()
    }

    preview = dataframe.head(5).fillna("").to_dict(orient="records")

    return {
        "message": "Dataset uploaded successfully.",
        "dataset": {
            "original_file_name": file.filename,
            "saved_file_name": unique_file_name,
            "rows": int(dataframe.shape[0]),
            "columns_count": int(dataframe.shape[1]),
            "columns": dataframe.columns.tolist(),
            "column_types": column_types,
            "missing_values": missing_values,
            "preview": preview,
        },
    }