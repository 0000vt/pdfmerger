const { PDFDocument } = PDFLib;

let inputFiles = [];
const dropZone = document.getElementById('drop-zone');
const pdfFileInput = document.createElement('input');
pdfFileInput.type = 'file';
pdfFileInput.accept = '.pdf';
pdfFileInput.multiple = true;

// Click event to open file dialog
dropZone.addEventListener('click', () => {
    pdfFileInput.click();
});

// Drag and drop events
dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    dropZone.style.backgroundColor = '#f0f0f0';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.backgroundColor = '';
});

dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.style.backgroundColor = '';

    const newFiles = Array.from(event.dataTransfer.files).filter(
        (file) => file.type === 'application/pdf'
    );

    if (newFiles.length > 0) {
        inputFiles = [...inputFiles, ...newFiles];
        updateFileList();
    } else {
        alert('Please drop PDF files.');
    }
});

pdfFileInput.addEventListener('change', (event) => {
    const newFiles = Array.from(event.target.files).filter(
        (file) => file.type === 'application/pdf'
    );
    inputFiles = [...inputFiles, ...newFiles];
    updateFileList();
});


function updateFileList() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';

    inputFiles.forEach((inputFile, index) => {
        const listItem = document.createElement('li');

        const moveUpButton = document.createElement('button');
        moveUpButton.className = 'move-up';
        moveUpButton.disabled = index === 0;
        moveUpButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
        moveUpButton.onclick = () => {
            [inputFiles[index - 1], inputFiles[index]] = [inputFiles[index], inputFiles[index - 1]];
            updateFileList();
        };
        listItem.appendChild(moveUpButton);

        const moveDownButton = document.createElement('button');
        moveDownButton.className = 'move-down';
        moveDownButton.disabled = index === inputFiles.length - 1;
        moveDownButton.innerHTML = '<i class="fas fa-arrow-down"></i>';
        moveDownButton.onclick = () => {
            [inputFiles[index + 1], inputFiles[index]] = [inputFiles[index], inputFiles[index + 1]];
            updateFileList();
        };
        listItem.appendChild(moveDownButton);

        const fileNameSpan = document.createElement('span');
        fileNameSpan.textContent = inputFile.name;
        listItem.appendChild(fileNameSpan);

        fileList.appendChild(listItem);
    });
}

// document.getElementById('inputPdfs').addEventListener('change', (event) => {
    // const newFiles = Array.from(event.target.files);
    // inputFiles = [...inputFiles, ...newFiles];
    // updateFileList();
// });

document.getElementById('mergePdfs').addEventListener('click', async () => {
    if (!inputFiles || inputFiles.length === 0) {
        alert('Please select PDF files to merge.');
        return;
    }

    try {
        const outputPdf = await PDFDocument.create();

        const loadFileAsArrayBuffer = (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    resolve(new Uint8Array(e.target.result));
                };
                reader.onerror = (e) => {
                    reject(e);
                };
                reader.readAsArrayBuffer(file);
            });
        };

        for (const inputFile of inputFiles) {
            const inputPdfBytes = await loadFileAsArrayBuffer(inputFile);
            const inputPdfDoc = await PDFDocument.load(inputPdfBytes);
            const copiedPages = await outputPdf.copyPages(inputPdfDoc, inputPdfDoc.getPageIndices());
            for (const page of copiedPages) {
                outputPdf.addPage(page);
            }
        }

        const outputPdfBytes = await outputPdf.save();
        const blob = new Blob([outputPdfBytes], { type: 'application/pdf' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'merged.pdf';
        link.click();
    } catch (error) {
        console.error('Error merging PDFs:', error);
        alert('Failed to merge PDFs.');
    }
});
