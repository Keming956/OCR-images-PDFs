# OCR Vision – Extraction de texte depuis images et PDF

**OCR Vision** est une application web OCR (Reconnaissance Optique de Caractères) conçue en Python avec **FastAPI**, **Tesseract**, **OpenCV** et **pdf2image**. Elle permet d'extraire du texte depuis :
- des **images** (JPEG, PNG, etc.)
- des **PDF scannés**
- des **photos prises depuis la caméra**
- ou du **texte saisi manuellement**

---

## 🚀 Fonctionnalités

- 📷 Upload d'image ou capture via webcam
- 🔤 Détection automatique de la langue
- 🧠 Prétraitement d'image avec OpenCV (sharpen, threshold, upscale)
- 🖼️ Affichage de l’image OCRée avec **boîtes de texte**
- 📄 Génération de PDF consultable avec OCR
- 📋 Copier, 🔊 lire à voix haute, ou 📥 télécharger les textes extraits
- 🌐 Interface web accessible et responsive

---

## 🧰 Technologies

- **Backend** : FastAPI, pytesseract, pdf2image, OpenCV
- **Frontend** : HTML, CSS, JavaScript (Vanilla)
- **OCR Engine** : Tesseract OCR
- **Conteneurisation** : Docker + Docker Compose

---

## 📦 Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/Keming956/OCR-images-PDFs.git
cd OCR-images-PDFs
```

### 2. Construire l’image Docker

```bash
docker compose build
```

### 3. Lancer l’application

```bash
docker compose up
```

Accédez ensuite à l'application sur :  
📍 [http://localhost:8000](http://localhost:8000)

---

## 📁 Arborescence

```
ocr-vision/
├── app/
│   ├── main.py             # API FastAPI
│   ├── ocr.py              # Fonctions OCR, prétraitement, PDF, boîtes
├── static/
│   ├── css/styles.css      # Design frontend
│   └── js/script.js        # Logique côté client (upload, caméra, TTS)
├── templates/
│   └── index.html          # Interface utilisateur avec Jinja2
├── Dockerfile              # Image Docker OCR-ready
├── docker-compose.yml      # Lancement simplifié
├── requirements.txt        # Dépendances Python
└── README.md               # Documentation
```

---

## 📚 Prétraitement OpenCV utilisé

- 🔍 Agrandissement automatique si texte trop petit
- ⚫ Conversion en niveaux de gris
- 🔇 Réduction du bruit
- ✏️ Sharpen (filtre Laplacien)
- ⚪ Binarisation adaptative

---

## 🗣️ API TTS (lecture vocale)

Utilise l’API `SpeechSynthesis` native du navigateur. Fonctionne parfaitement sous :
- Chrome (Windows/Linux/macOS)
- Edge
- Firefox (voix parfois à configurer manuellement)

---

## 🧪 Tests recommandés

- `images/poème.png` : OCR propre en français
- `images/brouillé.jpg` : vérifie les effets du prétraitement
- `pdfs/document_scanné.pdf` : génération d’un PDF OCR consultable
- `caméra` : test webcam directe

---

## ❗ Dépendances système incluses (Docker)

```bash
tesseract-ocr
tesseract-ocr-fra
poppler-utils
libgl1
libsm6
libxext6
libxrender-dev
libglib2.0-0
```

---

## 📝 Licence

Ce projet est libre et open-source sous licence MIT.

---

## 👩‍💻 Auteure

Projet développé par **Lidan Zhang**, étudiante M2 TAL – spécialité NLP.  
Contact : lidan.zhang@…
