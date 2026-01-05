import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as faceapi from 'face-api.js';
import { Camera, X } from 'lucide-react';

const EmotionDetector = ({ onEmotionDetected, isActive, showPreview }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [initializationError, setInitializationError] = useState(null);
    const [detectedExpression, setDetectedExpression] = useState(null);
    const [videoFilter, setVideoFilter] = useState('none');

    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
                ]);

                setIsModelLoaded(true);
            } catch (err) {
                console.error("Failed to load face-api models:", err);
                setInitializationError("Gagal memuat model AI wajah.");
            }
        };

        if (isActive) {
            loadModels();
        }
    }, [isActive]);

    useEffect(() => {
        if (isActive && isModelLoaded) {
            startVideo();
        } else {
            stopVideo();
        }

        return () => stopVideo();
    }, [isActive, isModelLoaded]);

    const startVideo = () => {
        navigator.mediaDevices
            .getUserMedia({ video: {} })
            .then((stream) => {
                streamRef.current = stream; // Store stream for cleanup
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch((err) => {
                console.error("Camera access denied:", err);
                setInitializationError("Akses kamera ditolak.");
            });
    };

    const stopVideo = () => {
        // Stop all tracks from the stored stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
                track.enabled = false;
            });
            streamRef.current = null;
        }

        // Clear video source
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    // Detection Loop
    useEffect(() => {
        let interval;
        const historyRef = { current: [] }; // Store last N frames

        const handleVideoPlay = () => {
            if (!videoRef.current || !canvasRef.current) return;

            const displaySize = {
                width: videoRef.current.videoWidth || 320,
                height: videoRef.current.videoHeight || 240
            };

            faceapi.matchDimensions(canvasRef.current, displaySize);

            interval = setInterval(async () => {
                if (!videoRef.current || !canvasRef.current) return;

                // 1. Draw Video to Canvas for Processing
                const ctx = canvasRef.current.getContext('2d');
                ctx.drawImage(videoRef.current, 0, 0, displaySize.width, displaySize.height);

                // 2. Analyze Brightness
                const imageData = ctx.getImageData(0, 0, displaySize.width, displaySize.height);
                const data = imageData.data;
                let r, g, b, avg;
                let colorSum = 0;

                for (let x = 0, len = data.length; x < len; x += 4) {
                    r = data[x];
                    g = data[x + 1];
                    b = data[x + 2];
                    avg = Math.floor((r + g + b) / 3);
                    colorSum += avg;
                }

                const brightness = Math.floor(colorSum / (displaySize.width * displaySize.height));

                // Multi-level boost for better low-light performance
                let currentFilter = 'none';

                if (brightness < 30) {
                    // Pitch Black: 1200% boost (Night Vision Mode)
                    currentFilter = 'brightness(1200%) contrast(150%) saturate(100%) grayscale(50%)';
                    ctx.filter = currentFilter;
                    ctx.drawImage(videoRef.current, 0, 0, displaySize.width, displaySize.height);
                    ctx.filter = 'none';
                } else if (brightness < 40) {
                    // Extreme Dark: Massive boost
                    currentFilter = 'brightness(400%) contrast(120%) saturate(120%)';
                    ctx.filter = currentFilter;
                    ctx.drawImage(videoRef.current, 0, 0, displaySize.width, displaySize.height);
                    ctx.filter = 'none';
                } else if (brightness < 80) {
                    // Very Dark: Strong boost
                    currentFilter = 'brightness(250%) contrast(115%) saturate(110%)';
                    ctx.filter = currentFilter;
                    ctx.drawImage(videoRef.current, 0, 0, displaySize.width, displaySize.height);
                    ctx.filter = 'none';
                } else if (brightness < 120) {
                    // Dark: Moderate boost
                    currentFilter = 'brightness(150%) contrast(110%)';
                    ctx.filter = currentFilter;
                    ctx.drawImage(videoRef.current, 0, 0, displaySize.width, displaySize.height);
                    ctx.filter = 'none';
                } else if (brightness > 200) {
                    // Too Bright: Dim slightly
                    currentFilter = 'brightness(90%)';
                    ctx.filter = currentFilter;
                    ctx.drawImage(videoRef.current, 0, 0, displaySize.width, displaySize.height);
                    ctx.filter = 'none';
                }

                // Update visible video filter
                setVideoFilter(prev => prev !== currentFilter ? currentFilter : prev);

                // 4. Detect from PROCESSED Canvas
                const detections = await faceapi
                    .detectAllFaces(canvasRef.current, new faceapi.TinyFaceDetectorOptions())
                    .withFaceExpressions();

                if (detections.length > 0) {
                    const rawExpressions = detections[0].expressions;

                    // 1. Add to history (Rolling Window of 30 frames for SLOW stability)
                    historyRef.current.push(rawExpressions);
                    if (historyRef.current.length > 30) historyRef.current.shift();

                    // 2. Calculate Smoothed Scores (Average)
                    const smoothedExpressions = {};
                    const emotions = Object.keys(rawExpressions);

                    emotions.forEach(emotion => {
                        const sum = historyRef.current.reduce((acc, curr) => acc + (curr[emotion] || 0), 0);
                        smoothedExpressions[emotion] = sum / historyRef.current.length;
                    });

                    // 3. STRICT FILTERING & MAPPING
                    // Allowed: happy, sad, angry, calm (neutral), energetic (surprised)
                    // Disallowed: disgusted, fearful -> Zero them out completely
                    smoothedExpressions['disgusted'] = 0;
                    smoothedExpressions['fearful'] = 0;

                    // 4. Custom Correction Logic (Fix Crying = Disgust/Surprise)
                    // If 'sad' has ANY presence (> 0.01), suppress 'surprised' (energetic)
                    // BUT ONLY IF 'happy' is low (< 0.1). If happy is present, it's likely excitement.
                    if (smoothedExpressions['sad'] > 0.01 && smoothedExpressions['happy'] < 0.1) {
                        smoothedExpressions['surprised'] = 0;
                    }

                    // 5. Boost Energetic (Surprised) if Happy is also present
                    // Excitement often looks like Happy + Surprised.
                    if (smoothedExpressions['happy'] > 0.2 && smoothedExpressions['surprised'] > 0.1) {
                        smoothedExpressions['surprised'] *= 2.0; // Boost energetic significantly
                    }

                    // 5b. Boost Sadness
                    // Sadness is often subtle. Boost it to make it "louder".
                    smoothedExpressions['sad'] *= 2.5;

                    // 6. Determine Final Emotion
                    // Filter out 'neutral' first to check for active emotions
                    const nonNeutral = Object.entries(smoothedExpressions)
                        .filter(([emotion]) => emotion !== 'neutral')
                        .sort((a, b) => b[1] - a[1]);

                    const strongestNonNeutral = nonNeutral[0]; // [emotion, score]
                    let finalEmotion = 'calm'; // Default to calm (neutral)

                    // Threshold Logic:
                    // General threshold is 0.1 (10%) for stability.
                    // BUT for 'sad', we allow a lower threshold (0.02) because we boosted it and it's important.
                    if (strongestNonNeutral) {
                        const [emotion, score] = strongestNonNeutral;
                        if (emotion === 'sad' && score > 0.02) {
                            finalEmotion = 'sad';
                        } else if (score > 0.1) {
                            finalEmotion = emotion;
                        }
                    }

                    // 6. Map to User-Friendly Terms
                    if (finalEmotion === 'neutral') finalEmotion = 'calm';
                    if (finalEmotion === 'surprised') finalEmotion = 'energetic';

                    setDetectedExpression(finalEmotion);
                    onEmotionDetected(finalEmotion);
                } else {
                    // Decay history slowly instead of clearing instantly? 
                    // For now, clear to avoid stuck state if face leaves.
                    historyRef.current = [];
                    setDetectedExpression(null);
                }
            }, 500); // Check every 500ms (slower for stability)
        };

        if (isActive && isModelLoaded && videoRef.current) {
            videoRef.current.addEventListener('play', handleVideoPlay);
        }

        return () => {
            clearInterval(interval);
            if (videoRef.current) {
                videoRef.current.removeEventListener('play', handleVideoPlay);
            }
        };
    }, [isActive, isModelLoaded, onEmotionDetected]);

    if (!isActive) return null;

    return (
        <motion.div
            drag
            dragElastic={0.2}
            className={`fixed bottom-24 right-4 z-50 transition-opacity duration-300 cursor-move resize-both overflow-hidden ${showPreview ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            style={{ width: '240px', height: '180px', minWidth: '128px', minHeight: '96px' }}
        >
            <div className="relative w-full h-full bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
                {/* Visible Raw Video (Smoother 60fps) */}
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{ filter: videoFilter }}
                    className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1] transition-all duration-500"
                />
                {/* Hidden Processed Canvas (For Detection Only) */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-cover opacity-0 pointer-events-none"
                />
            </div>
        </motion.div>
    );
};

export default EmotionDetector;
