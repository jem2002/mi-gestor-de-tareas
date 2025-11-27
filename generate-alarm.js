const fs = require('fs');

// Parameters for a 1000Hz beep
const sampleRate = 44100;
const duration = 0.4; // 400ms
const frequency = 800; // 800Hz - less aggressive, still audible
const numSamples = Math.floor(sampleRate * duration);

// Create WAV file header and data
const createWavFile = () => {
    const dataSize = numSamples;
    const buffer = Buffer.alloc(44 + dataSize);

    // RIFF header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);

    // fmt chunk
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // fmt chunk size
    buffer.writeUInt16LE(1, 20);  // audio format (1 = PCM)
    buffer.writeUInt16LE(1, 22);  // number of channels (1 = mono)
    buffer.writeUInt32LE(sampleRate, 24); // sample rate
    buffer.writeUInt32LE(sampleRate, 28); // byte rate
    buffer.writeUInt16LE(1, 32);  // block align
    buffer.writeUInt16LE(8, 34);  // bits per sample

    // data chunk
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);

    // Generate sine wave with fade-out envelope
    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        // Fade out envelope to avoid clicking
        const fadeOut = Math.min(1, (numSamples - i) / (sampleRate * 0.05));
        const value = Math.sin(2 * Math.PI * frequency * t) * fadeOut;
        // Convert to 8-bit unsigned (0-255)
        const sample = Math.floor((value + 1) * 127.5);
        buffer.writeUInt8(sample, 44 + i);
    }

    return buffer;
};

// Write the file
const wavBuffer = createWavFile();
fs.writeFileSync('public/alarm.wav', wavBuffer);
console.log('✓ Alarm sound created successfully at public/alarm.wav');
console.log(`  Duration: ${duration}s, Frequency: ${frequency}Hz, Sample Rate: ${sampleRate}Hz`);
