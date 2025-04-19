Très bien, voici une version **sans emoji** du `README.md` pour ton projet **OCR Vision** :

---

### `README.md`

```markdown
# OCR Vision

Application web OCR (Reconnaissance Optique de Caractères) pour extraire du texte depuis des images ou des PDF, en utilisant FastAPI, Tesseract, OpenCV et Docker.

## Fonctionnalités

- Import d’images ou capture depuis la caméra
- Prise en charge des PDF
- Détection automatique de la langue
- Lecture du texte reconnu avec la voix native (SpeechSynthesis)
- Mode sombre / clair
- Raccourci clavier Ctrl+Entrée pour lancer l’OCR
- Téléchargement du texte ou du PDF consultable généré
- Affichage des boîtes de texte détectées (bounding boxes)
- Saisie manuelle du texte

## Technologies utilisées

- Backend : FastAPI, pytesseract, pdf2image, langdetect
- Frontend : HTML5, CSS3, JavaScript (vanilla), Web Speech API
- OCR : Tesseract 5 + OpenCV (prétraitement)
- Déploiement : Docker, Docker Compose

## Installation avec Docker

### 1. Cloner le dépôt

```bash
git clone https://github.com/ton-utilisateur/ocr-vision.git
cd ocr-vision
```

### 2. Lancer avec Docker Compose

```bash
sudo docker-compose up --build
```

Accéder ensuite à l'application sur http://localhost:8000

## Arborescence du projet

```
ocr-vision/
├── app/
│   ├── main.py            # FastAPI backend
│   └── ocr.py             # Fonctions OCR, OpenCV, PDF, etc.
├── templates/
│   └── index.html         # Interface HTML (Jinja2)
├── static/
│   ├── css/styles.css     # Feuilles de style
│   ├── js/script.js       # Logique client
│   └── favicon.png        # Icône
├── uploaded_files/        # (Auto-créé) Fichiers uploadés
├── ocr_outputs/           # (Auto-créé) PDF générés, images annotées
├── requirements.txt       # Dépendances Python
├── Dockerfile             # Image Docker
├── docker-compose.yml     # Conteneurisation
└── README.md              # Ce fichier
```

## Langues OCR prises en charge

Assurez-vous que les modèles suivants sont bien installés dans l’image Docker (ils le sont par défaut dans le Dockerfile) :

- fra : Français
- eng : Anglais
- spa : Espagnol
- deu : Allemand
- ita : Italien

## Personnalisation

- Pour ajouter d'autres langues OCR : modifier le Dockerfile et ajouter le paquet tesseract-ocr-XXX correspondant.
- Pour personnaliser le thème : modifier les couleurs dans `styles.css`.
- La lecture vocale dépend du navigateur (Web Speech API).

## Debug

Deux fichiers sont générés automatiquement dans le dossier courant lors de l’OCR :
- `debug_original.png` : image originale
- `debug_processed.png` : image après prétraitement OpenCV
