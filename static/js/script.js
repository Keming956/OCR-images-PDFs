// script.js – OCR Vision avec OCR, thème sombre, raccourcis clavier, caméra, et synthèse vocale multilingue

document.addEventListener("DOMContentLoaded", () => {
    const $ = id => document.getElementById(id);

    const themeBtn = $("toggleThemeBtn");
    const currentYear = $("currentYear");
    const fileInput = $("fileInput");
    const selectFileBtn = $("selectFileBtn");
    const dropZone = $("dropZone");
    const fileInfo = $("fileInfo");
    const cameraFileInfo = $("cameraFileInfo");
    const processBtn = $("processBtn");
    const resetBtn = $("resetBtn");
    const languageSelect = $("language");
    const detectedLang = $("detectedLang");
    const resultContent = $("resultContent");
    const processing = $("processingIndicator");
    const additionalOutputs = $("additionalOutputs");
    const pdfLink = $("pdfLink");
    const boxedImgLink = $("boxedImgLink");
    const messageBox = $("messageBox");

    const manualInput = $("manualInput");
    const manualCopyBtn = $("manualCopyBtn");
    const manualReadBtn = $("manualReadBtn");
    const manualDownloadBtn = $("manualDownloadBtn");

    const copyBtn = $("copyBtn");
    const readBtn = $("readBtn");
    const downloadBtn = $("downloadBtn");

    let selectedFile = null;
    let capturedImageBlob = null;
    let stream = null;

    if (currentYear) currentYear.textContent = new Date().getFullYear();

    // Thème sombre
    const storedTheme = localStorage.getItem("ocr-theme");
    if (storedTheme === "dark") document.body.classList.add("dark");
    updateThemeIcon();

    themeBtn?.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        localStorage.setItem("ocr-theme", document.body.classList.contains("dark") ? "dark" : "light");
        updateThemeIcon();
    });

    function updateThemeIcon() {
        if (!themeBtn) return;
        const isDark = document.body.classList.contains("dark");
        themeBtn.innerHTML = `
          <i class="fas fa-${isDark ? "sun" : "moon"}"></i>
          <span id="themeLabel">${isDark ? "Clair" : "Sombre"}</span>
        `;
      }
      
      
    // Fichier import
    selectFileBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", e => handleFile(e.target.files[0]));

    dropZone.addEventListener("dragover", e => {
        e.preventDefault();
        dropZone.classList.add("active");
    });
    dropZone.addEventListener("dragleave", () => dropZone.classList.remove("active"));
    dropZone.addEventListener("drop", e => {
        e.preventDefault();
        dropZone.classList.remove("active");
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    function handleFile(file) {
        if (!file) return;
        selectedFile = file;
        capturedImageBlob = null;
        fileInfo.innerHTML = `<p><strong>Fichier :</strong> ${file.name} (${(file.size / 1024).toFixed(1)} KB)</p>`;
        cameraFileInfo.innerHTML = '<p>Aucune photo capturée</p>';
    }

    // OCR
    processBtn.addEventListener("click", lancerOCR);
    document.addEventListener("keydown", e => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") lancerOCR();
    });

    async function lancerOCR() {
        const formData = new FormData();
        const lang = languageSelect.value;
        const manualText = manualInput.value.trim();

        if (manualText) formData.append("manual_input", manualText);
        else if (capturedImageBlob) formData.append("file", capturedImageBlob, "photo.jpg");
        else if (selectedFile) formData.append("file", selectedFile);
        else return showMessage("Veuillez importer un fichier ou entrer un texte.", "error");

        formData.append("lang", lang);

        toggleLoading(true);

        try {
            const response = await fetch("/ocr", {
                method: "POST",
                headers: { "x-requested-with": "XMLHttpRequest" },
                body: formData
            });
            if (!response.ok) throw new Error("Erreur serveur");
            const data = await response.json();
            updateResult(data);
        } catch (e) {
            console.error(e);
            showMessage("Erreur OCR : " + e.message, "error");
        }

        toggleLoading(false);
    }

    function updateResult(data) {
        resultContent.innerText = data.text || "(Aucun texte reconnu)";
        detectedLang.textContent = data.detected_lang || "–";
        pdfLink.href = data.pdf_path || "#";
        boxedImgLink.href = data.boxed_image_path || "#";
        additionalOutputs.style.display = (data.pdf_path || data.boxed_image_path) ? "block" : "none";
    }

    function toggleLoading(state) {
        processing.style.display = state ? "flex" : "none";
        resultContent.style.display = state ? "none" : "block";
        additionalOutputs.style.display = "none";
    }

    // Lecture vocale intelligente en fonction de la langue détectée
    function speakText(text) {
        if (!text.trim()) return;

        const detected = detectedLang.textContent || languageSelect.value;
        const langCode = detected.split("-")[0]; // e.g. "fr" ou "en"
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = speechSynthesis.getVoices();

        // Recherche d'une voix compatible
        let chosenVoice = voices.find(v => v.lang.startsWith(langCode));
        
        // Si pas de voix trouvée, essaie en forçant la langue détectée
        if (chosenVoice) {
            utterance.voice = chosenVoice;
            utterance.lang = chosenVoice.lang;
        } else {
            utterance.lang = langCode;
        }

        utterance.rate = 1;
        speechSynthesis.speak(utterance);
    }

    window.speechSynthesis.onvoiceschanged = () => {
    // Force le chargement des voix (même sans interaction utilisateur)
    speechSynthesis.getVoices();
    };


    readBtn.addEventListener("click", () => speakText(resultContent.innerText));
    manualReadBtn.addEventListener("click", () => speakText(manualInput.value));

    // Copier / Télécharger
    copyBtn.addEventListener("click", () => handleCopy(resultContent.innerText, copyBtn));
    manualCopyBtn.addEventListener("click", () => handleCopy(manualInput.value, manualCopyBtn));

    downloadBtn.addEventListener("click", () => downloadText(resultContent.innerText, "ocr_result.txt"));
    manualDownloadBtn.addEventListener("click", () => downloadText(manualInput.value, "manual_text.txt"));

    function handleCopy(text, btn) {
        if (!text.trim()) return;
        navigator.clipboard.writeText(text);
        btn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => btn.innerHTML = '<i class="far fa-copy"></i>', 2000);
    }

    function downloadText(text, filename) {
        if (!text.trim()) return;
        const blob = new Blob([text], { type: "text/plain" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    // Réinitialisation complète
    resetBtn?.addEventListener("click", () => {
        fileInput.value = "";
        manualInput.value = "";
        selectedFile = null;
        capturedImageBlob = null;
        fileInfo.innerHTML = "<p>Aucun fichier sélectionné</p>";
        cameraFileInfo.innerHTML = "<p>Aucune photo capturée</p>";
        resultContent.innerHTML = `<p class="placeholder">Le texte extrait apparaîtra ici...</p>`;
        detectedLang.textContent = "–";
        additionalOutputs.style.display = "none";
    });

    // Caméra
    const openCameraBtn = $("openCameraBtn");
    const cameraModal = $("cameraModal");
    const cameraClose = $("cameraClose");
    const cameraVideo = $("cameraVideo");
    const cameraCanvas = $("cameraCanvas");
    const captureBtn = $("captureBtn");
    const retakeBtn = $("retakeBtn");
    const usePhotoBtn = $("usePhotoBtn");

    openCameraBtn.addEventListener("click", async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraVideo.srcObject = stream;
            cameraModal.style.display = "block";
        } catch {
            showMessage("Accès à la caméra refusé.", "error");
        }
    });

    cameraClose.addEventListener("click", closeCamera);

    captureBtn.addEventListener("click", () => {
        cameraCanvas.style.display = "block";
        cameraCanvas.width = cameraVideo.videoWidth;
        cameraCanvas.height = cameraVideo.videoHeight;
        cameraCanvas.getContext("2d").drawImage(cameraVideo, 0, 0);
        capturedImageBlob = dataURLToBlob(cameraCanvas.toDataURL("image/jpeg"));
        retakeBtn.style.display = "inline-block";
        usePhotoBtn.style.display = "inline-block";
        captureBtn.style.display = "none";
    });

    retakeBtn.addEventListener("click", () => {
        capturedImageBlob = null;
        cameraCanvas.style.display = "none";
        captureBtn.style.display = "inline-block";
        retakeBtn.style.display = "none";
        usePhotoBtn.style.display = "none";
    });

    usePhotoBtn.addEventListener("click", () => {
        selectedFile = null;
        fileInfo.innerHTML = "<p>Aucun fichier sélectionné</p>";
        cameraFileInfo.innerHTML = "<p>Photo prête à l’analyse</p>";
        closeCamera();
    });

    function closeCamera() {
        cameraModal.style.display = "none";
        if (stream) stream.getTracks().forEach(track => track.stop());
    }

    function dataURLToBlob(dataURL) {
        const [header, base64] = dataURL.split(",");
        const mime = header.match(/:(.*?);/)[1];
        const binary = atob(base64);
        const array = Uint8Array.from(binary, c => c.charCodeAt(0));
        return new Blob([array], { type: mime });
    }

    function showMessage(text, type = "success") {
        messageBox.textContent = text;
        messageBox.className = `message-box ${type}`;
        messageBox.style.display = "block";
        setTimeout(() => messageBox.style.display = "none", 4000);
    }
});