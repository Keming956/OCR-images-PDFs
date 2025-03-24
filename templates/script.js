// Éléments du DOM
const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const fileInput = document.getElementById('fileInput');
const dropArea = document.getElementById('dropArea');
const selectFileBtn = document.getElementById('selectFileBtn');
const takePhotoBtn = document.getElementById('takePhotoBtn');
const photoCanvas = document.getElementById('photoCanvas');
const webcam = document.getElementById('webcam');
const captureWebcamBtn = document.getElementById('captureWebcamBtn');
const webcamCanvas = document.getElementById('webcamCanvas');
const textResult = document.getElementById('textResult');
const processTextBtn = document.getElementById('processTextBtn');
const readBtn = document.getElementById('readBtn');
const copyBtn = document.getElementById('copyBtn');

// Variables globales
let stream = null;

// Gestion des onglets
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
        
        // Arrêter la webcam si on quitte l'onglet webcam
        if (tab.dataset.tab !== 'webcam' && stream) {
            stopWebcam();
        }
        
        // Démarrer la webcam si on arrive sur l'onglet webcam
        if (tab.dataset.tab === 'webcam' && !stream) {
            startWebcam();
        }
    });
});

// Gestion des fichiers
selectFileBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
        processImage(e.target.files[0]);
    }
});

// Glisser-déposer
dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.style.background = 'rgba(74, 111, 165, 0.1)';
});

dropArea.addEventListener('dragleave', () => {
    dropArea.style.background = '';
});

dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.style.background = '';
    
    if (e.dataTransfer.files.length) {
        processImage(e.dataTransfer.files[0]);
    }
});

// Caméra photo
takePhotoBtn.addEventListener('click', () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' }, 
            audio: false 
        }).then(mediaStream => {
            const video = document.createElement('video');
            video.srcObject = mediaStream;
            video.onloadedmetadata = () => {
                video.play();
                
                // Créer un canvas pour capturer la photo
                photoCanvas.width = video.videoWidth;
                photoCanvas.height = video.videoHeight;
                const ctx = photoCanvas.getContext('2d');
                ctx.drawImage(video, 0, 0, photoCanvas.width, photoCanvas.height);
                
                // Arrêter le flux et traiter l'image
                mediaStream.getTracks().forEach(track => track.stop());
                photoCanvas.toBlob(blob => {
                    processImage(blob);
                }, 'image/jpeg');
            };
        }).catch(error => {
            console.error("Erreur de la caméra:", error);
            alert("Impossible d'accéder à la caméra");
        });
    } else {
        alert("Votre navigateur ne supporte pas l'accès à la caméra");
    }
});

// Webcam
function startWebcam() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: false 
        }).then(mediaStream => {
            stream = mediaStream;
            webcam.srcObject = mediaStream;
        }).catch(error => {
            console.error("Erreur de la webcam:", error);
            alert("Impossible d'accéder à la webcam");
        });
    } else {
        alert("Votre navigateur ne supporte pas l'accès à la webcam");
    }
}

function stopWebcam() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
        webcam.srcObject = null;
    }
}

captureWebcamBtn.addEventListener('click', () => {
    if (!stream) return;
    
    webcamCanvas.width = webcam.videoWidth;
    webcamCanvas.height = webcam.videoHeight;
    const ctx = webcamCanvas.getContext('2d');
    ctx.drawImage(webcam, 0, 0, webcamCanvas.width, webcamCanvas.height);
    
    webcamCanvas.toBlob(blob => {
        processImage(blob);
    }, 'image/jpeg');
});

// Traitement OCR
async function processImage(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('http://localhost:8000/ocr/image', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(await response.text());
        }
        
        const data = await response.json();
        textResult.value = data.text;
    } catch (error) {
        console.error("Erreur OCR:", error);
        alert("Erreur lors du traitement OCR");
    }
}

// Traitement avec Mistral
processTextBtn.addEventListener('click', async () => {
    if (!textResult.value.trim()) return;
    
    try {
        const response = await fetch('http://localhost:8000/process/text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: textResult.value })
        });
        
        if (!response.ok) {
            throw new Error(await response.text());
        }
        
        const data = await response.json();
        textResult.value = data.processed_text;
    } catch (error) {
        console.error("Erreur Mistral:", error);
        alert("Erreur lors du traitement avec Mistral");
    }
});

// Synthèse vocale
readBtn.addEventListener('click', () => {
    if (!textResult.value.trim()) return;
    
    const utterance = new SpeechSynthesisUtterance(textResult.value);
    utterance.lang = 'fr-FR';
    speechSynthesis.speak(utterance);
});

// Copier le texte
copyBtn.addEventListener('click', () => {
    if (!textResult.value.trim()) return;
    
    textResult.select();
    document.execCommand('copy');
    
    // Feedback visuel
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copié !';
    setTimeout(() => {
        copyBtn.textContent = originalText;
    }, 2000);
});

// Démarrer la webcam si l'onglet est actif au chargement
document.addEventListener('DOMContentLoaded', () => {
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab && activeTab.dataset.tab === 'webcam') {
        startWebcam();
    }
});