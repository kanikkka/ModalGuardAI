import hashlib
from pathlib import Path


def calculate_file_hash(file_path: Path) -> str:
    if not file_path.exists():
        raise FileNotFoundError(
            f"File not found: {file_path}"
        )

    sha256_hash = hashlib.sha256()

    with file_path.open("rb") as file:
        while chunk := file.read(8192):
            sha256_hash.update(chunk)

    return sha256_hash.hexdigest()


def create_short_fingerprint(
    file_path: Path,
) -> str:
    full_hash = calculate_file_hash(file_path)

    return full_hash[:16].upper()