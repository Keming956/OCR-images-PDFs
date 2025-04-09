document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // DOM elements
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const fileInfo = document.getElementById('fileInfo');
    const cameraFileInfo = document.getElementById('cameraFileInfo');
    const processBtn = document.getElementById('processBtn');
    const resultContent = document.getElementById('resultContent');
    const processing = document.getElementById('processingIndicator');
    const copyBtn = document.getElementById('copyBtn');
    const readBtn = document.getElementById('readBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    const manualInput = document.getElementById('manualInput');
    const manualCopyBtn = document.getElementById('manualCopyBtn');
    const manualReadBtn = document.getElementById('manualReadBtn');
    const manualDownloadBtn = document.getElementById('manualDownloadBtn');

    const openCameraBtn = document.getElementById('openCameraBtn');
    const cameraModal = document.getElementById('cameraModal');
    const cameraClose = document.getElementById('cameraClose');
    const cameraVideo = document.getElementById('cameraVideo');
    const cameraCanvas = document.getElementById('cameraCanvas');
    const captureBtn = document.getElementById('captureBtn');
    const retakeBtn = document.getElementById('retakeBtn');
    const usePhotoBtn = document.getElementById('usePhotoBtn');

    let selectedFile = null;
    let capturedImageBlob = null;
    let stream = null;

    // ----- Upload fichier -----
    selectFileBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', handleFileSelect);

    dropZone.addEventListener('dragover', e => {
        e.preventDefault();
        dropZone.classList.add('active');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('active');
    });

    dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('active');
        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelect({ target: fileInput });
        }
    });

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        selectedFile = file;
        capturedImageBlob = null;
        fileInfo.innerHTML = `<p><strong>Fichier :</strong> ${file.name} (${(file.size / 1024).toFixed(1)} KB)</p>`;
        cameraFileInfo.innerHTML = '<p>Aucune photo capturée</p>';
    }

    // ----- Lancer l'OCR -----
    processBtn.addEventListener('click', async () => {
        const formData = new FormData();
        const lang = document.getElementById('language').value;
        const manualText = manualInput.value.trim();

        if (manualText) {
            formData.append("manual_input", manualText);
        } else if (capturedImageBlob) {
            formData.append("file", capturedImageBlob, "camera.jpg");
        } else if (selectedFile) {
            formData.append("file", selectedFile);
        } else {
            alert('Veuillez importer une image, capturer une photo ou saisir du texte.');
            return;
        }

        formData.append("lang", lang);

        resultContent.style.display = "none";
        processing.style.display = "flex";

        try {
            const response = await fetch("/ocr", {
                method: "POST",
                headers: {
                    "x-requested-with": "XMLHttpRequest"
                },
                body: formData
            });

            const result = await response.json();
            resultContent.innerText = result.text;
        } catch (error) {
            console.error(error);
            resultContent.innerText = "Erreur lors de l'extraction OCR.";
        }

        processing.style.display = "none";
        resultContent.style.display = "block";
    });

    // ----- OCR Buttons -----
    copyBtn.addEventListener('click', () => {
        const text = resultContent.innerText;
        if (!text.trim()) return;
        navigator.clipboard.writeText(text);
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            copyBtn.innerHTML = '<i class="far fa-copy"></i>';
        }, 2000);
    });

    readBtn.addEventListener('click', () => {
        const text = resultContent.innerText;
        if (!text.trim()) return;
        const lang = document.getElementById('language').value;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        speechSynthesis.speak(utterance);
    });

    downloadBtn.addEventListener('click', () => {
        const text = resultContent.innerText;
        if (!text.trim()) return;
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "texte_ocr.txt";
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });

    // ----- Manuel Buttons -----
    manualCopyBtn.addEventListener('click', () => {
        const text = manualInput.value;
        if (!text.trim()) return;
        navigator.clipboard.writeText(text);
        manualCopyBtn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            manualCopyBtn.innerHTML = '<i class="far fa-copy"></i>';
        }, 2000);
    });

    manualReadBtn.addEventListener('click', () => {
        const text = manualInput.value;
        if (!text.trim()) return;
        const lang = document.getElementById('language').value;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        speechSynthesis.speak(utterance);
    });

    manualDownloadBtn.addEventListener('click', () => {
        const text = manualInput.value;
        if (!text.trim()) return;
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "texte_manuel.txt";
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });

    // ----- Caméra -----
    openCameraBtn.addEventListener('click', async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraVideo.srcObject = stream;
            cameraModal.style.display = "block";
        } catch (err) {
            alert("Accès à la caméra refusé ou non disponible.");
        }
    });

    cameraClose.addEventListener('click', () => {
        cameraModal.style.display = "none";
        if (stream) stream.getTracks().forEach(track => track.stop());
    });

    captureBtn.addEventListener('click', () => {
        cameraCanvas.style.display = "block";
        cameraCanvas.width = cameraVideo.videoWidth;
        cameraCanvas.height = cameraVideo.videoHeight;
        cameraCanvas.getContext("2d").drawImage(cameraVideo, 0, 0);
        capturedImageBlob = dataURLToBlob(cameraCanvas.toDataURL("image/jpeg"));
        retakeBtn.style.display = "inline-block";
        usePhotoBtn.style.display = "inline-block";
        captureBtn.style.display = "none";
    });

    retakeBtn.addEventListener('click', () => {
        cameraCanvas.style.display = "none";
        capturedImageBlob = null;
        retakeBtn.style.display = "none";
        usePhotoBtn.style.display = "none";
        captureBtn.style.display = "inline-block";
    });

    usePhotoBtn.addEventListener('click', () => {
        selectedFile = null;
        fileInfo.innerHTML = '<p>Aucun fichier sélectionné</p>';
        cameraFileInfo.innerHTML = "<p>Photo capturée prête à être traitée</p>";
        cameraModal.style.display = "none";
        if (stream) stream.getTracks().forEach(track => track.stop());
    });

    function dataURLToBlob(dataURL) {
        const [header, base64] = dataURL.split(',');
        const mime = header.match(/:(.*?);/)[1];
        const binary = atob(base64);
        const array = Uint8Array.from(binary, char => char.charCodeAt(0));
        return new Blob([array], { type: mime });
    }
});