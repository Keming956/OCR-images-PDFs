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
    
    let selectedFile = null;

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
            // In a real implementation, you would send the file to your backend
            // which would then call the Mistral AI API
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
            // Simulate API delay
            setTimeout(() => {
                // This is a mock response - in reality you would get this from Mistral AI
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
        const utterance = new SpeechSynthesis