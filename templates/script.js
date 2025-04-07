document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // DOM elements
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const fileInfo = document.getElementById('fileInfo');
    const processBtn = document.getElementById('processBtn');
    const resultContent = document.getElementById('resultContent');
    const copyBtn = document.getElementById('copyBtn');
    const readBtn = document.getElementById('readBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const processingIndicator = document.getElementById('processingIndicator');
    const cameraBtn = document.getElementById('cameraBtn');
    const cameraModal = document.getElementById('cameraModal');
    const cameraClose = document.getElementById('cameraClose');
    const cameraVideo = document.getElementById('cameraVideo');
    const captureBtn = document.getElementById('captureBtn');
    const cameraCanvas = document.getElementById('cameraCanvas');
    const retakeBtn = document.getElementById('retakeBtn');
    const usePhotoBtn = document.getElementById('usePhotoBtn');
    
    let selectedFile = null;
    let stream = null;
    let capturedImage = null;

    // Event listeners
    selectFileBtn.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', handleFileSelect);
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('active');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('active');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('active');
        
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelect({ target: fileInput });
        }
    });
    
    processBtn.addEventListener('click', processFile);
    copyBtn.addEventListener('click', copyText);
    readBtn.addEventListener('click', readText);
    downloadBtn.addEventListener('click', downloadText);
    
    // Camera functionality
    cameraBtn.addEventListener('click', openCamera);
    cameraClose.addEventListener('click', closeCamera);
    captureBtn.addEventListener('click', captureImage);
    retakeBtn.addEventListener('click', retakePhoto);
    usePhotoBtn.addEventListener('click', usePhoto);

    // Functions
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        selectedFile = file;
        fileInfo.innerHTML = `<p><strong>Fichier sélectionné :</strong> ${file.name} (${formatFileSize(file.size)})</p>`;
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    async function processFile() {
        if (!selectedFile) {
            alert('Veuillez sélectionner un fichier d'abord');
            return;
        }
        
        // Show processing indicator
        resultContent.style.display = 'none';
        processingIndicator.style.display = 'flex';
        
        try {
            // Simulate API call to Mistral AI (replace with actual API call)
            const extractedText = await simulateMistralAIProcessing(selectedFile);
            
            // Display the result
            resultContent.innerHTML = extractedText;
            resultContent.style.display = 'block';
            processingIndicator.style.display = 'none';
        } catch (error) {
            console.error('Error processing file:', error);
            resultContent.innerHTML = `<p class="error">Une erreur s'est produite lors du traitement du fichier.</p>`;
            resultContent.style.display = 'block';
            processingIndicator.style.display = 'none';
        }
    }
    
    // Simulation function - replace with actual API call
    function simulateMistralAIProcessing(file) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockText = `Texte extrait de ${file.name}:\n\n` +
                    `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, ` +
                    `nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, ` +
                    `nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.\n\n` +
                    `Mistral AI a détecté que ce texte est en français avec une confiance de 98%. ` +
                    `Le document contient 3 paragraphes et 78 mots au total.`;
                resolve(mockText);
            }, 3000);
        });
    }
    
    function copyText() {
        if (!resultContent.textContent || resultContent.textContent.includes('Le texte extrait apparaîtra ici')) {
            alert('Aucun texte à copier');
            return;
        }
        
        navigator.clipboard.writeText(resultContent.textContent)
            .then(() => {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Erreur lors de la copie:', err);
            });
    }
    
    function readText() {
        if (!resultContent.textContent || resultContent.textContent.includes('Le texte extrait apparaîtra ici')) {
            alert('Aucun texte à lire');
            return;
        }
        
        const language = document.getElementById('language').value;
        const utterance = new SpeechSynthesisUtterance(resultContent.textContent);
        utterance.lang = language;
        window.speechSynthesis.speak(utterance);
    }
    
    function downloadText() {
        if (!resultContent.textContent || resultContent.textContent.includes('Le texte extrait apparaîtra ici')) {
            alert('Aucun texte à télécharger');
            return;
        }
        
        const blob = new Blob([resultContent.textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'texte_extrait.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Camera functions
    async function openCamera() {
        cameraModal.style.display = 'block';
        
        try {
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false 
            });
            cameraVideo.srcObject = stream;
            cameraVideo.play();
            
            // Show capture button and hide other camera buttons
            captureBtn.style.display = 'block';
            retakeBtn.style.display = 'none';
            usePhotoBtn.style.display = 'none';
            cameraCanvas.style.display = 'none';
        } catch (err) {
            console.error("Erreur d'accès à la caméra:", err);
            alert("Impossible d'accéder à la caméra. Veuillez vérifier les permissions.");
            closeCamera();
        }
    }
    
    function closeCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        cameraModal.style.display = 'none';
    }
    
    function captureImage() {
        // Set canvas dimensions to match video stream
        const videoWidth = cameraVideo.videoWidth;
        const videoHeight = cameraVideo.videoHeight;
        cameraCanvas.width = videoWidth;
        cameraCanvas.height = videoHeight;
        
        // Draw current video frame to canvas
        const ctx = cameraCanvas.getContext('2d');
        ctx.drawImage(cameraVideo, 0, 0, videoWidth, videoHeight);
        
        // Stop the video stream
        stream.getTracks().forEach(track => track.stop());
        stream = null;
        
        // Show the captured image and controls
        cameraCanvas.style.display = 'block';
        cameraVideo.style.display = 'none';
        captureBtn.style.display = 'none';
        retakeBtn.style.display = 'block';
        usePhotoBtn.style.display = 'block';
    }
    
    function retakePhoto() {
        // Reset camera view
        cameraCanvas.style.display = 'none';
        cameraVideo.style.display = 'block';
        openCamera();
    }
    
    function usePhoto() {
        // Convert canvas to blob and create a File object
        cameraCanvas.toBlob((blob) => {
            capturedImage = new File([blob], 'photo_capture.jpg', { type: 'image/jpeg' });
            
            // Set as selected file
            selectedFile = capturedImage;
            fileInfo.innerHTML = `<p><strong>Fichier sélectionné :</strong> photo_capture.jpg</p>`;
            
            // Close camera modal
            closeCamera();
        }, 'image/jpeg', 0.9);
    }
});