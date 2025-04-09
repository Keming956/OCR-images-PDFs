from PIL import Image
import pytesseract
import re

def clean_text(text: str) -> str:
    """
    Nettoie le texte OCR : supprime les espaces multiples, caractères parasites, etc.
    """
    # Supprimer les lignes vides
    text = "\n".join(line.strip() for line in text.splitlines() if line.strip())

    # Réduire les espaces multiples
    text = re.sub(r"\s+", " ", text)

    # Supprimer les caractères non textuels fréquents dans les erreurs OCR
    text = re.sub(r"[^\w\s\.,;:!?«»\"'()\-–—]", "", text)

    return text.strip()


def perform_ocr(image_path: str, lang: str = "fra") -> str:
    """
    Applique Tesseract OCR sur une image et nettoie le texte extrait.

    Args:
        image_path (str): Chemin vers l'image à traiter.
        lang (str): Langue Tesseract (par ex: 'fra', 'eng').

    Returns:
        str: Texte nettoyé.
    """
    try:
        image = Image.open(image_path)
        raw_text = pytesseract.image_to_string(image, lang=lang)
        return clean_text(raw_text)
    except Exception as e:
        raise RuntimeError(f"[OCR] Erreur d'extraction : {e}")