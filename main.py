from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import pickle
import xgboost as xgb

app = FastAPI()

# Allow all origins (for local testing with your frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained XGBoost model
with open("xgboost_model.pkl", "rb") as f:
    model = pickle.load(f)

# Helper for one-hot encoding platform (make sure order matches your train/test)
def prepare_input(data):
    # Put all the possible platforms in the right order
    platforms = ['facebook', 'instagram', 'twitter']
    df = pd.DataFrame([data])
    for plat in platforms:
        df[f"platform_{plat}"] = 1 if data["platform"] == plat else 0
    df = df.drop(['platform'], axis=1)
    return df

@app.post("/predict_single")
async def predict_single(
    profile_pic: int = Form(...),
    external_URL: int = Form(...),
    private: int = Form(...),
    username_length: int = Form(...),
    username_numeric_ratio: float = Form(...),
    description_length: int = Form(...),
    posts: int = Form(...),
    followers: int = Form(...),
    following: int = Form(...),
    platform: str = Form(...)
):
    data = {
        "profile_pic": profile_pic,
        "external_URL": external_URL,
        "private": private,
        "username_length": username_length,
        "username_numeric_ratio": username_numeric_ratio,
        "description_length": description_length,
        "posts": posts,
        "followers": followers,
        "following": following,
        "platform": platform
    }
    df = prepare_input(data)

    # Reorder cols to match model
    cols_needed = model.get_booster().feature_names
    for col in cols_needed:
        if col not in df.columns:
            df[col] = 0
    df = df[cols_needed]
    pred = int(model.predict(df)[0])
    proba = float(model.predict_proba(df)[0][1])
    return {"prediction": pred, "confidence": round(proba, 2)}

@app.post("/predict_csv")
async def predict_csv(file: UploadFile = File(...)):
    df = pd.read_csv(file.file)
    # One-hot encode platforms
    platforms = ['facebook', 'instagram', 'twitter']
    for plat in platforms:
        df[f"platform_{plat}"] = (df["platform"] == plat).astype(int)
    df = df.drop(['platform'], axis=1)
    # Ensure columns in order
    cols_needed = model.get_booster().feature_names
    for col in cols_needed:
        if col not in df.columns:
            df[col] = 0
    df = df[cols_needed]
    preds = model.predict(df)
    proba = model.predict_proba(df)[:, 1]
    return {
        "predictions": preds.tolist(),
        "confidences": [round(float(p), 2) for p in proba]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
