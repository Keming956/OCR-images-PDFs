from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.ocr import perform_ocr

import os
import shutil
import uuid

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

UPLOAD_FOLDER = "uploaded_files"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/ocr", response_class=HTMLResponse)
async def ocr_endpoint(
    request: Request,
    file: UploadFile = File(...),
    lang: str = Form("fra")
):
    # Sauvegarder le fichier temporairement
    file_ext = os.path.splitext(file.filename)[-1]
    temp_filename = f"{uuid.uuid4()}{file_ext}"
    temp_path = os.path.join(UPLOAD_FOLDER, temp_filename)

    with open(temp_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Appliquer l’OCR
    try:
        text = perform_ocr(temp_path, lang=lang)
    except Exception as e:
        text = f"Erreur lors de l'analyse OCR : {e}"

    # Nettoyage
    os.remove(temp_path)

    return templates.TemplateResponse("index.html", {"request": request, "text": text})