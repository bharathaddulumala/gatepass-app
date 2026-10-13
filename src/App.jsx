import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { User, CheckSquare, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function App() {
  const [role, setRole] = useState('STUDENT'); 
  const [requests, setRequests] = useState([]);
  
  // Student input state fields
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [reason, setReason] = useState('');
  const [myPass, setMyPass] = useState(null);

  // Automatically fetch data whenever the dashboard role changes
  useEffect(() => {
    fetchLiveRequests();
  }, [role]);

  const fetchLiveRequests = async () => {
    try {
      const res = await fetch('https://onrender.com');
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
      
      // Clear inputs
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
      const res = await fetch(`https://onrender.com{id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: currentRole, action: actionValue })
      });
      if (res.ok) {
        alert(`${currentRole} action submitted successfully!`);
        fetchLiveRequests();
        
        // If updating the student's active pass status, refresh the view
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
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      {/* Top Navbar */}
      <header className="bg-indigo-900 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center gap-2">🏢 Campus Gatepass Portal</h1>
        <div className="flex items-center gap-2 bg-indigo-800 p-2 rounded border border-indigo-700">
          <span className="text-xs font-mono uppercase tracking-wider text-indigo-200">Simulate Identity Dashboard:</span>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="bg-indigo-950 text-white rounded p-1 text-sm border-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
          >
            <option value="STUDENT">👨‍🎓 Student Screen</option>
            <option value="MENTOR">👩‍🏫 Mentor Approval Queue</option>
            <option value="DEAN">👨‍💼 Dean Sign-Off Desk</option>
          </select>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        {/* STUDENT DASHBOARD */}
        {role === 'STUDENT' && (
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <form onSubmit={handleStudentSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-4">
              <h2 className="text-lg font-bold border-b pb-2 mb-2 flex items-center gap-2"><User size={20}/> Submit Out-Pass Request</h2>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input type="text" placeholder="John Doe" value={studentName} onChange={e => setStudentName(e.target.value)} className="w-full border rounded p-2 focus:outline-indigo-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Roll Number</label>
                <input type="text" placeholder="22CS045" value={rollNumber} onChange={e => setRollNumber(e.target.value)} className="w-full border rounded p-2 focus:outline-indigo-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reason for Leaving Campus</label>
                <input type="text" placeholder="Medical emergency checkup / Family event" value={reason} onChange={e => setReason(e.target.value)} className="w-full border rounded p-2 focus:outline-indigo-600" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 rounded hover:bg-indigo-700 transition">
                Send to Database
              </button>
            </form>

            {/* Dynamic Card Display */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-white shadow-md">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wide mb-3">Your Live Gatepass Ticket</h3>
              {myPass ? (
                <div className="space-y-4">
                  <div className="text-left bg-slate-50 p-3 rounded text-sm space-y-1">
                    <p><strong>Name:</strong> {myPass.studentName}</p>
                    <p><strong>Roll:</strong> {myPass.rollNumber}</p>
                    <p><strong>Reason:</strong> {myPass.reason}</p>
                    <p><strong>Mentor Signature:</strong> <span className="font-semibold">{myPass.mentorStatus}</span></p>
                    <p><strong>Dean Signature:</strong> <span className="font-semibold">{myPass.deanStatus}</span></p>
                  </div>
                  {myPass.overallStatus === 'APPROVED' ? (
                    <div className="bg-emerald-50 p-4 inline-block rounded-lg border border-emerald-200">
                      <QRCodeSVG value={`VALIDATED-PASSID-${myPass._id}`} size={150} />
                      <p className="text-xs text-emerald-700 font-bold mt-2">✓ Access Code Generated. Ready for Gate Entry Scan.</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs">
                      ⏳ Pending management authorization checkpoints. The barcode will pop up here once both approve.
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400 py-12">No active application submissions found in your tracking view session.</p>
              )}
            </div>
          </div>
        )}

        {/* MANAGEMENT PORTALS (MENTOR / DEAN) */}
        {(role === 'MENTOR' || role === 'DEAN') && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold border-b pb-2 mb-4 flex items-center gap-2">
              <CheckSquare size={20}/> {role === 'MENTOR' ? 'Mentor Verification Queue' : 'Dean Final Authorization Portal'}
            </h2>
            <div className="grid gap-4">
              {requests.filter(r => role === 'MENTOR' ? r.mentorStatus === 'PENDING' : r.mentorStatus === 'APPROVED' && r.deanStatus === 'PENDING').map(req => (
                <div key={req._id} className="border p-4 rounded-lg shadow-sm flex justify-between items-center bg-slate-50">
                  <div>
                    <h3 className="font-bold text-slate-700">{req.studentName} ({req.rollNumber})</h3>
                    <p className="text-sm text-slate-600 mt-0.5"><span className="font-medium text-slate-500">Reason:</span> {req.reason}</p>
                    {role === 'DEAN' && <p className="text-xs text-emerald-600 font-medium mt-1">✓ Endorsed by Mentor</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApprovalAction(req._id, role, 'APPROVED')} className="bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded hover:bg-emerald-700 transition">
                      Accept
                    </button>
                    <button onClick={() => handleApprovalAction(req._id, role, 'REJECTED')} className="bg-rose-600 text-white text-xs font-bold px-3 py-2 rounded hover:bg-rose-700 transition">
                      Deny
                    </button>
                  </div>
                </div>
              ))}
              {requests.filter(r => role === 'MENTOR' ? r.mentorStatus === 'PENDING' : r.mentorStatus === 'APPROVED' && r.deanStatus === 'PENDING').length === 0 && (
                <p className="text-slate-400 flex items-center gap-2 text-sm justify-center py-8"><ShieldAlert size={18}/> Review workflow items queue is empty.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
