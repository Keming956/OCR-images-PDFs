from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.ocr import (
    perform_ocr,
    draw_bounding_boxes,
    pdf_to_images,
    generate_searchable_pdf,
    clean_text
)

import os
import shutil
import uuid
from langdetect import detect

app = FastAPI()

# Dossiers statiques et templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Dossiers de fichiers
UPLOAD_FOLDER = "uploaded_files"
OUTPUT_FOLDER = "ocr_outputs"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

ALLOWED_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".bmp", ".tiff"}
PDF_EXTENSION = ".pdf"


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
    detected_lang = lang
    pdf_generated_path = ""
    boxed_image_path = ""

    if file and file.filename:
        file_ext = os.path.splitext(file.filename)[-1].lower()
        temp_filename = f"{uuid.uuid4()}{file_ext}"
        temp_path = os.path.join(UPLOAD_FOLDER, temp_filename)

        with open(temp_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        try:
            if file_ext == PDF_EXTENSION:
                pages = pdf_to_images(temp_path, output_folder=UPLOAD_FOLDER)
                all_texts = [perform_ocr(img, lang=lang) for img in pages]
                text = "\n\n".join(all_texts)

                pdf_output = os.path.join(OUTPUT_FOLDER, f"{uuid.uuid4()}.pdf")
                generate_searchable_pdf(pages[0], output_path=pdf_output, lang=lang)
                pdf_generated_path = pdf_output

            elif file_ext in ALLOWED_IMAGE_EXTENSIONS:
                text = perform_ocr(temp_path, lang=lang)

                boxed_img = os.path.join(OUTPUT_FOLDER, f"{uuid.uuid4()}.png")
                draw_bounding_boxes(temp_path, output_path=boxed_img, lang=lang)
                boxed_image_path = boxed_img

                pdf_output = os.path.join(OUTPUT_FOLDER, f"{uuid.uuid4()}.pdf")
                generate_searchable_pdf(temp_path, output_path=pdf_output, lang=lang)
                pdf_generated_path = pdf_output

            # Détection automatique de la langue
            try:
                detected_lang = detect(text)
            except Exception:
                pass

        except Exception as e:
            text = f"Erreur lors de l'analyse OCR : {e}"

        finally:
            os.remove(temp_path)

    elif manual_input.strip():
        text = manual_input.strip()
        try:
            detected_lang = detect(text)
        except Exception:
            pass
    else:
        text = "Aucun fichier ni texte saisi."

    if request.headers.get("x-requested-with") == "XMLHttpRequest":
        return JSONResponse(content={
            "text": text,
            "detected_lang": detected_lang,
            "pdf_path": pdf_generated_path,
            "boxed_image_path": boxed_image_path
        })

    return templates.TemplateResponse("index.html", {
        "request": request,
        "text": text,
        "detected_lang": detected_lang,
        "pdf_path": pdf_generated_path,
        "boxed_image_path": boxed_image_path
    })