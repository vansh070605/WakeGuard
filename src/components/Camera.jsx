import React, { useRef, useEffect, useState } from "react";
import { FaceMesh, FACEMESH_TESSELATION, FACEMESH_RIGHT_EYE, FACEMESH_LEFT_EYE } from "@mediapipe/face_mesh";
import { Camera as MediapipeCamera } from "@mediapipe/camera_utils";
import { drawConnectors } from "@mediapipe/drawing_utils";

export default function Camera({ settings }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Keep settings fresh for the callback without re-running useEffect
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings || { showMesh: false, perclosSensitivity: 80, pitchThreshold: 15, yawTolerance: 25 };
  }, [settings]);

  // Refs for tracking without triggering re-renders
  const historyRef = useRef([]);
  const perclosRef = useRef([]);
  const closureCountRef = useRef(0);
  const yawCountRef = useRef(0);
  
  // Calibration state
  const isCalibratingRef = useRef(true);
  const calibrationBufferRef = useRef({ ear: [], mar: [], pitch: [], yaw: [] });
  const baselinesRef = useRef({ ear: 0.3, mar: 0.1, pitch: 40, yaw: 0 });

  const [calibProgress, setCalibProgress] = useState(0);

  useEffect(() => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");

    const faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      }
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    const calculateDistance = (p1, p2) => {
      return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    };

    const getEAR = (landmarks, indices) => {
      const [p1, p2, p3, p4, p5, p6] = indices.map(i => landmarks[i]);
      const v1 = calculateDistance(p2, p6);
      const v2 = calculateDistance(p3, p5);
      const h = calculateDistance(p1, p4);
      return (v1 + v2) / (2.0 * h);
    };

    const getMAR = (landmarks) => {
      const topLip = landmarks[13];
      const bottomLip = landmarks[14];
      const leftCorner = landmarks[78];
      const rightCorner = landmarks[308];
      const v = calculateDistance(topLip, bottomLip);
      const h = calculateDistance(leftCorner, rightCorner);
      return v / h;
    };

    const getHeadPose = (landmarks) => {
      const nose = landmarks[1];
      const chin = landmarks[152];
      const leftEye = landmarks[33]; 
      const rightEye = landmarks[263]; 

      // Yaw: deviation from center
      const yaw = ((nose.x - leftEye.x) / (rightEye.x - leftEye.x) - 0.5) * 100;
      
      // Pitch: looking down increases pitch
      const eyeCenterY = (leftEye.y + rightEye.y) / 2;
      const pitch = ((nose.y - eyeCenterY) / (chin.y - eyeCenterY)) * 100;

      return { yaw, pitch };
    };

    faceMesh.onResults((results) => {
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        
        const rightEAR = getEAR(landmarks, [33, 160, 158, 133, 153, 144]);
        const leftEAR = getEAR(landmarks, [362, 385, 387, 263, 373, 380]);
        const ear = (rightEAR + leftEAR) / 2.0;
        const mar = getMAR(landmarks);
        const { yaw, pitch } = getHeadPose(landmarks);

        // --- Active Settings ---
        const currentSettings = settingsRef.current;

        // --- Optional Face Mesh Visualization ---
        if (currentSettings.showMesh) {
           drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, {color: 'rgba(14, 165, 233, 0.4)', lineWidth: 0.5});
           drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {color: '#f43f5e', lineWidth: 1.5});
           drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {color: '#f43f5e', lineWidth: 1.5});
        }

        // --- Calibration Phase ---
        if (isCalibratingRef.current) {
          const buffer = calibrationBufferRef.current;
          buffer.ear.push(ear);
          buffer.mar.push(mar);
          buffer.pitch.push(pitch);
          buffer.yaw.push(yaw);

          const progress = Math.min((buffer.ear.length / 100) * 100, 100);
          setCalibProgress(progress);

          if (buffer.ear.length >= 100) {
            // Compute means
            const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
            baselinesRef.current = {
              ear: mean(buffer.ear),
              mar: mean(buffer.mar),
              pitch: mean(buffer.pitch),
              yaw: mean(buffer.yaw)
            };
            isCalibratingRef.current = false;
          }

          window.dispatchEvent(
            new CustomEvent("telemetry", {
              detail: { status: "Calibrating", ear, mar, pitch, yaw, perclos: 0 }
            })
          );
          canvasCtx.restore();
          return;
        }

        // --- Active Tracking Phase ---
        const baselines = baselinesRef.current;

        // Is eye closed based on adjustable threshold
        const sensitivity = currentSettings.perclosSensitivity / 100;
        const isEyeClosed = ear < (baselines.ear * sensitivity);
        
        // Update Closure Count
        if (isEyeClosed) {
          closureCountRef.current += 1;
        } else {
          closureCountRef.current = 0;
        }

        // Update Yaw Distraction Count
        const yawDeviation = Math.abs(yaw - baselines.yaw);
        if (yawDeviation > (currentSettings.yawTolerance || 25)) {
          yawCountRef.current += 1;
        } else {
          yawCountRef.current = 0;
        }

        // Update PERCLOS Buffer (last 50 frames ~ 2.5 seconds for instant response)
        const perclosBuf = perclosRef.current;
        perclosBuf.push(isEyeClosed ? 1 : 0);
        if (perclosBuf.length > 50) perclosBuf.shift();
        
        const perclos = (perclosBuf.reduce((a, b) => a + b, 0) / perclosBuf.length) * 100;

        // Multi-State Logic Engine
        let status = "Alert";
        
        // Critical: Eyes closed > 3 seconds (~60 frames) OR severe head drop
        if (closureCountRef.current > 60 || pitch > baselines.pitch + currentSettings.pitchThreshold) {
          status = "Critical";
        } 
        // Distracted: Looking away for > 2 seconds (~40 frames)
        else if (yawCountRef.current > 40) {
          status = "Distracted";
        }
        // Drowsy: PERCLOS > 15% OR continuous closure > 1.5 seconds (~30 frames)
        else if (perclos > 15 || closureCountRef.current > 30) {
          status = "Drowsy";
        } 
        // Fatigued: PERCLOS > 5% OR frequent yawning (MAR > baseline * 1.8)
        else if (perclos > 5 || mar > baselines.mar * 1.8) {
          status = "Fatigued";
        }

        // Chart History
        const history = historyRef.current;
        history.push({ ear, mar });
        if (history.length > 60) history.shift();

        window.dispatchEvent(
          new CustomEvent("telemetry", {
            detail: { status, ear, mar, pitch, yaw, perclos }
          })
        );
      }
      canvasCtx.restore();
    });

    const camera = new MediapipeCamera(videoElement, {
      onFrame: async () => {
        if (videoElement.videoWidth) {
           canvasElement.width = videoElement.videoWidth;
           canvasElement.height = videoElement.videoHeight;
           await faceMesh.send({ image: videoElement });
        }
      },
      width: 640,
      height: 480
    });
    camera.start();

    return () => {
      camera.stop();
      faceMesh.close();
    };
  }, []);

  return (
    <div className="glass-panel p-2 lg:p-3 rounded-3xl camera-frame relative flex flex-col justify-center overflow-hidden w-full min-h-[350px] lg:min-h-[500px]">
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 w-full h-full border border-slate-200/50 dark:border-slate-800 shadow-inner flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }} 
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none object-cover"
          style={{ transform: "scaleX(-1)" }} 
        />
        
        {/* Calibration Overlay */}
        {calibProgress < 100 && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            <div className="w-20 h-20 lg:w-24 lg:h-24 relative mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
                <circle 
                  cx="50" cy="50" r="45" fill="none" stroke="#0ea5e9" strokeWidth="6" 
                  strokeDasharray={`${(calibProgress / 100) * 283} 283`}
                  className="transition-all duration-300 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{Math.round(calibProgress)}%</span>
              </div>
            </div>
            <h3 className="text-white font-semibold tracking-wide">Calibrating Baselines</h3>
            <p className="text-slate-300 text-xs lg:text-sm mt-1">Please look straight and blink naturally...</p>
          </div>
        )}

      </div>
    </div>
  );
}
