# Cahier des charges – Application Web OCR Vision

## 1. Activité de l’organisation
Développement de solutions numériques pour la lecture, transcription et valorisation de documents visuels, dans le cadre de projets pédagogiques, de recherche et d’innovation technologique autour du TAL, de l’accessibilité numérique et de l’extraction d’informations multimodales.

## 2. Objectif du projet
Créer une application web intuitive permettant à tout utilisateur :
- d’importer une image ou un PDF contenant du texte ;
- de capturer une photo via la caméra de son appareil ;
- de saisir du texte manuellement ;
- d’obtenir une transcription OCR du texte détecté ;
- d’écouter ce texte lu à voix haute via synthèse vocale multilingue ;
- de télécharger le résultat en `.txt` ou en PDF OCR consultable.

## 3. Besoins fonctionnels

### Entrée des données
- Import d’images : `.jpg`, `.jpeg`, `.png`, `.bmp`, `.tiff` et PDF
- Capture d’image via webcam
- Saisie manuelle de texte

### Traitement OCR
- Prétraitement intelligent via OpenCV
- OCR via Tesseract
- Choix manuel de la langue (fr, en, es, de, it)
- Détection automatique de la langue reconnue
- Génération d’un PDF OCR consultable
- Image annotée avec boîtes de texte

### Synthèse vocale et interaction
- Lecture à voix haute selon langue détectée
- Copier, lire, télécharger le texte
- Raccourci clavier (Ctrl + Entrée)
- Mode sombre / clair
- Réinitialisation de l’interface

## 4. Besoins techniques
- **Backend** : FastAPI, Python, `pytesseract`, `opencv-python`, `pdf2image`, `langdetect`
- **Frontend** : HTML, CSS, JavaScript natif, Web Speech API
- **Conteneurisation** : Docker / Docker Compose
- Fichiers temporaires dans `uploaded_files/` et `ocr_outputs/`
- Pas de dépendance cloud
- Déploiement local ou serveur

## 5. Public visé
L’outil vise des profils variés :

- Étudiants, enseignants, formateurs souhaitant extraire ou écouter des textes depuis des documents imprimés ou scannés

- Chercheurs travaillant sur la conversion de documents pour analyse ou valorisation

- Personnes dyslexiques ou malvoyantes ayant besoin de transformer un support visuel en texte vocalisé

Professionnels de la documentation / bibliothécaires en contexte multilingue

Publics multilingues ayant besoin de passer de l’image au texte + lecture

## 6. Concurrence et différenciation

Google Lens / Google Translate proposent des fonctions similaires d’extraction et de lecture, mais nécessitent une connexion cloud, ne permettent pas une utilisation en local, et ne supportent pas toutes les langues (ex. certaines langues africaines ou asiatiques peu dotées).

Mistral, ChatGPT et d'autres LLMs peuvent être utilisés pour faire de l’OCR via analyse d’images, mais :

leur usage passe par des API cloud payantes (aucune version locale fiable pour l’OCR),

ils ne proposent pas de synthèse vocale intégrée (les textes extraits ne peuvent pas être lus directement dans l’application).

Les alternatives open source (OCRmyPDF, Calamari OCR, Kraken, etc.) sont puissantes mais complexes à déployer, nécessitent souvent des compétences avancées en ligne de commande ou n'ont pas d'interface graphique intuitive.

OCR Vision : **local, simple, ergonomique, open source**

## 7. Contraintes et recommandations
- Fonctionnement hors-ligne
- Respect du RGPD
- Code modulaire
- Interface responsive

## 8. Identité graphique
- Icônes claires, labels explicites
- Mode sombre
- Couleurs accessibles
- Favicon et design personnalisables