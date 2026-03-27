'use client';
import { use, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import PageHeader from '@/components/layout/PageHeader';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';

export default function StudentProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = createClient();
  const [student, setStudent] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    semester: 1,
    department_id: '',
    is_active: true
  });

  useEffect(() => {
    loadProfile();
    loadDepartments();
  }, [id, supabase]);

  async function loadDepartments() {
    const { data } = await supabase.from('departments').select('id, name').eq('is_active', true);
    if (data) setDepartments(data);
  }

  async function loadProfile() {
    const { data: user } = await (supabase.from('users') as any).select('*, departments(name)').eq('id', id).single();
    if (user) {
      setStudent(user);
      setEditForm({
        full_name: user.full_name,
        phone: user.phone || '',
        semester: user.semester || 1,
        department_id: user.department_id || '',
        is_active: user.is_active
      });
    }

    const { data: res } = await supabase
      .from('results')
      .select('*, subjects(subject_code, subject_name)')
      .eq('student_id', id)
      .order('semester', { ascending: false });
    
    if (res) setResults(res);
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const { error } = await (supabase
        .from('users') as any)
        .update({
          full_name: editForm.full_name,
          phone: editForm.phone,
          semester: editForm.semester,
          department_id: editForm.department_id,
          is_active: editForm.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Profile updated successfully');
        setShowEditModal(false);
        loadProfile();
      }
    } finally {
      setSaving(false);
    }
  }

  if (!student) return <div style={{ padding: '2rem' }}>Loading profile...</div>;

  return (
    <div>
      <PageHeader 
        title={`${student.full_name}'s Profile`}
        subtitle={`${student.roll_no || 'No roll number'} • Dept of ${student.departments?.name || 'N/A'}`}
        icon="👤"
        action={
          <button onClick={() => setShowEditModal(true)} className="btn-primary">
            Edit Info
          </button>
        }
      />
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Personal Information</h3>
          <p><strong>Email:</strong> <span style={{ color: 'var(--text-secondary)' }}>{student.email}</span></p>
          <p><strong>Phone:</strong> <span style={{ color: 'var(--text-secondary)' }}>{student.phone || '—'}</span></p>
          <p><strong>Status:</strong> <Badge variant={student.is_active ? 'success' : 'danger'}>{student.is_active ? 'Active' : 'Inactive'}</Badge></p>
        </div>
        
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Academic Information</h3>
          <p><strong>Department:</strong> <span style={{ color: 'var(--text-secondary)' }}>{student.departments?.name || '—'}</span></p>
          <p><strong>Semester:</strong> <span style={{ color: 'var(--text-secondary)' }}>{student.semester || '—'}</span></p>
        </div>
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Academic Results</h2>
      <div className="glass-card" style={{ overflowX: 'auto' }}>
        <table className="table-dark">
          <thead>
            <tr>
              <th>Semester</th>
              <th>Subject Code</th>
              <th>Subject Name</th>
              <th>Exam Type</th>
              <th>Marks</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No results found for this student.</td></tr>
            )}
            {results.map((r, i) => (
              <tr key={i}>
                <td>{r.semester}</td>
                <td><Badge variant="info">{r.subjects?.subject_code}</Badge></td>
                <td>{r.subjects?.subject_name}</td>
                <td style={{ textTransform: 'capitalize' }}>{r.exam_type}</td>
                <td><strong>{r.marks_obtained}</strong> / {r.max_marks}</td>
                <td><Badge variant={r.grade === 'F' ? 'danger' : 'success'}>{r.grade}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showEditModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 500, padding: '2rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Edit Student Info</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="label-default">Full Name</label>
                <input className="input-dark" value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} />
              </div>
              
              <div>
                <label className="label-default">Phone Number</label>
                <input className="input-dark" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="label-default">Department</label>
                  <select className="input-dark" value={editForm.department_id} onChange={e => setEditForm({...editForm, department_id: e.target.value})}>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-default">Semester</label>
                  <select className="input-dark" value={editForm.semester} onChange={e => setEditForm({...editForm, semester: Number(e.target.value)})}>
                    {[1,2,3,4,5,6].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={editForm.is_active} onChange={e => setEditForm({...editForm, is_active: e.target.checked})} />
                Account Active
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowEditModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={saveProfile} className="btn-primary" disabled={saving}>
                {saving ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
