'use client';

import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import styles from '../../student/register/page.module.css';

export default function ClassroomAttendance() {
  const videoRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [statusText, setStatusText] = useState('Initializing Classroom Camera...');
  const [recentAttendance, setRecentAttendance] = useState([]);
  const detectionInterval = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setStatusText('Loading AI Recognition Models...');
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        setModelsLoaded(true);
        setStatusText('Classroom camera active. Waiting for students.');
        startVideo();
      } catch (e) {
        console.error("Error loading models:", e);
        setStatusText('Failed to load AI Models. Please retry.');
      }
    };
    loadModels();
    
    return () => {
      if (detectionInterval.current) clearInterval(detectionInterval.current);
    }
  }, []);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("error accessing webcam:", err);
        setStatusText('Camera access denied.');
      });
  };

  const handleVideoPlay = () => {
    // Run detection every 3 seconds
    detectionInterval.current = setInterval(async () => {
      if (!videoRef.current) return;
      
      const detection = await faceapi.detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        setStatusText('Face detected, analyzing...');
        const embeddingArray = Array.from(detection.descriptor);
        
        try {
          const response = await fetch('/api/attendance/mark', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              face_embedding: embeddingArray,
              subject_name: 'Computer Science'
            })
          });

          const data = await response.json();
          if (response.ok) {
            setStatusText(`Attendance marked successfully for ${data.student}!`);
            setRecentAttendance(prev => {
              if (prev.includes(data.student)) return prev;
              return [data.student, ...prev].slice(0, 5); // Keep last 5
            });
          } else {
            setStatusText(`Unrecognized Face`);
          }
        } catch (e) {
          console.error("Attendance ping error", e);
        }
      } else {
        setStatusText('Classroom camera active. Waiting for students.');
      }
    }, 3000);
  };

  return (
    <div className={styles.container}>
      <div className={`glass-panel ${styles.registrationCard}`}>
        <h2 className={styles.title}>Live Classroom Monitor</h2>
        <p className={styles.status}>{statusText}</p>

        <div className={styles.videoContainer}>
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            className={styles.videoStream}
            onPlay={handleVideoPlay}
          />
        </div>

        <div className={styles.formGroup}>
          <h3 style={{ color: 'white' }}>Recently Marked Present:</h3>
          <ul style={{ color: 'var(--success)', listStyle: 'none', padding: 0 }}>
            {recentAttendance.length === 0 ? <li style={{color: '#94a3b8'}}>None yet...</li> : null}
            {recentAttendance.map((student, i) => (
              <li key={i} style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>✅ {student}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
