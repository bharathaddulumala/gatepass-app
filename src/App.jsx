import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function App() {
  const [role, setRole] = useState('STUDENT'); 
  const [requests, setRequests] = useState([]);
  
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [reason, setReason] = useState('');
  const [myPass, setMyPass] = useState(null);

  useEffect(() => {
    fetchLiveRequests();
  }, [role]);

  const fetchLiveRequests = async () => {
    try {
      const res = await fetch('https://gatepass-backend-e8h7.onrender.com');
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error("Error fetching database records:", err);
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!studentName || !rollNumber || !reason) return alert("Please fill all student details.");

    try {
      const res = await fetch('https://onrender.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName, rollNumber, reason })
      });
      const newPass = await res.json();
      setMyPass(newPass);
      alert("Application sent to your Mentor's dashboard successfully!");
      
      setStudentName('');
      setRollNumber('');
      setReason('');
      fetchLiveRequests();
    } catch (err) {
      alert("Failed to submit request.");
    }
  };

  const handleApprovalAction = async (id, currentRole, actionValue) => {
    try {
      const res = await fetch(`https://gatepass-backend-e8h7.onrender.com{id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: currentRole, action: actionValue })
      });
      if (res.ok) {
        alert(`${currentRole} action submitted successfully!`);
        fetchLiveRequests();
        
        if (myPass && myPass._id === id) {
          const updatedPass = await res.json();
          setMyPass(updatedPass);
        }
      }
    } catch (err) {
      alert("Failed to process approval workflow status change.");
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'sans-serif', color: '#334155', margin: 0 }}>
      {/* Top Navbar */}
      <header style={{ backgroundColor: '#1e1b4b', color: 'white', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: 0, fontSize: '20px' }}>🏢 Campus Gatepass Portal</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#3730a3', padding: '8px', borderRadius: '4px' }}>
          <span style={{ fontSize: '12px', color: '#e0e7ff' }}>Simulate Identity:</span>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            style={{ backgroundColor: '#4338ca', color: 'white', border: 'none', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}
          >
            <option value="STUDENT">Student Screen</option>
            <option value="MENTOR">Mentor Approval Queue</option>
            <option value="DEAN">Dean Sign-Off Desk</option>
          </select>
        </div>
      </header>

      <main style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        {/* STUDENT VIEW */}
        {role === 'STUDENT' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <form onSubmit={handleStudentSubmit} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <h2 style={{ marginTop: 0, borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', fontSize: '18px' }}>Submit Out-Pass Request</h2>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Full Name</label>
                <input type="text" placeholder="John Doe" value={studentName} onChange={e => setStudentName(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Roll Number</label>
                <input type="text" placeholder="22CS045" value={rollNumber} onChange={e => setRollNumber(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Reason</label>
                <input type="text" placeholder="Medical emergency checkup" value={reason} onChange={e => setReason(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              </div>
              <button type="submit" style={{ width: '100%', backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '10px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>
                Send to Database
              </button>
            </form>

            {/* Ticket Card View */}
            <div style={{ backgroundColor: 'white', border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '24px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginTop: 0, fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Your Live Gatepass Ticket</h3>
              {myPass ? (
                <div>
                  <div style={{ textAlign: 'left', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', fontSize: '14px', marginBottom: '16px' }}>
                    <p style={{ margin: '4px 0' }}><strong>Name:</strong> {myPass.studentName}</p>
                    <p style={{ margin: '4px 0' }}><strong>Roll:</strong> {myPass.rollNumber}</p>
                    <p style={{ margin: '4px 0' }}><strong>Reason:</strong> {myPass.reason}</p>
                    <p style={{ margin: '4px 0' }}><strong>Mentor Status:</strong> {myPass.mentorStatus}</p>
                    <p style={{ margin: '4px 0' }}><strong>Dean Status:</strong> {myPass.deanStatus}</p>
                  </div>
                  {myPass.overallStatus === 'APPROVED' ? (
                    <div style={{ backgroundColor: '#ecfdf5', padding: '16px', borderRadius: '8px', display: 'inline-block', border: '1px solid #a7f3d0' }}>
                      <QRCodeSVG value={`VALIDATED-PASSID-${myPass._id}`} size={140} />
                      <p style={{ fontSize: '12px', color: '#047857', fontWeight: 'bold', margin: '8px 0 0 0' }}>✓ Access Code Generated. Ready for Gate Entry Scan.</p>
                    </div>
                  ) : (
                    <div style={{ padding: '12px', backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', borderRadius: '6px', fontSize: '12px' }}>
                      ⏳ Pending management authorization checkpoints. The barcode will pop up here once both approve.
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ color: '#94a3b8', paddingTop: '40px' }}>No active submissions found.</p>
              )}
            </div>
          </div>
        )}

        {/* MANAGEMENT QUEUES */}
        {(role === 'MENTOR' || role === 'DEAN') && (
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginTop: 0, borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', fontSize: '18px' }}>
              {role === 'MENTOR' ? 'Mentor Verification Queue' : 'Dean Final Authorization Portal'}
            </h2>
            <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
              {requests.filter(r => role === 'MENTOR' ? r.mentorStatus === 'PENDING' : r.mentorStatus === 'APPROVED' && r.deanStatus === 'PENDING').map(req => (
                <div key={req._id} style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#334155', fontSize: '16px' }}>{req.studentName} ({req.rollNumber})</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}><strong>Reason:</strong> {req.reason}</p>
                    {role === 'DEAN' && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#059669', fontWeight: 'bold' }}>✓ Endorsed by Mentor</p>}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleApprovalAction(req._id, role, 'APPROVED')} style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '8px 12px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Accept</button>
                    <button onClick={() => handleApprovalAction(req._id, role, 'REJECTED')} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '8px 12px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Deny</button>
                  </div>
                </div>
              ))}
{requests.filter(r => role === 'MENTOR' ? r.mentorStatus === 'PENDING' : r.mentorStatus === 'APPROVED' && r.deanStatus === 'PENDING').length === 0 && (
<p style={{ color: '#94a3b8', textAlign: 'center', padding: '24px 0', margin: 0, fontSize: '14px' }}>Queue is completely empty.
)}


)}


);
}
