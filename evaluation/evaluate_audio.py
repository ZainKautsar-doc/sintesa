import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

import json
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from app.services.audio_detector import AudioDetector, load_audio_segment

BASE = Path(__file__).resolve().parent
DATA = BASE / "dataset" / "audio"
RESULTS = BASE / "results"


def collect(folder: Path, actual: int):
    if not folder.exists():
        return []
    return [(file, actual) for file in sorted(folder.iterdir()) if file.is_file()]


def main():
    real = collect(DATA / "real", 0)
    fake = collect(DATA / "fake", 1)
    files = real + fake
    if not files:
        print("Dataset audio kosong. Isi evaluation/dataset/audio/real dan .../fake, lalu jalankan ulang.")
        return

    detector = AudioDetector()
    y_true, y_pred, rows = [], [], []
    for path, actual in files:
        try:
            y, sr = load_audio_segment(str(path))
            predicted, confidence, probabilities = detector.predict(y, sr)
            pred = 1 if predicted == "DEEPFAKE" else 0
            y_true.append(actual)
            y_pred.append(pred)
            if actual != pred:
                rows.append({
                    "filename": path.name,
                    "actual_label": "ORISINIL" if actual == 0 else "DEEPFAKE",
                    "predicted_label": predicted,
                    "confidence_fake": probabilities["DEEPFAKE"],
                    "error_type": "FALSE_POSITIVE" if actual == 0 else "FALSE_NEGATIVE",
                })
        except Exception as exc:
            print(f"Lewati {path.name}: {exc}")

    RESULTS.mkdir(parents=True, exist_ok=True)
    metrics = {
        "total_samples": len(y_true),
        "real_samples": sum(v == 0 for v in y_true),
        "fake_samples": sum(v == 1 for v in y_true),
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred, zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, zero_division=0)),
        "f1_score": float(f1_score(y_true, y_pred, zero_division=0)),
    }
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
    metrics.update({"TP": int(tp), "TN": int(tn), "FP": int(fp), "FN": int(fn)})

    print(json.dumps(metrics, indent=2, ensure_ascii=False))
    (RESULTS / "metrics_audio.json").write_text(json.dumps(metrics, indent=2, ensure_ascii=False), encoding="utf-8")

    cm = confusion_matrix(y_true, y_pred, labels=[0, 1])
    plt.figure(figsize=(7, 5))
    sns.heatmap(cm, annot=True, fmt="d", cmap="magma", xticklabels=["ORISINIL", "DEEPFAKE"], yticklabels=["ORISINIL", "DEEPFAKE"])
    plt.xlabel("Predicted"); plt.ylabel("Actual"); plt.tight_layout()
    plt.savefig(RESULTS / "confusion_matrix_audio.png", dpi=300)
    pd.DataFrame(rows).to_csv(RESULTS / "error_analysis_audio.csv", index=False)


if __name__ == "__main__":
    main()
