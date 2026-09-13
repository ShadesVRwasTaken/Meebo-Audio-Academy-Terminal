// Meebo Audio Academy - Part 2: Cognitive Learning & Audio Capture Core
const micBtn = document.getElementById('mic-btn');
const mediaUpload = document.getElementById('media-upload');
const dropZone = document.getElementById('drop-zone');
const statusBox = document.getElementById('status-box');

// Setup ChromeOS Native Streaming Links
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let liveRecognition = null;
let fileRecognition = null;

if (SpeechRecognition) {
    liveRecognition = new SpeechRecognition();
    liveRecognition.continuous = true;
    liveRecognition.interimResults = true;
    liveRecognition.lang = 'en-US';

    fileRecognition = new SpeechRecognition();
    fileRecognition.continuous = true;
    fileRecognition.interimResults = false;
    fileRecognition.lang = 'en-US';
} else {
    statusBox.innerText = "🚨 Device Architecture Alert: Chromebook built-in Speech Engine mapping failed.";
}

// --- COGNITIVE LEARNING INTERCEPT MATRIX ---
function learnFromSentence(text) {
    if (!text || text.toLowerCase().trim() === "meebo wipe memory") return;
    const words = text.trim().split(/\s+/);
    if (words.length < 2) return;

    for (let i = 0; i < words.length - 1; i++) {
        const currentWord = words[i].toLowerCase();
        const nextWord = words[i + 1];
        if (!currentBrainData.chaotic[currentWord]) currentBrainData.chaotic[currentWord] = [];
        if (!currentBrainData.chaotic[currentWord].includes(nextWord)) currentBrainData.chaotic[currentWord].push(nextWord);
    }
    
    if (words.length >= 3) {
        for (let i = 0; i < words.length - 2; i++) {
            const currentPair = `${words[i].toLowerCase()}__${words[i+1].toLowerCase()}`;
            const nextWord = words[i + 2];
            if (!currentBrainData.grammar[currentPair]) currentBrainData.grammar[currentPair] = [];
            if (!currentBrainData.grammar[currentPair].includes(nextWord)) currentBrainData.grammar[currentPair].push(nextWord);
        }
    }
    saveActiveBrain(); // Triggers storage mutation inside core file tracking
    if (explorerWrapper.style.display === "block") renderBrainExplorer();
}

// --- MICROPHONE NODE CAPTURE LOGIC ---
if (liveRecognition) {
    micBtn.addEventListener('click', () => {
        if (micBtn.classList.contains('listening')) {
            liveRecognition.stop();
        } else {
            micBtn.classList.add('listening');
            statusBox.innerText = "🎙️ Broadcasting Live... Talk now to update the profile matrix parameters.";
            liveRecognition.start();
        }
    });

    liveRecognition.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i]) finalTranscript += event.results[i].transcript;
        }
        if (finalTranscript.trim() !== "") {
            statusBox.innerText = `[Live Node Ingested]: ${finalTranscript}`;
            let processedText = finalTranscript.replace(/\bamiibo\b/gi, "Meebo").replace(/\bameebo\b/gi, "Meebo");
            learnFromSentence(processedText);
        }
    };

    liveRecognition.onend = () => { micBtn.classList.remove('listening'); };
}

// --- DRAG & DROP MEDIA WAVE CAPTURE ---
dropZone.addEventListener('click', () => mediaUpload.click());
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.background = "rgba(14, 189, 132, 0.2)"; });
dropZone.addEventListener('dragleave', () => { dropZone.style.background = "rgba(14, 189, 132, 0.05)"; });
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.background = "rgba(14, 189, 132, 0.05)";
    if (e.dataTransfer.files.length > 0) processMediaFile(e.dataTransfer.files[0]);
});
mediaUpload.addEventListener('change', (e) => {
    if (e.target.files.length > 0) processMediaFile(e.target.files[0]);
});

function processMediaFile(file) {
    statusBox.innerText = `📂 Indexing Node Target: "${file.name}"\nParsing signal waveforms...`;
    const audioUrl = URL.createObjectURL(file);
    const audioPlayer = new Audio(audioUrl);
    
    fileRecognition.start();
    audioPlayer.play();

    fileRecognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i]) {
                const textChunk = event.results[i].transcript;
                statusBox.innerText += `\n📥 Ingested Stream: "${textChunk}"`;
                let processedText = textChunk.replace(/\bamiibo\b/gi, "Meebo").replace(/\bameebo\b/gi, "Meebo");
                learnFromSentence(processedText);
            }
        }
    };

    audioPlayer.onended = () => {
        fileRecognition.stop();
        statusBox.innerText += `\n🏁 Wave parsing finished on profile: [${activeBrainId}]`;
        URL.revokeObjectURL(audioUrl);
    };
}
