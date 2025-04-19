import cv2
import pytesseract
import numpy as np
from pytesseract import Output
from PIL import Image
from pdf2image import convert_from_path
import os


def preprocess_image_cv(image_cv: np.ndarray) -> np.ndarray:
    """
    Prétraitement d'image : upscale, gris, débruitage, netteté, flou, seuillage Otsu.
    """
    if image_cv.shape[1] < 800:
        image_cv = cv2.resize(image_cv, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

    gray = cv2.cvtColor(image_cv, cv2.COLOR_BGR2GRAY)
    denoised = cv2.medianBlur(gray, 3)
    sharpened = cv2.filter2D(denoised, -1, np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]]))
    blurred = cv2.GaussianBlur(sharpened, (3, 3), 0)
    _, binary = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    return binary


def clean_text(text: str) -> str:
    """
    Nettoyage du texte OCR : suppression lignes vides et espaces multiples.
    """
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    return "\n".join(lines).strip()


def perform_ocr(image_path: str, lang: str = "fra") -> str:
    """
    OCR avec Tesseract sur une image prétraitée. Mode PSM 6.
    """
    image_cv = cv2.imread(image_path)
    if image_cv is None:
        raise RuntimeError(f"Impossible de lire l'image : {image_path}")

    processed = preprocess_image_cv(image_cv)

    config = r"--oem 3 --psm 6"
    raw_text = pytesseract.image_to_string(processed, lang=lang, config=config)

    return clean_text(raw_text)


def draw_bounding_boxes(image_path: str, output_path: str, lang: str = "fra"):
    """
    Dessine des boîtes autour des textes détectés sur l'image.
    """
    image_cv = cv2.imread(image_path)
    if image_cv is None:
        raise RuntimeError(f"Impossible de lire l'image : {image_path}")

    processed = preprocess_image_cv(image_cv)
    data = pytesseract.image_to_data(
        processed, lang=lang, config="--psm 6", output_type=Output.DICT
    )

    for i in range(len(data["text"])):
        if int(data["conf"][i]) == -1 or not data["text"][i].strip():
            continue
        x, y, w, h = data["left"][i], data["top"][i], data["width"][i], data["height"][i]
        cv2.rectangle(image_cv, (x, y), (x + w, y + h), (0, 255, 0), 1)

    cv2.imwrite(output_path, image_cv)


def generate_searchable_pdf(image_path: str, output_path: str, lang: str = "fra"):
    """
    Génére un PDF OCR consultable à partir d’une image.
    """
    pdf_bytes = pytesseract.image_to_pdf_or_hocr(image_path, lang=lang, extension='pdf')
    with open(output_path, "wb") as f:
        f.write(pdf_bytes)


def pdf_to_images(pdf_path: str, output_folder: str = "temp_pages") -> list[str]:
    """
    Convertit un PDF en une liste d’images PNG.
    """
    os.makedirs(output_folder, exist_ok=True)
    pages = convert_from_path(pdf_path, fmt='png', output_folder=output_folder)
    paths = []

    for i, page in enumerate(pages):
        img_path = os.path.join(output_folder, f"page_{i + 1}.png")
        page.save(img_path, "PNG")
        paths.append(img_path)

    return paths