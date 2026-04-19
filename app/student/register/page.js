'use client';

import { useEffect, useRef, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import * as faceapi from 'face-api.js';
import { User, IdCard, Lock, CheckCircle2, Camera, Loader2, AlertCircle, BookOpen } from 'lucide-react';
import styles from './page.module.css';

export default function Register() {
  const router = useRouter();
  const videoRef = useRef(null);
  
  const [step, setStep] = useState(1); // 1: Info, 2: Camera, 3: Success
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detectionState, setDetectionState] = useState('Waiting for details...');
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({ 
    name: '', 
    roll_no: '', 
    course_id: '', 
    password: '', 
    confirm_password: '' 
  });

  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCourses(data);
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, course_id: data[0].id }));
          }
        }
      });
  }, []);
  
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (step === 2 && !modelsLoaded) {
      const loadModels = async () => {
        try {
          setDetectionState('Loading AI Neural Networks...');
          await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models')
          ]);
          setModelsLoaded(true);
          setDetectionState('AI Ready. Position your face.');
          startVideo();
        } catch (e) {
          console.error("Error loading models:", e);
          setDetectionState('AI Initialization Failed.');
        }
      };
      loadModels();
    }
  }, [step, modelsLoaded]);

  const validateStep1 = () => {
    const newErrors = {};
    if (!/^[A-Za-z\s]{3,}$/.test(formData.name)) {
      newErrors.name = "Name must be at least 3 letters (alpha only).";
    }
    if (!/^\d{8,10}$/.test(formData.roll_no)) {
      newErrors.roll_no = "Roll number must be 8-10 digits.";
    }
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("Webcam error:", err);
        setDetectionState('Camera permissions required.');
      });
  };

  const captureAndRegister = async () => {
    if (!modelsLoaded || !videoRef.current || isProcessing) return;
    
    setIsProcessing(true);
    setDetectionState('Capturing Biometrics...');

    try {
      const detection = await faceapi.detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setDetectionState('Face not found. Please stay still.');
        setIsProcessing(false);
        return;
      }

      setDetectionState('Face Analyzed! Registering account...');
      const embeddingArray = Array.from(detection.descriptor);

      const response = await fetch('/api/student/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          face_embedding: embeddingArray
        })
      });

      if (response.ok) {
        setStep(3);
        setTimeout(async () => {
          await signIn('credentials', {
            redirect: true,
            identifier: formData.roll_no,
            password: formData.password,
            isFaculty: 'false',
            callbackUrl: '/student/dashboard'
          });
        }, 2000);
      } else {
        const errorData = await response.json();
        setDetectionState('Error: ' + (errorData.error || 'Registration failed'));
        setIsProcessing(false);
      }
    } catch (e) {
      console.error(e);
      setDetectionState('Scanning Error. Try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={`glass-panel ${styles.registrationCard}`} style={{ maxWidth: '600px', padding: '3rem' }}>
        
        {/* Progress Header */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
           {[1, 2, 3].map(i => (
             <div key={i} style={{ 
               width: '40px', 
               height: '40px', 
               borderRadius: '50%', 
               background: step >= i ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               fontWeight: 'bold',
               transition: '0.3s'
             }}>
               {step > i ? <CheckCircle2 size={20} /> : i}
             </div>
           ))}
        </div>

        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className={styles.title}>Student Profile</h2>
            <p className={styles.status} style={{ marginBottom: '2rem' }}>Please provide your basic details.</p>

            <div className={styles.formGroup}>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '15px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  className={styles.input}
                  style={{ paddingLeft: '45px' }}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                {errors.name && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '5px' }}>{errors.name}</p>}
              </div>

              <div style={{ position: 'relative' }}>
                <IdCard size={18} style={{ position: 'absolute', left: '15px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type="number" 
                  placeholder="Roll / Registration Number" 
                  className={styles.input}
                  style={{ paddingLeft: '45px' }}
                  value={formData.roll_no}
                  onChange={(e) => setFormData({...formData, roll_no: e.target.value})}
                />
                {errors.roll_no && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '5px' }}>{errors.roll_no}</p>}
              </div>

              <div style={{ position: 'relative' }}>
                <BookOpen size={18} style={{ position: 'absolute', left: '15px', top: '15px', color: 'var(--text-muted)' }} />
                <select 
                  className={styles.input}
                  style={{ paddingLeft: '45px', appearance: 'none' }}
                  value={formData.course_id}
                  onChange={(e) => setFormData({...formData, course_id: e.target.value})}
                >
                  <option value="" disabled>Select Course</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id} style={{ background: 'var(--bg-dark)' }}>{c.course_name}</option>
                  ))}
                </select>
                {courses.length === 0 && <p style={{ color: 'var(--warning)', fontSize: '0.75rem', marginTop: '5px' }}>Loading available courses...</p>}
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '15px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  placeholder="Set Password" 
                  className={styles.input}
                  style={{ paddingLeft: '45px' }}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                {errors.password && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '5px' }}>{errors.password}</p>}
              </div>

              <input 
                type="password" 
                placeholder="Confirm Password" 
                className={styles.input}
                value={formData.confirm_password}
                onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
              />
              {errors.confirm && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '5px' }}>{errors.confirm}</p>}
            </div>

            <button 
              className={`btn btn-primary ${styles.scanBtn}`} 
              onClick={() => validateStep1() && setStep(2)}
              style={{ padding: '1rem', marginTop: '2rem' }}
            >
              Next: Setup Biometrics
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            <h2 className={styles.title}>Face Registration</h2>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: '30px', display: 'inline-flex', gap: '8px', alignItems: 'center', marginBottom: '2rem' }}>
              {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} color="var(--primary)" />}
              <span style={{ fontSize: '0.85rem' }}>{detectionState}</span>
            </div>

            <div className={styles.videoContainer} style={{ border: isProcessing ? '3px solid var(--primary)' : '2px solid var(--glass-border)' }}>
              <video ref={videoRef} autoPlay muted width="640" height="480" className={styles.videoStream} />
              {isProcessing && <div style={{ position: 'absolute', inset: 0, border: '2px solid white', borderRadius: '50%', margin: '15%', opacity: 0.5 }}></div>}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="glass-button" style={{ flex: 1, background: 'rgba(255,255,255,0.05)' }} onClick={() => setStep(1)} disabled={isProcessing}>
                Back
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 2 }} 
                onClick={captureAndRegister}
                disabled={!modelsLoaded || isProcessing}
              >
                {isProcessing ? 'Capturing...' : 'Capture & Register'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in" style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: 'var(--success)' }}>
              <CheckCircle2 size={64} />
            </div>
            <h2 className={styles.title}>Registration Complete!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Your biometric profile has been successfully encrypted and saved. Redirecting you to your dashboard...</p>
            <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto' }} />
          </div>
        )}
      </div>
    </div>
  );
}

