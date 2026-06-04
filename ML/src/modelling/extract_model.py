import mlflow
from mlflow.tracking import MlflowClient
import joblib
import os

client = MlflowClient()
exps = client.search_experiments()
exp_ids = [exp.experiment_id for exp in exps]

runs = client.search_runs(experiment_ids=exp_ids, order_by=["start_time DESC"])
found = False

for run in runs:
    run_id = run.info.run_id
    model_uri = f"runs:/{run_id}/random_forest_model"
    try:
        model = mlflow.sklearn.load_model(model_uri)
        output_path = "src/modelling/model.pkl"
        joblib.dump(model, output_path)
        print(f"Model berhasil diekstrak dari Run ID: {run_id}")
        print(f"Disimpan ke {output_path}")
        print(f"Ukuran file: {os.path.getsize(output_path) / 1024:.2f} KB")
        found = True
        break
    except Exception as e:
        continue

if not found:
    print("Tidak ditemukan model di MLflow.")
