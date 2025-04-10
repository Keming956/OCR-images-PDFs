import cv2
import pytesseract
import numpy as np
from pytesseract import Output
from PIL import Image
from pdf2image import convert_from_path
import os


def preprocess_image_cv(image_cv: np.ndarray) -> np.ndarray:
    """
    Prépare l’image pour l’OCR : agrandissement, niveaux de gris, débruitage, sharpen, binarisation.
    """
    # Upscale automatique si petite image
    if image_cv.shape[1] < 800:
        image_cv = cv2.resize(image_cv, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

    gray = cv2.cvtColor(image_cv, cv2.COLOR_BGR2GRAY)
    denoised = cv2.medianBlur(gray, 3)
    sharpened = cv2.filter2D(denoised, -1, np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]]))
    binarized = cv2.adaptiveThreshold(
        sharpened, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 11, 2
    )
    return binarized


def perform_ocr(image_path: str, lang: str = "fra") -> str:
    """
    Exécute l’OCR sur une image avec prétraitement complet.
    """
    image_cv = cv2.imread(image_path)
    if image_cv is None:
        raise RuntimeError(f"Impossible d'ouvrir l'image : {image_path}")

    preprocessed = preprocess_image_cv(image_cv)
    raw_text = pytesseract.image_to_string(preprocessed, lang=lang)
    return clean_text(raw_text)


def clean_text(text: str) -> str:
    """
    Nettoie le texte brut (lignes vides, espaces multiples, caractères erronés simples).
    """
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    text = "\n".join(lines)
    return text.strip()


def draw_bounding_boxes(image_path: str, output_path: str, lang: str = "fra"):
    """
    Génère une image avec boîtes autour du texte détecté.
    """
    image_cv = cv2.imread(image_path)
    if image_cv is None:
        raise RuntimeError(f"Impossible d'ouvrir l'image : {image_path}")

    preprocessed = preprocess_image_cv(image_cv)
    data = pytesseract.image_to_data(preprocessed, lang=lang, output_type=Output.DICT)
    n_boxes = len(data["text"])

    for i in range(n_boxes):
        if int(data["conf"][i]) == -1 or not data["text"][i].strip():
            continue
        x, y, w, h = data["left"][i], data["top"][i], data["width"][i], data["height"][i]
        cv2.rectangle(image_cv, (x, y), (x + w, y + h), (0, 255, 0), 1)

    cv2.imwrite(output_path, image_cv)


def pdf_to_images(pdf_path: str, output_folder: str = "temp_images") -> list:
    """
    Convertit un PDF en liste d’images PNG.
    """
    os.makedirs(output_folder, exist_ok=True)
    pages = convert_from_path(pdf_path, fmt='png', output_folder=output_folder)
    image_paths = []
    for i, page in enumerate(pages):
        img_path = os.path.join(output_folder, f"page_{i + 1}.png")
        page.save(img_path, 'PNG')
        image_paths.append(img_path)
    return image_paths


def generate_searchable_pdf(image_path: str, output_path: str, lang: str = "fra"):
    """
    Crée un PDF consultable contenant le texte OCRé de l’image.
    """
    pdf_bytes = pytesseract.image_to_pdf_or_hocr(image_path, lang=lang, extension='pdf')
    with open(output_path, "wb") as f:
        f.write(pdf_bytes)