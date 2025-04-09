from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse

from app.ocr import perform_ocr
import os
import shutil
import uuid

app = FastAPI()

# Dossiers statiques (CSS, JS)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Dossier de templates HTML
templates = Jinja2Templates(directory="templates")

# Dossier pour les fichiers uploadés
UPLOAD_FOLDER = "uploaded_files"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/ocr", response_class=HTMLResponse)
async def ocr_endpoint(
    request: Request,
    file: UploadFile = File(None),
    lang: str = Form("fra"),
    manual_input: str = Form("")
):
    text = ""

    if file and file.filename != "":
        file_ext = os.path.splitext(file.filename)[-1]
        temp_filename = f"{uuid.uuid4()}{file_ext}"
        temp_path = os.path.join(UPLOAD_FOLDER, temp_filename)

        with open(temp_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        try:
            text = perform_ocr(temp_path, lang=lang)
        except Exception as e:
            text = f"Erreur lors de l'analyse OCR : {e}"
        finally:
            os.remove(temp_path)

    elif manual_input.strip():
        text = manual_input.strip()
    else:
        text = "Aucun fichier ni texte saisi."

    # Si appel JS → retour JSON
    if request.headers.get("x-requested-with") == "XMLHttpRequest":
        return JSONResponse(content={"text": text})

    # Sinon affichage template HTML classique
    return templates.TemplateResponse("index.html", {
        "request": request,
        "text": text
    })