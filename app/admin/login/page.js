'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from '../../student/register/page.module.css';

export default function FacultyLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('Authenticating...');
    const result = await signIn('credentials', {
      redirect: false,
      identifier: formData.username,
      password: formData.password,
      isAdmin: 'true'
    });

    if (result?.error) {
      setError('Invalid Admin Credentials');
    } else {
      router.push('/admin/dashboard');
    }
  };

  return (
    <div className={styles.container}>
      <div className={`glass-panel ${styles.registrationCard}`} style={{ maxWidth: '400px' }}>
        <h2 className={styles.title} style={{ background: 'linear-gradient(to right, #ec4899, #f43f5e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Admin Console Login</h2>
        <p className={styles.status}>{error || 'Sign in to manage attendance'}</p>

        <form onSubmit={handleLogin} className={styles.formGroup}>
          <input 
            type="text" 
            placeholder="Admin Username (hint: admin)" 
            className={styles.input}
            required
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
          />
          <input 
            type="password" 
            placeholder="Password (hint: admin123)" 
            className={styles.input}
            required
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <button type="submit" className={`btn btn-primary ${styles.scanBtn}`} style={{ background: '#e11d48' }}>
            Login to Admin Console
          </button>
        </form>
      </div>
    </div>
  );
}
