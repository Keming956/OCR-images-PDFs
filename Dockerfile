# Étape 1 : Base Python légère
FROM python:3.11-slim

# Étape 2 : Installation des dépendances système nécessaires
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-fra \
    tesseract-ocr-eng \
    tesseract-ocr-spa \
    tesseract-ocr-deu \
    tesseract-ocr-ita \
    poppler-utils \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libjpeg-dev \
    zlib1g-dev \
    libgl1 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Étape 3 : Configuration du répertoire de travail
WORKDIR /app

# Étape 4 : Copier le code de l'application
COPY app/ ./app/
COPY static/ ./static/
COPY templates/ ./templates/
COPY requirements.txt ./

# Étape 5 : Installation des dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Étape 6 : Définir le port utilisé
EXPOSE 8000

# Étape 7 : Lancer l'application avec Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]