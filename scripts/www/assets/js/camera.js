/**
 * Camera App Core Functionality
 * This file contains the core camera functionality that is already implemented in the index.html
 * It's separated here for better code organization and maintainability.
 */

// Camera initialization and management
async function initCamera(cameraType = 'environment') {
    try {
        const constraints = {
            video: { 
                facingMode: cameraType,
                width: { ideal: window.innerWidth },
                height: { ideal: window.innerHeight }
            },
            audio: false
        };

        // Stop existing stream if any
        if (window.currentStream) {
            window.currentStream.getTracks().forEach(track => track.stop());
        }

        window.currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // Return the stream for use in the main application
        return window.currentStream;
    } catch (error) {
        console.error('Error accessing camera:', error);
        throw error;
    }
}

// Camera settings management
async function updateCameraSettings(settings) {
    if (!window.currentStream) return;
    
    const videoTrack = window.currentStream.getVideoTracks()[0];
    if (!videoTrack || !videoTrack.applyConstraints) return;
    
    try {
        await videoTrack.applyConstraints(settings);
        return true;
    } catch (error) {
        console.error('Error applying camera settings:', error);
        return false;
    }
}

// Flash mode management
async function setFlashMode(mode) {
    if (!window.currentStream) return false;
    
    const videoTrack = window.currentStream.getVideoTracks()[0];
    if (!videoTrack || !videoTrack.getCapabilities || !videoTrack.getCapabilities().torch) {
        return false;
    }
    
    try {
        await videoTrack.applyConstraints({
            advanced: [{ torch: mode === 'on' }]
        });
        return true;
    } catch (error) {
        console.error('Error setting flash mode:', error);
        return false;
    }
}

// Focus management
async function setCameraFocus(x, y, videoElement) {
    if (!window.currentStream || !videoElement) return false;
    
    const videoTrack = window.currentStream.getVideoTracks()[0];
    if (!videoTrack || !videoTrack.getCapabilities) return false;
    
    // Check if manual focus is supported
    if (!videoTrack.getCapabilities().focusMode) return false;
    
    try {
        // Calculate normalized focus coordinates
        const rect = videoElement.getBoundingClientRect();
        const focusX = x / rect.width;
        const focusY = y / rect.height;
        
        // Apply focus constraints
        await videoTrack.applyConstraints({
            advanced: [{ 
                focusMode: 'manual',
                focusDistance: 0.5 // This is a placeholder, actual implementation depends on camera API
            }]
        });
        
        return true;
    } catch (error) {
        console.error('Error setting camera focus:', error);
        return false;
    }
}

// Image capture and processing
function captureImageFromVideo(videoElement, canvasElement) {
    if (!videoElement || !canvasElement) return null;
    
    const ctx = canvasElement.getContext('2d');
    
    // Set canvas dimensions to match video
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    
    // Draw video frame to canvas
    ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    
    // Return image data URL
    return canvasElement.toDataURL('image/jpeg');
}

// Image filter applications
function applyImageFilter(canvasElement, filterType) {
    if (!canvasElement) return false;
    
    const ctx = canvasElement.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
    const data = imageData.data;
    
    try {
        switch (filterType) {
            case 'grayscale':
                applyGrayscaleFilter(data);
                break;
            case 'sepia':
                applySepiaFilter(data);
                break;
            case 'vintage':
                applySepiaFilter(data);
                // Add vignette effect separately
                addVignetteEffect(ctx, canvasElement.width, canvasElement.height);
                break;
            case 'cool':
                applyCoolFilter(data);
                break;
            default:
                return false;
        }
        
        ctx.putImageData(imageData, 0, 0);
        return true;
    } catch (error) {
        console.error('Error applying filter:', error);
        return false;
    }
}

// Grayscale filter implementation
function applyGrayscaleFilter(imageData) {
    for (let i = 0; i < imageData.length; i += 4) {
        const avg = (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3;
        imageData[i] = avg;
        imageData[i + 1] = avg;
        imageData[i + 2] = avg;
    }
}

// Sepia filter implementation
function applySepiaFilter(imageData) {
    for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        
        imageData[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
        imageData[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
        imageData[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
    }
}

// Cool filter implementation (blue tint)
function applyCoolFilter(imageData) {
    for (let i = 0; i < imageData.length; i += 4) {
        imageData[i] = Math.min(255, imageData[i] * 0.9);
        imageData[i + 1] = Math.min(255, imageData[i + 1] * 0.9);
        imageData[i + 2] = Math.min(255, imageData[i + 2] * 1.2);
    }
}

// Vignette effect implementation
function addVignetteEffect(ctx, width, height) {
    const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) / 2
    );
    
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
}

// Brightness and contrast adjustment
function adjustBrightnessAndContrast(canvasElement, brightnessValue, contrastValue) {
    if (!canvasElement) return false;
    
    const ctx = canvasElement.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
    const data = imageData.data;
    
    try {
        const brightnessFactor = brightnessValue / 100;
        const contrastFactor = (contrastValue + 100) / 100;
        
        for (let i = 0; i < data.length; i += 4) {
            // Apply contrast
            data[i] = Math.min(255, Math.max(0, (data[i] / 255 - 0.5) * contrastFactor + 0.5) * 255);
            data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] / 255 - 0.5) * contrastFactor + 0.5) * 255);
            data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] / 255 - 0.5) * contrastFactor + 0.5) * 255);
            
            // Apply brightness
            data[i] = Math.min(255, Math.max(0, data[i] + brightnessFactor * 255));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + brightnessFactor * 255));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + brightnessFactor * 255));
        }
        
        ctx.putImageData(imageData, 0, 0);
        return true;
    } catch (error) {
        console.error('Error adjusting brightness and contrast:', error);
        return false;
    }
}

// Image saving functionality
function saveImageToDevice(imageDataUrl, filename) {
    // Create download link
    const link = document.createElement('a');
    link.download = filename || `camera_${new Date().getTime()}.jpg`;
    link.href = imageDataUrl;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
}

// Image sharing functionality
async function shareImage(imageDataUrl, title, text) {
    try {
        // Convert base64 to blob
        const response = await fetch(imageDataUrl);
        const blob = await response.blob();
        
        // Create file from blob
        const file = new File([blob], `camera_${new Date().getTime()}.jpg`, { type: 'image/jpeg' });
        
        // Check if Web Share API is supported
        if (navigator.share) {
            await navigator.share({
                title: title || 'Camera App Photo',
                text: text || 'Check out this photo I took!',
                files: [file]
            });
            return true;
        } else {
            // Web Share API not supported
            return false;
        }
    } catch (error) {
        console.error('Error sharing image:', error);
        return false;
    }
}

// Export functions for use in other files
window.CameraApp = {
    initCamera,
    updateCameraSettings,
    setFlashMode,
    setCameraFocus,
    captureImageFromVideo,
    applyImageFilter,
    adjustBrightnessAndContrast,
    saveImageToDevice,
    shareImage
};