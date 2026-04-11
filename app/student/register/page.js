'use client';

import { useEffect, useRef, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import * as faceapi from 'face-api.js';
import styles from './page.module.css';

export default function Register() {
  const router = useRouter();
  const videoRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detectionState, setDetectionState] = useState('Initializing camera...');
  const [formData, setFormData] = useState({ name: '', roll_no: '', course_id: 'default', password: '', confirm_password: '' });

  useEffect(() => {
    const loadModels = async () => {
      try {
        setDetectionState('Loading AI Models...');
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        setModelsLoaded(true);
        setDetectionState('Models loaded. Please face the camera.');
        startVideo();
      } catch (e) {
        console.error("Error loading models:", e);
        setDetectionState('Failed to load AI Models.');
      }
    };
    loadModels();
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
        setDetectionState('Camera access denied. Please allow camera permissions.');
      });
  };

  const captureAndRegister = async () => {
    if (!modelsLoaded || !videoRef.current) return;
    
    if (formData.password !== formData.confirm_password) {
      setDetectionState('Passwords do not match!');
      return;
    }
    if (formData.password.length < 4) {
      setDetectionState('Password must be at least 4 characters.');
      return;
    }

    try {
      setDetectionState('Scanning Face...');
      const detection = await faceapi.detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setDetectionState('No face detected. Please ensure your face is clearly visible.');
        return;
      }

      setDetectionState('Face detected! Saving profile...');
      
      // We get the 128-dimensional array describing the face
      const embeddingArray = Array.from(detection.descriptor);

      // Send this to our backend API route
      const response = await fetch('/api/student/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          face_embedding: embeddingArray
        })
      });

      if (response.ok) {
        setDetectionState('Student registered successfully! Auto-logging you in...');
        setFormData({ name: '', roll_no: '', course_id: 'default', password: '', confirm_password: '' });
        
        const rawPassword = formData.password;
        const rawRoll = formData.roll_no;
        
        const result = await signIn('credentials', {
          redirect: false,
          identifier: rawRoll,
          password: rawPassword,
          isFaculty: 'false'
        });

        if (!result?.error) {
          router.push('/student/dashboard');
        } else {
          setDetectionState('Registered successfully! Please click Student Login on the main page.');
        }
      } else {
        const errorData = await response.json();
        setDetectionState('Error: ' + (errorData.error || 'Registration failed'));
      }
    } catch (e) {
      console.error("Capture error:", e);
      setDetectionState('Error scanning face. ' + (e.message || 'Unknown error.'));
    }
  };

  return (
    <div className={styles.container}>
      <div className={`glass-panel ${styles.registrationCard}`}>
        <h2 className={styles.title}>Register Student Face</h2>
        <p className={styles.status}>{detectionState}</p>

        <div className={styles.videoContainer}>
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            width="640"
            height="480"
            className={styles.videoStream}
            onPlay={() => setDetectionState('Camera ready. Fill details & scan face.')}
          />
        </div>

        <div className={styles.formGroup}>
          <input 
            type="text" 
            placeholder="Student Name" 
            className={styles.input}
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <input 
            type="text" 
            placeholder="Roll Number (e.g., 12223868)" 
            className={styles.input}
            value={formData.roll_no}
            onChange={(e) => setFormData({...formData, roll_no: e.target.value})}
          />
          <input 
            type="password" 
            placeholder="Set a Password" 
            className={styles.input}
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <input 
            type="password" 
            placeholder="Confirm Password" 
            className={styles.input}
            value={formData.confirm_password}
            onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
          />
          <select 
            className={styles.input}
            value={formData.course_id}
            onChange={(e) => setFormData({...formData, course_id: e.target.value})}
          >
            <option value="default">Select Course / Department</option>
            <option value="btech-cse">B.Tech CSE</option>
            <option value="btech-ece">B.Tech ECE</option>
          </select>
        </div>

        <button 
          className={`btn btn-primary ${styles.scanBtn}`} 
          onClick={captureAndRegister}
          disabled={!modelsLoaded || !formData.name || !formData.roll_no}
        >
          Capture Face & Register
        </button>
      </div>
    </div>
  );
}
