'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import * as faceapi from 'face-api.js';
import { Camera, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AttendanceScan() {
  const router = useRouter();
  const { slotIndex } = useParams();
  const videoRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [status, setStatus] = useState('Initializing camera...');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setStatus('Loading AI Models...');
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        setModelsLoaded(true);
        setStatus('Models loaded. Please face the camera.');
        startVideo();
      } catch (e) {
        console.error(e);
        setStatus('Failed to load AI Models.');
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
        console.error(err);
        setStatus('Camera access denied.');
      });
  };

  const handleCapture = async () => {
    if (!modelsLoaded || !videoRef.current || isVerifying) return;
    
    setIsVerifying(true);
    setStatus('Scanning Face...');

    try {
      const detection = await faceapi.detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setStatus('No face detected. Try again.');
        setIsVerifying(false);
        return;
      }

      setStatus('Identity verification in progress...');
      const embeddingArray = Array.from(detection.descriptor);

      const response = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          face_embedding: embeddingArray,
          slot_index: slotIndex
        })
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setStatus('Attendance marked successfully!');
        setTimeout(() => router.push('/student/dashboard'), 2000);
      } else {
        setStatus(data.error || 'Verification failed.');
        setIsVerifying(false);
      }
    } catch (e) {
      console.error(e);
      setStatus('System error. Please try again.');
      setIsVerifying(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <Link href="/student/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="glass-panel" style={{ padding: '3rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Facial Recognition Check-in</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Slot {slotIndex} Attendance Verification</p>

        <div style={{ position: 'relative', width: '100%', maxWidth: '500px', margin: '0 auto', borderRadius: '20px', overflow: 'hidden', border: '2px solid var(--glass-border)' }}>
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
          {isSuccess && (
             <div style={{ position: 'absolute', inset: 0, background: 'rgba(16, 185, 129, 0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={80} color="white" />
                <h3 style={{ color: 'white', marginTop: '1rem' }}>Verified</h3>
             </div>
          )}
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          {status.includes('fail') || status.includes('denied') || status.includes('error') ? <AlertCircle color="var(--danger)" size={20} /> : <Camera color="var(--primary)" size={20} />}
          <span style={{ fontWeight: '500' }}>{status}</span>
        </div>

        {!isSuccess && (
          <button 
            className="glass-button" 
            style={{ margin: '2rem auto 0', width: '100%', maxWidth: '300px', justifyContent: 'center' }}
            onClick={handleCapture}
            disabled={!modelsLoaded || isVerifying}
          >
            {isVerifying ? 'Processing...' : 'Verify & Mark Attendance'}
          </button>
        )}
      </div>
    </div>
  );
}
