// Meebo Audio Academy - Part 1: Core Profile Manager & Explorer Engine
const brainSelect = document.getElementById('brain-select');
const modeSelect = document.getElementById('mode-select');
const brainUpload = document.getElementById('brain-upload');
const importTriggerBtn = document.getElementById('import-trigger-btn');
const renameBrainBtn = document.getElementById('rename-brain-btn');
const deleteBrainBtn = document.getElementById('delete-brain-btn');
const explorerContainer = document.getElementById('brain-explorer-container');
const toggleExplorerBtn = document.getElementById('toggle-explorer-btn');
const explorerWrapper = document.getElementById('explorer-wrapper');
const downloadBtn = document.getElementById('download-btn');

let activeBrainId = "default";
let currentBrainData = { chaotic: {}, grammar: {} };
let brainIndexList = ["default"];

// --- PROFILE STORAGE ENGINES ---
function loadIndex() {
    const index = localStorage.getItem('meebo_index_list');
    if (index) {
        brainIndexList = JSON.parse(index);
    } else {
        brainIndexList = ["default"];
        localStorage.setItem('meebo_index_list', JSON.stringify(brainIndexList));
    }
    rebuildBrainDropdown();
}

function rebuildBrainDropdown() {
    brainSelect.innerHTML = "";
    brainIndexList.forEach(id => {
        const option = document.createElement('option');
        option.value = id;
        option.innerText = id === "default" ? "Baseline Default Brain" : `🧠 ${id}`;
        if (id === activeBrainId) option.selected = true;
        brainSelect.appendChild(option);
    });
}

async function loadActiveBrain() {
    const savedData = localStorage.getItem(`meebo_profile_${activeBrainId}`);
    if (savedData) {
        const parsed = JSON.parse(savedData);
        currentBrainData.chaotic = parsed.chaotic || {};
        currentBrainData.grammar = parsed.grammar || {};
    } else if (activeBrainId === "default") {
        try {
            const response = await fetch('brain.json');
            if (response.ok) {
                const data = await response.json();
                currentBrainData.chaotic = data.chaotic || {};
                currentBrainData.grammar = data.grammar || {};
                saveActiveBrain();
            } else {
                currentBrainData = { chaotic: {}, grammar: {} };
            }
        } catch (e) {
            currentBrainData = { chaotic: {}, grammar: {} };
        }
    } else {
        currentBrainData = { chaotic: {}, grammar: {} };
    }
    if (explorerWrapper.style.display === "block") renderBrainExplorer();
}

function saveActiveBrain() {
    localStorage.setItem(`meebo_profile_${activeBrainId}`, JSON.stringify(currentBrainData));
    if (!brainIndexList.includes(activeBrainId)) {
        brainIndexList.push(activeBrainId);
        localStorage.setItem('meebo_index_list', JSON.stringify(brainIndexList));
        rebuildBrainDropdown();
    }
}

// --- PROFILE ACTION SUITE ---
renameBrainBtn.addEventListener('click', () => {
    if (activeBrainId === "default") { alert("The baseline 'Default Brain' cannot be renamed."); return; }
    const newName = prompt(`Enter a new name for "${activeBrainId}":`, activeBrainId);
    if (!newName) return;
    const cleanName = newName.replace(/[^a-zA-Z0-9_\s]/g, "").trim().replace(/\s+/g, "_");
    if (!cleanName || brainIndexList.includes(cleanName)) return;
    
    localStorage.setItem(`meebo_profile_${cleanName}`, JSON.stringify(currentBrainData));
    localStorage.removeItem(`meebo_profile_${activeBrainId}`);
    brainIndexList = brainIndexList.map(id => id === activeBrainId ? cleanName : id);
    localStorage.setItem('meebo_index_list', JSON.stringify(brainIndexList));
    activeBrainId = cleanName;
    rebuildBrainDropdown();
    loadActiveBrain();
});

deleteBrainBtn.addEventListener('click', () => {
    if (activeBrainId === "default") { alert("The core 'Default Brain' cannot be deleted."); return; }
    if (!confirm(`Are you sure you want to permanently delete the profile: "${activeBrainId}"?`)) return;
    
    localStorage.removeItem(`meebo_profile_${activeBrainId}`);
    brainIndexList = brainIndexList.filter(id => id !== activeBrainId);
    localStorage.setItem('meebo_index_list', JSON.stringify(brainIndexList));
    activeBrainId = "default";
    rebuildBrainDropdown();
    loadActiveBrain();
});

importTriggerBtn.addEventListener('click', () => brainUpload.click());

brainUpload.addEventListener('change', (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const targetFile = files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const uploadedJson = JSON.parse(e.target.result);
            const profileName = targetFile.name.replace(".json", "").toLowerCase().replace(/[^a-z0-9]/g, "_");
            if (!brainIndexList.includes(profileName)) {
                brainIndexList.push(profileName);
                localStorage.setItem('meebo_index_list', JSON.stringify(brainIndexList));
            }
            localStorage.setItem(`meebo_profile_${profileName}`, JSON.stringify(uploadedJson));
            activeBrainId = profileName;
            rebuildBrainDropdown();
            loadActiveBrain();
        } catch (err) { alert("Invalid brain data schema parameters."); }
    };
    reader.readAsText(targetFile);
});

brainSelect.addEventListener('change', (e) => { activeBrainId = e.target.value; loadActiveBrain(); });
modeSelect.addEventListener('change', () => { if (explorerWrapper.style.display === "block") renderBrainExplorer(); });

// --- INTERACTIVE TREE STRUCTURAL VISUALIZER ---
function renderBrainExplorer() {
    const selectedMode = modeSelect.value;
    const targetData = currentBrainData[selectedMode] || {};
    const keys = Object.keys(targetData).sort();
    
    if (keys.length === 0) {
        explorerContainer.innerHTML = `<div style="color: #8a8a9e; font-style: italic; padding: 5px;">The [${selectedMode}] JSON dictionary structure is currently empty. Build nodes below!</div>`;
        return;
    }
    
    explorerContainer.innerHTML = `<div style="color: #8a8a9e; margin-bottom: 8px; font-weight: bold; font-family: monospace;">json_structure: brain.${selectedMode}</div>`;
    keys.forEach(key => {
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'brain-node';
        const keySpan = document.createElement('span');
        keySpan.className = 'brain-key';
        
        const formattedKey = key.includes('__') ? `"${key.replace(/__/g, ' ')}"` : `"${key}"`;
        keySpan.innerText = `${formattedKey}: `;
        
        const valuesDiv = document.createElement('div');
        valuesDiv.className = 'brain-values';
        valuesDiv.innerText = JSON.stringify(targetData[key]);
        
        keySpan.addEventListener('click', () => nodeDiv.classList.toggle('expanded'));
        nodeDiv.appendChild(keySpan);
        nodeDiv.appendChild(valuesDiv);
        explorerContainer.appendChild(nodeDiv);
    });
}

toggleExplorerBtn.addEventListener('click', () => {
    const isActive = explorerWrapper.style.display === "block";
    explorerWrapper.style.display = isActive ? "none" : "block";
    if (!isActive) renderBrainExplorer();
});

downloadBtn.addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentBrainData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${activeBrainId}_academy_brain.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
});

// Bootstrapper Lifecycle Init
loadIndex();
loadActiveBrain();
