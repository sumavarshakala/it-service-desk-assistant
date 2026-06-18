"""
ML Training Script for IT Service Desk Assistant
Trains category and priority classifiers using TF-IDF + Multinomial Naive Bayes
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, classification_report

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "training_data.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models")
METRICS_PATH = os.path.join(MODELS_DIR, "metrics.json")


def load_data():
    df = pd.read_csv(DATA_PATH)
    df["text"] = df["text"].str.lower().str.strip()
    return df


def train_classifier(X_train, y_train, X_test, y_test, label_name):
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),
            stop_words="english",
            sublinear_tf=True
        )),
        ("classifier", MultinomialNB(alpha=0.1))
    ])

    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)

    accuracy = accuracy_score(y_test, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(
        y_test, y_pred, average="weighted", zero_division=0
    )

    report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)

    metrics = {
        "label": label_name,
        "accuracy": round(accuracy, 4),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1, 4),
        "classification_report": report,
        "test_samples": len(y_test),
        "train_samples": len(y_train)
    }

    print(f"\n{'='*50}")
    print(f"{label_name} Classifier Results")
    print(f"{'='*50}")
    print(f"Accuracy:  {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1 Score:  {f1:.4f}")
    print(classification_report(y_test, y_pred, zero_division=0))

    return pipeline, metrics


def main():
    os.makedirs(MODELS_DIR, exist_ok=True)

    df = load_data()
    print(f"Loaded {len(df)} training samples")
    print(f"Categories: {df['category'].nunique()}")
    print(f"Priorities: {df['priority'].nunique()}")

    # Train category classifier
    X_train, X_test, y_cat_train, y_cat_test = train_test_split(
        df["text"], df["category"], test_size=0.2, random_state=42, stratify=df["category"]
    )
    category_model, category_metrics = train_classifier(
        X_train, y_cat_train, X_test, y_cat_test, "Category"
    )

    # Train priority classifier
    _, _, y_pri_train, y_pri_test = train_test_split(
        df["text"], df["priority"], test_size=0.2, random_state=42, stratify=df["priority"]
    )
    priority_model, priority_metrics = train_classifier(
        X_train, y_pri_train, X_test, y_pri_test, "Priority"
    )

    # Save models
    joblib.dump(category_model, os.path.join(MODELS_DIR, "category_model.joblib"))
    joblib.dump(priority_model, os.path.join(MODELS_DIR, "priority_model.joblib"))

    # Save TF-IDF vectorizer for similarity search (trained on full dataset)
    similarity_vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        stop_words="english",
        sublinear_tf=True
    )
    similarity_vectorizer.fit(df["text"])
    joblib.dump(similarity_vectorizer, os.path.join(MODELS_DIR, "similarity_vectorizer.joblib"))

    all_metrics = {
        "category": category_metrics,
        "priority": priority_metrics,
        "dataset_size": len(df),
        "categories": sorted(df["category"].unique().tolist()),
        "priorities": sorted(df["priority"].unique().tolist())
    }

    with open(METRICS_PATH, "w") as f:
        json.dump(all_metrics, f, indent=2)

    print(f"\nModels saved to {MODELS_DIR}")
    print(f"Metrics saved to {METRICS_PATH}")


if __name__ == "__main__":
    main()
