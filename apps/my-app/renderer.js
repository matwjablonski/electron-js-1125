const openFileButton = document.getElementById('open-file');
const saveFileButton = document.getElementById('save-file');
const textareaForFile = document.getElementById('fileContent');
const themeToggleButton = document.getElementById('themeToggle');

themeToggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark');
});

document.getElementById('sendMessage').addEventListener('click', () => {
    window.electronAPI.sendMessage('Hello from Renderer Process!');
});

window.electronAPI.getAppInfo().then(info => {
    console.log('App Info:', info);

    document.getElementById('app-info').innerHTML = `
        <p>Name: ${info.name}</p>
        <p>Version: ${info.version}</p>
        <p>Chrome Version: ${info.chromeVersion}</p>
        <p>Node Version: ${info.nodeVersion}</p>
        <p>Electron Version: ${info.electronVersion}</p>
    `;
});

openFileButton.addEventListener('click', async () => {
    const fileContent = await window.electronAPI.openFile();
    console.log('File content:', fileContent);
    textareaForFile.value = fileContent || '';
})

saveFileButton.addEventListener('click', async () => {
    const content = textareaForFile.value;
    await window.electronAPI.saveFile(content);
});
