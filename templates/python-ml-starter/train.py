"""
HORUS OS — Machine Learning starter
Trains a classifier on the classic Iris dataset and reports accuracy.
A clean, runnable first ML project.

Run:  pip install -r requirements.txt && python3 train.py
"""
from sklearn.datasets import load_iris
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report


def main() -> None:
    data = load_iris()
    X_train, X_test, y_train, y_test = train_test_split(
        data.data, data.target, test_size=0.25, random_state=42
    )
    model = RandomForestClassifier(n_estimators=120, random_state=42)
    model.fit(X_train, y_train)
    preds = model.predict(X_test)

    print(f"HORUS ML — accuracy: {accuracy_score(y_test, preds):.3f}\n")
    print(classification_report(y_test, preds, target_names=data.target_names))

    sample = [[5.1, 3.5, 1.4, 0.2]]
    print("Prediction for", sample, "->", data.target_names[model.predict(sample)[0]])


if __name__ == "__main__":
    main()
