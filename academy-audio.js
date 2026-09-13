// Meebo Audio Academy - Part 2: Local AI Processing Engine (Proxy Fixed)
const micBtn = document.getElementById('mic-btn');
const mediaUpload = document.getElementById('media-upload');
const dropZone = document.getElementById('drop-zone');
const statusBox = document.getElementById('status-box');

let transcriberPipeline = null;

// Initialize the local Whisper AI model background engine
async function initLocalModel() {
    if (!window.HuggingFacePipeline || !window.HuggingFaceEnv) {
        statusBox.innerText = "⏳ Synchronizing local machine learning layers...";
        setTimeout(initLocalModel, 200);
        return;
    }
    
    statusBox.innerText = "🤖 Launching Local Whisper AI... (Downloading ~30MB engine weights on first startup)";
    
    try {
        window.HuggingFaceEnv.allowLocalModels = false;
        
        // Force pipeline execution inline to eliminate the Codespace worker lockout
        transcriberPipeline = await window.HuggingFacePipeline(
            'automatic-speech-recognition', 
            'Xenova/whisper-tiny.en',
            { 
                proxy: false, // <-- CRITICAL CODESPACE FIXED NODE: Stops endless stalling loop
                device: 'wasm' 
            }
        );
        
        statusBox.innerText = "🏁 Local AI Engine ready! Drop an audio/video file or speak into the microphone node.";
    } catch (err) {
        statusBox.innerText = `🚨 Model deployment block: ${err.message}\nTry disabling privacy extensions on this tab, then refresh!`;
        console.error("AI Loading Error: ", err);
    }
}
initLocalModel();

// Setup Chromebook Native Speech Recognition for microphone button loops (Free/Native)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let liveRecognition = null;

if (SpeechRecognition) {
    liveRecognition = new SpeechRecognition();
    liveRecognition.continuous = true;
    liveRecognition.interimResults = true;
    liveRecognition.lang = 'en-US';
}

// --- COGNITIVE LEARNING INTERCEPT MATRIX ---
function learnFromSentence(text) {
    if (!text || text.toLowerCase().trim() === "meebo wipe memory") return;
    
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    
    sentences.forEach(sentence => {
        const words = sentence.split(/\s+/);
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
    });

    saveActiveBrain(); 
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

// --- DRAG & DROP INGESTION PROCESSING ---
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

async function processMediaFile(file) {
    if (!transcriberPipeline) {
        alert("🚨 System Occupied: Local AI model is still loading components. Try again in a few seconds.");
        return;
    }

    statusBox.innerText = `📂 Loading File Array: "${file.name}"\n⚙️ Extracting and decoding audio track arrays silently...`;

    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        
        let rawData = audioBuffer.getChannelData(0);
        
        statusBox.innerText = `🔥 Local AI Model Processing File: "${file.name}"...\nThis runs silently at high speed inside your browser!`;

        const output = await transcriberPipeline(rawData, {
            chunk_length_s: 30,
            stride_length_s: 5
        });

        const fullTranscript = output.text;

        if (fullTranscript && fullTranscript.trim() !== "") {
            statusBox.innerText = `🏁 Silent Transcription Complete!\n\n📥 Ingested Document Map:\n"${fullTranscript}"\n\nMeebo updated successfully inside profile: [${activeBrainId}]`;
            let processedText = fullTranscript.replace(/\bamiibo\b/gi, "Meebo").replace(/\bameebo\b/gi, "Meebo");
            learnFromSentence(processedText);
        } else {
            statusBox.innerText = "🏁 Processing finished, but no distinct text was found inside the audio waveforms.";
        }

    } catch (err) {
        statusBox.innerText = `\n🚨 Local AI Processing Failure: ${err.message}\nEnsure the file dropped contains clear audio waveforms.`;
    }
}
