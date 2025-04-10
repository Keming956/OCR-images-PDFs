document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // Elements principaux
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const fileInfo = document.getElementById('fileInfo');
    const cameraFileInfo = document.getElementById('cameraFileInfo');
    const processBtn = document.getElementById('processBtn');
    const languageSelect = document.getElementById('language');
    const detectedLang = document.getElementById('detectedLang');
    const resultContent = document.getElementById('resultContent');
    const processing = document.getElementById('processingIndicator');
    const messageBox = document.getElementById('messageBox');
    const additionalOutputs = document.getElementById('additionalOutputs');
    const pdfLink = document.getElementById('pdfLink');
    const boxedImgLink = document.getElementById('boxedImgLink');

    const manualInput = document.getElementById('manualInput');
    const manualCopyBtn = document.getElementById('manualCopyBtn');
    const manualReadBtn = document.getElementById('manualReadBtn');
    const manualDownloadBtn = document.getElementById('manualDownloadBtn');

    const copyBtn = document.getElementById('copyBtn');
    const readBtn = document.getElementById('readBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    let selectedFile = null;
    let capturedImageBlob = null;
    let stream = null;

    // ------ Fichier / Caméra ------
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

    // ------ Traitement OCR ------
    processBtn.addEventListener('click', async () => {
        const formData = new FormData();
        const lang = languageSelect.value;
        const manualText = manualInput.value.trim();

        if (manualText) {
            formData.append("manual_input", manualText);
        } else if (capturedImageBlob) {
            formData.append("file", capturedImageBlob, "camera.jpg");
        } else if (selectedFile) {
            formData.append("file", selectedFile);
        } else {
            showMessage("Veuillez importer une image, capturer une photo ou saisir du texte.", "error");
            return;
        }

        formData.append("lang", lang);
        processing.style.display = "flex";
        resultContent.style.display = "none";
        additionalOutputs.style.display = "none";

        try {
            const response = await fetch("/ocr", {
                method: "POST",
                headers: {
                    "x-requested-with": "XMLHttpRequest"
                },
                body: formData
            });

            if (!response.ok) throw new Error("Erreur serveur");

            const result = await response.json();

            resultContent.innerText = result.text || "(Aucun texte reconnu)";
            detectedLang.textContent = result.detected_lang || "–";

            if (result.pdf_path) {
                pdfLink.href = result.pdf_path;
                additionalOutputs.style.display = "block";
            }

            if (result.boxed_image_path) {
                boxedImgLink.href = result.boxed_image_path;
                additionalOutputs.style.display = "block";
            }

        } catch (error) {
            console.error(error);
            resultContent.innerText = "Erreur lors de l'extraction OCR.";
            showMessage("Une erreur est survenue lors de l’analyse OCR.", "error");
        }

        processing.style.display = "none";
        resultContent.style.display = "block";
    });

    // ------ Fonctions OCR Output ------
    copyBtn.addEventListener('click', () => handleCopy(resultContent.innerText, copyBtn));
    manualCopyBtn.addEventListener('click', () => handleCopy(manualInput.value, manualCopyBtn));

    function handleCopy(text, btn) {
        if (!text.trim()) return;
        navigator.clipboard.writeText(text);
        btn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => btn.innerHTML = '<i class="far fa-copy"></i>', 2000);
    }

    readBtn.addEventListener('click', () => speakText(resultContent.innerText));
    manualReadBtn.addEventListener('click', () => speakText(manualInput.value));

    function speakText(text) {
        if (!text.trim()) return;
        const lang = languageSelect.value;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        speechSynthesis.speak(utterance);
    }

    downloadBtn.addEventListener('click', () => downloadText(resultContent.innerText, "texte_ocr.txt"));
    manualDownloadBtn.addEventListener('click', () => downloadText(manualInput.value, "texte_manuel.txt"));

    function downloadText(text, filename) {
        if (!text.trim()) return;
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    // ------ Message System ------
    function showMessage(msg, type = "success") {
        messageBox.textContent = msg;
        messageBox.className = `message-box ${type}`;
        messageBox.style.display = "block";
        setTimeout(() => messageBox.style.display = "none", 4000);
    }

    // ------ Caméra ------
    const openCameraBtn = document.getElementById('openCameraBtn');
    const cameraModal = document.getElementById('cameraModal');
    const cameraClose = document.getElementById('cameraClose');
    const cameraVideo = document.getElementById('cameraVideo');
    const cameraCanvas = document.getElementById('cameraCanvas');
    const captureBtn = document.getElementById('captureBtn');
    const retakeBtn = document.getElementById('retakeBtn');
    const usePhotoBtn = document.getElementById('usePhotoBtn');

    openCameraBtn.addEventListener('click', async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraVideo.srcObject = stream;
            cameraModal.style.display = "block";
        } catch {
            showMessage("Accès à la caméra refusé ou indisponible.", "error");
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