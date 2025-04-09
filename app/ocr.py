from PIL import Image
import pytesseract
import re
import io


def clean_text(text: str) -> str:
    """
    Nettoie le texte OCR : supprime espaces multiples, caractères inutiles, etc.
    """
    # Supprime les lignes vides et normalise les espaces
    text = "\n".join([line.strip() for line in text.splitlines() if line.strip()])
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\w\s\.,;:!?«»\"'()\[\]-]", "", text)
    return text.strip()


def perform_ocr(image_bytes: bytes, lang: str = "fra") -> str:
    """
    Effectue l'OCR à partir d'une image (fichier binaire) et retourne le texte nettoyé.

    Args:
        image_bytes (bytes): Image encodée en binaire (ex: UploadFile.read()).
        lang (str): Code langue pour Tesseract (ex: "fra", "eng").

    Returns:
        str: Texte OCR nettoyé.
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        raw_text = pytesseract.image_to_string(image, lang=lang)
        return clean_text(raw_text)
    except Exception as e:
        raise RuntimeError(f"Erreur OCR : {str(e)}")