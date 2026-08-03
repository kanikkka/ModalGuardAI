import joblib


def load_trained_model(model_path):
    saved_object = joblib.load(model_path)

    if not isinstance(saved_object, dict):
        return saved_object

    model = (
        saved_object.get("pipeline")
        or saved_object.get("model")
        or saved_object.get("classifier")
    )

    if model is None:
        raise ValueError(
            "Saved model dictionary me pipeline/model/classifier nahi mila. "
            f"Available keys: {list(saved_object.keys())}"
        )

    return model