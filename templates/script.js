// Initialisation des éléments du DOM
const fileInput = document.getElementById('fileInput');
const selectFileBtn = document.getElementById('selectFileBtn');
const dropArea = document.getElementById('dropArea');
const processBtn = document.getElementById('processBtn');
const statusEl = document.getElementById('status');
const errorEl = document.getElementById('error');
const resultSection = document.getElementById('resultSection');
const textResult = document.getElementById('textResult');
const readBtn = document.getElementById('readBtn');
const stopBtn = document.getElementById('stopBtn');
const copyBtn = document.getElementById('copyBtn');
const voiceSelect = document.getElementById('voiceSelect');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');

// Variables globales
let selectedFile = null;
let speechSynthesis = window.speechSynthesis;
let speechUtterance = null;

// Initialisation de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

// Événements
selectFileBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
        handleFileSelection(e.target.files[0]);
    }
});

// Glisser-déposer
dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('active');
});

['dragleave', 'dragend'].forEach(type => {
    dropArea.addEventListener(type, () => {
        dropArea.classList.remove('active');
    });
});

dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('active');
    
    if (e.dataTransfer.files.length) {
        handleFileSelection(e.dataTransfer.files[0]);
    }
});

processBtn.addEventListener('click', processFile);
readBtn.addEventListener('click', readText);
stopBtn.addEventListener('click', stopReading);
copyBtn.addEventListener('click', copyText);

// Charger les voix disponibles
speechSynthesis.onvoiceschanged = loadVoices;
loadVoices(); // Au cas où elles sont déjà chargées

// Fonctions
function handleFileSelection(file) {
    // Vérifier le type de fichier
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'application/pdf'];
    
    if (!validTypes.includes(file.type)) {
        showError('Type de fichier non supporté. Veuillez choisir une image ou un PDF.');
        return;
    }
    
    selectedFile = file;
    processBtn.disabled = false;
    statusEl.textContent = `Fichier sélectionné: ${file.name}`;
    errorEl.textContent = '';
}

async function processFile() {
    if (!selectedFile) return;
    
    try {
        processBtn.disabled = true;
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';
        statusEl.textContent = 'Traitement en cours...';
        errorEl.textContent = '';
        
        let text = '';
        
        if (selectedFile.type === 'application/pdf') {
            text = await extractTextFromPDF(selectedFile);
        } else {
            text = await extractTextFromImage(selectedFile);
        }
        
        textResult.value = text;
        resultSection.style.display = 'block';
        statusEl.textContent = 'Extraction terminée !';
        progressBar.style.width = '100%';
        
        // Faire défiler jusqu'au résultat
        resultSection.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
        showError(`Erreur lors du traitement: ${err.message}`);
        processBtn.disabled = false;
        progressContainer.style.display = 'none';
    }
}

async function extractTextFromImage(file) {
    return new Promise((resolve, reject) => {
        Tesseract.recognize(
            file,
            'fra', // Langue française
            {
                logger: progress => {
                    if (progress.status === 'recognizing text') {
                        const percent = Math.round(progress.progress * 100);
                        progressBar.style.width = `${percent}%`;
                        statusEl.textContent = `Reconnaissance du texte... ${percent}%`;
                    }
                }
            }
        ).then(({ data: { text } }) => {
            resolve(text);
        }).catch(err => {
            reject(err);
        });
    });
}

async function extractTextFromPDF(file) {
    try {
        const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
        let text = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map(item => item.str);
            text += strings.join(' ') + '\n\n';
            
            // Mettre à jour la progression
            const percent = Math.round((i / pdf.numPages) * 100);
            progressBar.style.width = `${percent}%`;
            statusEl.textContent = `Extraction du PDF... ${percent}%`;
        }
        
        return text;
    } catch (err) {
        throw new Error('Erreur lors de la lecture du PDF');
    }
}

function loadVoices() {
    const voices = speechSynthesis.getVoices();
    voiceSelect.innerHTML = '';
    
    // Filtrer les voix en français
    const frenchVoices = voices.filter(voice => 
        voice.lang.includes('fr') || voice.lang.includes('FR') || voice.lang.includes('fra')
    );
    
    if (frenchVoices.length > 0) {
        frenchVoices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            voiceSelect.appendChild(option);
        });
    } else {
        // Si aucune voix française, utiliser toutes les voix disponibles
        voices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            voiceSelect.appendChild(option);
        });
    }
}

function readText() {
    if (!textResult.value) return;
    
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
    
    const selectedVoiceName = voiceSelect.value;
    const voices = speechSynthesis.getVoices();
    const selectedVoice = voices.find(voice => voice.name === selectedVoiceName) || null;
    
    speechUtterance = new SpeechSynthesisUtterance(textResult.value);
    speechUtterance.voice = selectedVoice;
    speechUtterance.rate = 1;
    speechUtterance.pitch = 1;
    speechUtterance.lang = selectedVoice ? selectedVoice.lang : 'fr-FR';
    
    speechSynthesis.speak(speechUtterance);
    
    readBtn.disabled = true;
    stopBtn.disabled = false;
    
    speechUtterance.onend = () => {
        readBtn.disabled = false;
        stopBtn.disabled = true;
    };
}

function stopReading() {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        readBtn.disabled = false;
        stopBtn.disabled = true;
    }
}

function copyText() {
    if (!textResult.value) return;
    
    textResult.select();
    document.execCommand('copy');
    
    // Feedback visuel
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copié !';
    
    setTimeout(() => {
        copyBtn.textContent = originalText;
    }, 2000);
}

function showError(message) {
    errorEl.textContent = message;
}