import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, X } from 'lucide-react';

const EmotionDetector = ({ onEmotionDetected, isActive, onClose }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null); // Store stream independently
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [initializationError, setInitializationError] = useState(null);
    const [detectedExpression, setDetectedExpression] = useState(null);

    // Load models
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

    // Start Video
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

        const handleVideoPlay = () => {
            if (!videoRef.current || !canvasRef.current) return;

            const displaySize = {
                width: videoRef.current.videoWidth || 320,
                height: videoRef.current.videoHeight || 240
            };

            faceapi.matchDimensions(canvasRef.current, displaySize);

            interval = setInterval(async () => {
                if (!videoRef.current) return;

                const detections = await faceapi
                    .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                    .withFaceExpressions();

                if (detections.length > 0) {
                    const expressions = detections[0].expressions;
                    const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
                    const dominant = sorted[0];

                    // Custom Logic: Bias towards non-neutral emotions
                    // If neutral is dominant, but we have a strong secondary emotion (> 20%), pick that.
                    let finalEmotion = dominant[0];

                    if (dominant[0] === 'neutral') {
                        // Find highest non-neutral
                        const secondary = sorted.find(e => e[0] !== 'neutral');
                        if (secondary && secondary[1] > 0.20) {
                            finalEmotion = secondary[0];
                        }
                    }

                    // Lower threshold to 0.3 for responsiveness
                    if (expressions[finalEmotion] > 0.3) {
                        setDetectedExpression(finalEmotion);
                        onEmotionDetected(finalEmotion);
                    }
                } else {
                    setDetectedExpression(null);
                }

                // Optional: Draw on canvas (disabled for cleaner UI, can enable for debug)
                // const resizedDetections = faceapi.resizeResults(detections, displaySize);
                // canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                // faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
            }, 1000); // Check every 1 second
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
        <div className="fixed bottom-24 right-4 z-50 w-32 h-40 bg-black/80 rounded-xl overflow-hidden border border-white/20 shadow-lg backdrop-blur-sm transition-all duration-300 hover:w-48 hover:h-60 group">
            {/* Header / Close */}
            <div className="absolute top-0 left-0 right-0 p-1 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-white font-medium px-2">
                    {detectedExpression ? `Emosi: ${detectedExpression}` : 'Mendeteksi...'}
                </span>
                <button
                    onClick={onClose}
                    className="p-1 rounded-full bg-red-500/80 hover:bg-red-600 text-white"
                >
                    <X size={12} />
                </button>
            </div>

            {/* Video Feed */}
            <div className="relative w-full h-full flex items-center justify-center">
                {!isModelLoaded && !initializationError && (
                    <div className="text-white text-xs text-center px-2 animate-pulse">
                        Memuat AI...
                    </div>
                )}

                {initializationError && (
                    <div className="text-red-400 text-xs text-center px-2">
                        {initializationError}
                    </div>
                )}

                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className={`w-full h-full object-cover ${!isModelLoaded ? 'hidden' : ''}`}
                />
                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full hidden" />
            </div>
        </div>
    );
};

export default EmotionDetector;
