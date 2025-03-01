document.addEventListener('DOMContentLoaded', () => {
    const buttonContainer = document.getElementById('button-container');
    const addButton = document.getElementById('add-button');
    const helpButton = document.getElementById('help-button');
    const themeToggleCheckbox = document.getElementById('theme-toggle-checkbox');
    const editModeToggle = document.getElementById('edit-mode-toggle');
    const exportButton = document.getElementById('export-button');
    const importButton = document.getElementById('import-button');
    const importFile = document.getElementById('import-file');
    const modal = document.getElementById('modal');
    const cancelBtn = document.getElementById('cancel');
    const buttonForm = document.getElementById('button-form');
    const nameInput = document.getElementById('name');
    const contentInput = document.getElementById('content');

    // Define default buttons
    const defaultButtons = [
        { name: '🟩', content: '🟩' },
        { name: '🟥', content: '🟥' },
        { name: 'Copy Me', content: 'I hope you like the tool! Have fun! ❤️' }
    ];

    // Load buttons from local storage or use defaults if none exist
    let buttons = JSON.parse(localStorage.getItem('buttons')) || defaultButtons;
    let editingIndex = null;

    function renderButtons() {
        buttonContainer.innerHTML = '';
        buttons.forEach((button, index) => {
            const btnWrapper = document.createElement('div');
            btnWrapper.className = 'button-wrapper';
            btnWrapper.setAttribute('draggable', true);
            btnWrapper.setAttribute('data-index', index);

            const btn = document.createElement('button');
            btn.textContent = button.name;
            btn.addEventListener('click', () => {
                navigator.clipboard.writeText(button.content);
                btn.style.backgroundColor = '#28a745';
                setTimeout(() => {
                    btn.style.backgroundColor = '';
                }, 500);
            });

            const editDeleteIcons = document.createElement('div');
            editDeleteIcons.className = 'edit-delete-icons';
            editDeleteIcons.innerHTML = `
                <button class="edit">Edit</button>
                <button class="delete">Delete</button>
            `;

            editDeleteIcons.querySelector('.edit').addEventListener('click', () => {
                showModal(index);
            });

            editDeleteIcons.querySelector('.delete').addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this button?')) {
                    buttons.splice(index, 1);
                    localStorage.setItem('buttons', JSON.stringify(buttons));
                    renderButtons();
                }
            });

            btnWrapper.appendChild(btn);
            btnWrapper.appendChild(editDeleteIcons);
            buttonContainer.appendChild(btnWrapper);
        });
    }

    renderButtons();

    function showModal(index = null) {
        editingIndex = index;
        if (index !== null) {
            nameInput.value = buttons[index].name;
            contentInput.value = buttons[index].content;
        } else {
            nameInput.value = '';
            contentInput.value = '';
        }
        modal.style.display = 'block';
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    addButton.addEventListener('click', () => {
        showModal();
    });

    buttonForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = nameInput.value;
        const content = contentInput.value;
        if (editingIndex !== null) {
            buttons[editingIndex] = { name, content };
        } else {
            buttons.push({ name, content });
        }
        localStorage.setItem('buttons', JSON.stringify(buttons));
        renderButtons();
        closeModal();
    });

    cancelBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            closeModal();
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    editModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('edit-mode');
        editModeToggle.textContent = document.body.classList.contains('edit-mode') ? 'Edit Mode: ON' : 'Edit Mode: OFF';
    });

    themeToggleCheckbox.addEventListener('change', () => {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggleCheckbox.checked = true;
    }

    helpButton.addEventListener('click', () => {
        alert('This tool allows you to create buttons that copy predefined text to your clipboard.\n\n' +
              'Features:\n' +
              '- Click "Add Button" to create a new button.\n' +
              '- Click on any button to copy its content.\n' +
              '- Toggle "Edit Mode" to edit, delete, or drag-and-drop buttons to reorder them.\n' +
              '- Use "Export" to save your buttons as a JSON file.\n' +
              '- Use "Import" to load buttons from a JSON file.\n' +
              '- Use the theme toggle to switch between light and dark modes.\n\n' +
              'All data is stored locally in your browser.');
    });

    // Export functionality
    exportButton.addEventListener('click', () => {
        const dataStr = JSON.stringify(buttons);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'feedback_clipboard.json';
        a.click();
        URL.revokeObjectURL(url);
    });

    // Import functionality
    importButton.addEventListener('click', () => {
        importFile.click();
    });

    importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedButtons = JSON.parse(event.target.result);
                    if (Array.isArray(importedButtons) && importedButtons.every(btn => btn.name && btn.content)) {
                        buttons = importedButtons;
                        localStorage.setItem('buttons', JSON.stringify(buttons));
                        renderButtons();
                        alert('Buttons imported successfully!');
                    } else {
                        alert('Invalid file format. Expected an array of {name, content} objects.');
                    }
                } catch (error) {
                    alert('Error reading file: ' + error.message);
                }
            };
            reader.readAsText(file);
            importFile.value = ''; // Reset file input
        }
    });

    let draggedElement = null;

    document.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('button-wrapper') && document.body.classList.contains('edit-mode')) {
            draggedElement = e.target;
            e.dataTransfer.setData('text/plain', draggedElement.dataset.index);
        }
    });

    document.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    document.addEventListener('drop', (e) => {
        if (draggedElement && document.body.classList.contains('edit-mode')) {
            const target = e.target.closest('.button-wrapper');
            if (target && target !== draggedElement) {
                const draggedIndex = parseInt(draggedElement.dataset.index);
                const targetIndex = parseInt(target.dataset.index);

                const [movedButton] = buttons.splice(draggedIndex, 1);
                buttons.splice(targetIndex, 0, movedButton);

                localStorage.setItem('buttons', JSON.stringify(buttons));
                renderButtons();
            }
            draggedElement = null;
        }
    });
});