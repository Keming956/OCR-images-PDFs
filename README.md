## OCR Vision

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
│   ├── main.py              # Backend FastAPI : endpoints, gestion des requêtes
│   └── ocr.py               # Fonctions OCR : Tesseract, OpenCV, PDF, prétraitement
│
├── templates/
│   └── index.html           # Interface utilisateur (Jinja2 + HTML accessible)
│
├── static/
│   ├── css/
│   │   └── styles.css       # Style de l’interface : responsive, thème sombre, accessibilité
│   ├── js/
│   │   └── script.js        # Logique front : import, OCR, TTS, caméra, interactions
│   └── favicon.png          # Icône de l’application
│
├── uploaded_files/          # 📂 Auto-créé – Fichiers uploadés (images, PDF) pour analyse
├── ocr_outputs/             # 📂 Auto-créé – Fichiers résultats : PDF OCR, images annotées
│
├── requirements.txt         # Liste des dépendances Python (FastAPI, Tesseract, OpenCV, etc.)
├── Dockerfile               # Configuration de l’image Docker (OCR en local)
├── docker-compose.yml       # Orchestration des conteneurs (build + run serveur)
├── README.md                # Présentation du projet, instructions d’installation
└── cahier_des_charges.md    # Spécifications fonctionnelles et techniques détaillées
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
