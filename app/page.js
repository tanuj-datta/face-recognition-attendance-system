import Link from 'next/link';
import { 
  ShieldCheck, 
  Users, 
  Cpu, 
  Camera, 
  Zap, 
  BarChart4,
  UserPlus
} from 'lucide-react';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)', filter: 'blur(100px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)', filter: 'blur(100px)' }}></div>
      </div>

      <div style={{ textAlign: 'center', maxWidth: '900px', marginBottom: '4rem' }}>
        <div className="glass-panel animate-fade-in" style={{ display: 'inline-flex', padding: '8px 20px', borderRadius: '30px', marginBottom: '2rem', gap: '10px', alignItems: 'center', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)' }}>
          <Zap size={16} fill="var(--primary)" /> EMPOWERING ACADEMIC EXCELLENCE
        </div>
        <h1 className="animate-fade-in" style={{ fontSize: '5rem', fontWeight: '900', lineHeight: '1.1', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
          Attendance <span style={{ background: 'linear-gradient(to right, #818cf8, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Pro</span>
        </h1>
        <p className="animate-fade-in" style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: '1.6', animationDelay: '0.1s' }}>
          Smart biometric verification and unified academic management. <br />
          Experience the next generation of automated student tracking.
        </p>
      </div>

      <div className="dashboard-grid animate-fade-in" style={{ maxWidth: '1000px', animationDelay: '0.2s' }}>
        <div className="glass-panel stat-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <Users size={48} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
          <h2 style={{ marginBottom: '1rem' }}>Student Portal</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Check your daily timetable, mark attendance via Face ID, and track your grades.</p>
          <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <Link href="/student/login" className="glass-button" style={{ flex: 1, justifyContent: 'center' }}>
              Login
            </Link>
            <Link href="/student/register" className="glass-button" style={{ flex: 1, justifyContent: 'center', background: 'transparent', border: '1px solid var(--primary)' }}>
               <UserPlus size={18} /> Register
            </Link>
          </div>
        </div>

        <div className="glass-panel stat-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', border: '1px solid var(--secondary)' }}>
          <ShieldCheck size={48} color="var(--secondary)" style={{ marginBottom: '1.5rem' }} />
          <h2 style={{ marginBottom: '1rem' }}>Faculty Console</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Manage student marks, track daily attendance metrics, and view detailed academic reports.</p>
          <Link href="/faculty/login" className="glass-button" style={{ width: '100%', justifyContent: 'center', background: 'transparent', border: '1px solid var(--secondary)' }}>
            Faculty Login
          </Link>
        </div>
      </div>

      <div className="animate-fade-in" style={{ marginTop: '5rem', animationDelay: '0.4s', display: 'flex', gap: '3rem' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Cpu size={18} /> Biometric AI
         </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Camera size={18} /> Face Recognition
         </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <BarChart4 size={18} /> Deep Insights
         </div>
      </div>
    </div>
  );
}

