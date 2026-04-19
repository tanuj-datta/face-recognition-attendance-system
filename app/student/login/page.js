'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from '../register/page.module.css';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ roll_no: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('Logging in...');
    const result = await signIn('credentials', {
      redirect: false,
      identifier: formData.roll_no,
      password: formData.password,
      isFaculty: 'false'
    });

    if (result?.error) {
      setError('Invalid Roll Number or Password');
    } else {
      router.push('/student/dashboard');
    }
  };

  return (
    <div className={styles.container}>
      <div className={`glass-panel ${styles.registrationCard}`} style={{ maxWidth: '400px' }}>
        <h2 className={styles.title}>Student Login</h2>
        <p className={styles.status}>{error || 'Sign in to view your attendance'}</p>

        <form onSubmit={handleLogin} className={styles.formGroup}>
          <input 
            type="number" 
            placeholder="Reg / Roll Number" 
            className={styles.input}
            required
            inputMode="numeric"
            value={formData.roll_no}
            onChange={(e) => setFormData({...formData, roll_no: e.target.value})}
          />
          <input 
            type="password" 
            placeholder="Password" 
            className={styles.input}
            required
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <button type="submit" className={`btn btn-primary ${styles.scanBtn}`}>
            Login to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
