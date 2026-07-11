document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewOverlay = document.getElementById('preview-overlay');
    const imagePreview = document.getElementById('image-preview');
    const removeBtn = document.getElementById('remove-btn');
    const submitBtn = document.getElementById('submit-btn');
    const uploadForm = document.getElementById('upload-form');
    
    // State Elements
    const reportIdle = document.getElementById('report-idle');
    const reportLoading = document.getElementById('report-loading');
    const reportError = document.getElementById('report-error');
    const reportResult = document.getElementById('report-result');
    const loaderStatus = document.getElementById('loader-status');
    const errorMessage = document.getElementById('error-message');
    const errorTitle = document.getElementById('error-title');
    const markdownOutput = document.getElementById('markdown-output');
    
    // Action Buttons
    const copyBtn = document.getElementById('copy-btn');
    const printBtn = document.getElementById('print-btn');
    const retryBtn = document.getElementById('retry-btn');
    
    let activeFile = null;
    let loadingInterval = null;
    let activeAnalysisText = "";

    // -------------------------------------------------------------
    // Drag and Drop & File Preview Logic
    // -------------------------------------------------------------

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Highlight drop zone on drag over
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('drag-active');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('drag-active');
        }, false);
    });

    // Handle dropped files
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // Handle browse click
    dropZone.addEventListener('click', (e) => {
        // If clicking remove button or preview, don't trigger file select
        if (e.target.closest('#remove-btn') || e.target.closest('#preview-overlay')) {
            return;
        }
        fileInput.click();
    });

    // Handle file input change
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            handleFile(fileInput.files[0]);
        }
    });

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            showInlineError("Invalid File Type", "Please select a valid image file (PNG, JPG, or JPEG).");
            return;
        }

        activeFile = file;
        submitBtn.disabled = false;
        
        // Show Image Preview
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            previewOverlay.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    // Remove selected image
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetUploadState();
    });

    function resetUploadState() {
        activeFile = null;
        fileInput.value = '';
        imagePreview.src = '#';
        previewOverlay.classList.add('hidden');
        submitBtn.disabled = true;
    }

    // Show errors inside the upload panel or side panel
    function showInlineError(title, msg) {
        setReportState('error');
        errorTitle.textContent = title;
        errorMessage.textContent = msg;
    }

    // -------------------------------------------------------------
    // State Swapping Utilities
    // -------------------------------------------------------------
    function setReportState(state) {
        // Hide all states first
        reportIdle.classList.add('hidden');
        reportLoading.classList.add('hidden');
        reportError.classList.add('hidden');
        reportResult.classList.add('hidden');
        
        // Hide action controls
        copyBtn.classList.add('hidden');
        printBtn.classList.add('hidden');

        // Clear loading status cycler
        if (loadingInterval) {
            clearInterval(loadingInterval);
            loadingInterval = null;
        }

        // Show matching state
        if (state === 'idle') {
            reportIdle.classList.remove('hidden');
        } else if (state === 'loading') {
            reportLoading.classList.remove('hidden');
        } else if (state === 'error') {
            reportError.classList.remove('hidden');
        } else if (state === 'result') {
            reportResult.classList.remove('hidden');
            copyBtn.classList.remove('hidden');
            printBtn.classList.remove('hidden');
        }
    }

    // -------------------------------------------------------------
    // Asynchronous Submission & Analysis
    // -------------------------------------------------------------
    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!activeFile) return;

        // Set state to loading
        setReportState('loading');
        
        // Start status message transitions
        const loadingMessages = [
            "Uploading medical image...",
            "Decrypting image metadata...",
            "Analyzing shapes, color patterns, and features...",
            "Processing text elements and chemical labels...",
            "Querying LLM diagnostic layers...",
            "Running double-check clinical validation...",
            "Structuring diagnosis report..."
        ];
        
        let msgIndex = 0;
        loaderStatus.textContent = loadingMessages[0];
        
        loadingInterval = setInterval(() => {
            msgIndex = (msgIndex + 1) % loadingMessages.length;
            loaderStatus.textContent = loadingMessages[msgIndex];
        }, 2200);

        // Prepare form data
        const formData = new FormData();
        formData.append('file', activeFile);

        // Execute asynchronous POST request
        fetch('/analyze', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok || response.status === 422 || response.status === 400 || response.status === 500) {
                return response.json();
            }
            throw new Error("Network response error.");
        })
        .then(data => {
            if (data.success) {
                activeAnalysisText = data.analysis;
                
                // Configure Marked.js to parse safely
                marked.setOptions({
                    headerIds: false,
                    mangle: false,
                    breaks: true
                });
                
                markdownOutput.innerHTML = marked.parse(data.analysis);
                setReportState('result');
            } else {
                // Determine if it was context validation failure or engine error
                const title = data.is_medical === false ? "Non-Medical File Detected" : "Analysis Attempt Failed";
                showInlineError(title, data.error || "An unknown error occurred during validation.");
            }
        })
        .catch(err => {
            console.error("Fetch Error:", err);
            showInlineError("Network/Server Failure", "Could not establish connection to the backend recognition service. Ensure Flask is running.");
        });
    });

    // -------------------------------------------------------------
    // Action Controls
    // -------------------------------------------------------------

    // Copy to clipboard
    copyBtn.addEventListener('click', () => {
        if (!activeAnalysisText) return;
        
        navigator.clipboard.writeText(activeAnalysisText)
            .then(() => {
                const prevIcon = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fa-solid fa-check" style="color: #10b981;"></i>';
                copyBtn.style.borderColor = '#10b981';
                
                setTimeout(() => {
                    copyBtn.innerHTML = prevIcon;
                    copyBtn.style.borderColor = '';
                }, 2000);
            })
            .catch(err => {
                console.error("Failed to copy:", err);
            });
    });

    // Print analysis report
    printBtn.addEventListener('click', () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>AuraMed Clinical Analysis Report</title>
                    <style>
                        body {
                            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
                            line-height: 1.6;
                            color: #1f2937;
                            padding: 40px;
                            max-width: 800px;
                            margin: 0 auto;
                        }
                        h1 { font-family: 'Outfit', sans-serif; border-bottom: 2px solid #0284c7; padding-bottom: 10px; color: #0284c7; }
                        h2, h3 { color: #0f172a; margin-top: 25px; }
                        pre, code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
                        blockquote { border-left: 4px solid #94a3b8; padding-left: 15px; color: #475569; margin: 20px 0; font-style: italic; }
                        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
                        th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
                        th { background-color: #f8fafc; }
                        .footer { margin-top: 50px; font-size: 0.85em; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; }
                    </style>
                </head>
                <body>
                    <h1>AuraMed Diagnostics Report</h1>
                    <div>${markdownOutput.innerHTML}</div>
                    <div class="footer">
                        <p>Generated by AuraMed Medicine Recognition System (Gemini-1.5 AI Core).</p>
                        <p>Disclaimer: This automated diagnostic report is for clinical informational purposes only. Do not treat or modify prescriptions without expert healthcare consultations.</p>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    });

    // Retry state
    retryBtn.addEventListener('click', () => {
        resetUploadState();
        setReportState('idle');
    });
});
