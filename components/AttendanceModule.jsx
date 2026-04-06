"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

const AttendanceModule = ({ onBack }) => {
  const { user } = useAuth();
  
  // Modals
  const [isContractorModalOpen, setIsContractorModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [viewingStaffId, setViewingStaffId] = useState(null);
  const [staffSearchTerm, setStaffSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [contractors, setContractors] = useState([]);
  const [selectedContractorId, setSelectedContractorId] = useState(null);

  // Forms
  const [newContractorName, setNewContractorName] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  
  // Bulk Attendance State (Staff ID -> { value, upad, remarks })
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [bulkAttendance, setBulkAttendance] = useState({});

  // Multiplier mapping
  const multipliers = { 'Full': 1.0, 'Half': 0.5, 'One and Half': 1.5, 'Two': 2.0, 'Absent': 0 };

  // Utility to migrate legacy timestamp IDs to UUIDs (for Supabase compatibility)
  const migrateAttendanceToUUIDs = (data) => {
    let hasChanged = false;
    const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    const migrated = (data || []).map(c => {
      const oldCId = c.id;
      const newCId = isUUID(oldCId) ? oldCId : crypto.randomUUID();
      if (newCId !== oldCId) hasChanged = true;

      // Migrate staff
      const staffMap = {};
      const migratedStaff = (c.staff || []).map(s => {
        const oldSId = s.id;
        const newSId = isUUID(oldSId) ? oldSId : crypto.randomUUID();
        staffMap[oldSId] = newSId;
        if (newSId !== oldSId) hasChanged = true;
        return { ...s, id: newSId };
      });

      // Migrate records (re-link to new staff IDs)
      const migratedRecords = (c.records || []).map(r => {
        const oldRecordId = r.id;
        const newRecordId = isUUID(oldRecordId) ? oldRecordId : crypto.randomUUID();
        if (newRecordId !== oldRecordId) hasChanged = true;
        
        return {
          ...r,
          id: newRecordId,
          staffId: staffMap[r.staffId] || r.staffId
        };
      });

      return { ...c, id: newCId, staff: migratedStaff, records: migratedRecords };
    });

    return { migrated, hasChanged };
  };

  const fetchContractors = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const { data, error } = await supabase
        .from('attendance_contractors')
        .select(`
          *,
          staff: attendance_staff(*),
          records: attendance_records(*)
        `)
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      
      if (error) throw error;
      if (data && data.length > 0) {
        setContractors(data.map(c => ({
          ...c,
          staff: c.staff || [],
          records: (c.records || []).map(r => ({
            ...r,
            staffId: r.staff_id,
            value: r.status,
            upad: r.upad,
            remarks: r.remarks
          }))
        })));
        console.log(`✅ Loaded ${data.length} contractors from cloud.`);
        return data.length;
      }
      return 0;
    } catch (err) {
      console.error('❌ Supabase fetch contractors error:', err.message);
      return 0;
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('madhuvan_attendance_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      const { migrated, hasChanged } = migrateAttendanceToUUIDs(parsed);
      setContractors(migrated);
      if (hasChanged) {
        console.log('✅ Migrated Attendance IDs to UUID format.');
        localStorage.setItem('madhuvan_attendance_v2', JSON.stringify(migrated));
      }
    }
  }, []);

  useEffect(() => {
    if (mounted && user && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      fetchContractors().then(hasData => {
        const lastSync = localStorage.getItem('attendance_last_full_sync');
        const shouldAutoPush = !hasData || !lastSync || (Date.now() - parseInt(lastSync) > 3600000);
        
        if (shouldAutoPush) {
          console.log('🚀 Automatic background sync (Attendance) triggered.');
          pushAttendanceToSupabase(true);
        }
      });
    }
  }, [mounted, user]);

  const syncContractorToSupabase = async (contractor) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !user) return;
    setIsSyncing(true);
    try {
      // For now, we keep the legacy upsert for the contractor name
      const { error } = await supabase.from('attendance_contractors').upsert({
        id: contractor.id,
        user_id: user.id,
        name: contractor.name
      });
      if (error) throw error;
      console.log(`✅ Synced contractor ${contractor.name}`);
    } catch (err) {
      alert('Sync Error (Contractor): ' + err.message);
      console.error('❌ Supabase sync contractor error:', err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const pushAttendanceToSupabase = async (isSilent = false) => {
    if (!user || !process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    if (!isSilent && !window.confirm('This will push all your current Attendance contractors and staff to the cloud. Continue?')) return;
    
    setIsSyncing(true);
    try {
      let count = 0;
      for (const contractor of contractors) {
        await syncContractorToSupabase(contractor);
        for (const staffMember of (contractor.staff || [])) {
          await syncStaffToSupabase(staffMember, contractor.id);
        }
        await syncRecordsToSupabase(contractor.records || [], contractor.id);
        count++;
      }
      if (!isSilent) alert(`✅ Attendance Sync Complete! ${count} contractors migrated.`);
      localStorage.setItem('attendance_last_full_sync', Date.now().toString());
    } catch (err) {
      if (!isSilent) alert('❌ Sync Error: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncStaffToSupabase = async (staffMember, contractorId) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !user) return;
    try {
      await supabase.from('attendance_staff').upsert({
        id: staffMember.id,
        user_id: user.id,
        contractor_id: contractorId,
        name: staffMember.name
      });
    } catch (err) {
      console.error('Supabase sync staff error:', err.message);
    }
  };

  const syncRecordsToSupabase = async (records, contractorId) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !user) return;
    try {
      const formattedRecords = records.map(r => ({
        id: String(r.id),
        user_id: user.id,
        staff_id: r.staffId,
        contractor_id: contractorId,
        date: r.date,
        status: r.value,
        units: multipliers[r.value] || 0,
        upad: parseFloat(r.upad) || 0,
        remarks: r.remarks || ''
      }));
      await supabase.from('attendance_records').upsert(formattedRecords);
    } catch (err) {
      alert('Sync Error (Records): ' + err.message);
      console.error('Supabase sync records error:', err.message);
    }
  };

  const deleteContractorFromSupabase = async (id) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    try {
      await supabase.from('attendance_contractors').delete().eq('id', id);
    } catch (err) {
      console.error('Supabase delete contractor error:', err.message);
    }
  };

  const deleteStaffFromSupabase = async (id) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    try {
      await supabase.from('attendance_staff').delete().eq('id', id);
    } catch (err) {
      console.error('Supabase delete staff error:', err.message);
    }
  };

  const deleteRecordFromSupabase = async (id) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    try {
      await supabase.from('attendance_records').delete().eq('id', String(id));
    } catch (err) {
      console.error('Supabase delete record error:', err.message);
    }
  };

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('madhuvan_attendance_v2', JSON.stringify(contractors));
    }
  }, [contractors, mounted]);

  const selectedContractor = contractors.find(c => c.id === selectedContractorId);
  const viewingStaff = selectedContractor?.staff.find(s => String(s.id) === String(viewingStaffId));

  // When opening attendance modal, initialize bulk state
  useEffect(() => {
    if (isAttendanceModalOpen && selectedContractor) {
      const initialState = {};
      selectedContractor.staff.forEach(s => {
        initialState[s.id] = { value: 'Full', upad: '', remarks: '' };
      });
      setBulkAttendance(initialState);
    }
  }, [isAttendanceModalOpen, selectedContractorId, selectedContractor]);

  // Handle Contractor list
  const addContractor = (e) => {
    e.preventDefault();
    if (!newContractorName.trim()) return;
    const newC = {
      id: crypto.randomUUID(),
      name: newContractorName.trim(),
      staff: [],
      records: []
    };
    setContractors([...contractors, newC]);
    syncContractorToSupabase(newC);
    setNewContractorName('');
    setIsContractorModalOpen(false);
    setSelectedContractorId(newC.id);
  };

  const deleteContractor = (id) => {
    if (window.confirm('Delete this contractor and all their records?')) {
      setContractors(contractors.filter(c => c.id !== id));
      deleteContractorFromSupabase(id);
      if (selectedContractorId === id) setSelectedContractorId(null);
    }
  };

  // Staff Handlers
  const addStaff = (e) => {
    e.preventDefault();
    if (!newStaffName.trim() || !selectedContractorId) return;
    const updated = contractors.map(c => {
      if (c.id === selectedContractorId) {
        return {
          ...c,
          staff: [...c.staff, { id: crypto.randomUUID(), name: newStaffName.trim() }]
        };
      }
      return c;
    });
    setContractors(updated);
    const updatedContractor = updated.find(c => c.id === selectedContractorId);
    if (updatedContractor) {
      const newStaffMember = updatedContractor.staff[updatedContractor.staff.length - 1];
      syncStaffToSupabase(newStaffMember, selectedContractorId);
    }
    setNewStaffName('');
  };

  const deleteStaff = (staffId) => {
    if (window.confirm('Remove this staff member?')) {
      const updated = contractors.map(c => {
        if (c.id === selectedContractorId) {
          return {
            ...c,
            staff: c.staff.filter(s => s.id !== staffId),
            records: c.records.filter(r => r.staffId !== staffId)
          };
        }
        return c;
      });
      setContractors(updated);
      deleteStaffFromSupabase(staffId);
    }
  };

  // Bulk Attendance Handlers
  const saveBulkAttendance = (e) => {
    e.preventDefault();
    if (!selectedContractorId) return;
    
    const newRecords = Object.entries(bulkAttendance)
      .filter(([_, data]) => data.value !== 'Absent' || data.upad !== '')
      .map(([staffId, data]) => ({
        id: crypto.randomUUID(),
        staffId,
        date: attendanceDate,
        ...data
      }));

    if (newRecords.length === 0) {
      alert("No attendance records to save.");
      return;
    }

    const updated = contractors.map(c => {
      if (c.id === selectedContractorId) {
        return { ...c, records: [...newRecords, ...c.records] };
      }
      return c;
    });
    setContractors(updated);
    syncRecordsToSupabase(newRecords, selectedContractorId);
    
    setIsAttendanceModalOpen(false);
  };


  const deleteRecord = (recordId) => {
    if (window.confirm('Delete this record?')) {
      const updated = contractors.map(c => {
        if (c.id === selectedContractorId) {
          return { ...c, records: c.records.filter(r => r.id !== recordId) };
        }
        return c;
      });
      setContractors(updated);
      deleteRecordFromSupabase(recordId);
    }
  };


  const updateBulkRow = (staffId, field, val) => {
    setBulkAttendance(prev => ({
      ...prev,
      [staffId]: { ...prev[staffId], [field]: val }
    }));
  };

  if (!mounted) return null;

  // Calculate staff summary
  const getStaffSummary = () => {
    if (!selectedContractor) return [];
    let staff = selectedContractor.staff;
    
    // Apply search filter
    if (staffSearchTerm) {
      staff = staff.filter(s => s.name.toLowerCase().includes(staffSearchTerm.toLowerCase()));
    }

    return staff.map(s => {
      const records = selectedContractor.records.filter(r => String(r.staffId) === String(s.id));
      const totalUnits = records.reduce((sum, r) => sum + (multipliers[r.value] || 0), 0);
      const totalUpad = records.reduce((sum, r) => sum + (parseFloat(r.upad) || 0), 0);
      return { ...s, totalUnits, totalUpad, recordCount: records.length };
    });
  };

  const attendanceOptions = [
    { label: 'F', value: 'Full', multiplier: '1.0' },
    { label: '½', value: 'Half', multiplier: '0.5' },
    { label: '1½', value: 'One and Half', multiplier: '1.5' },
    { label: '2', value: 'Two', multiplier: '2.0' },
    { label: 'Abs', value: 'Absent', multiplier: '0' }
  ];

  return (
    <div className="attendance-module-container" style={{ display: 'flex', height: '100vh', background: 'var(--bg-dark)', color: 'white', overflow: 'hidden' }}>
      
      {/* Sidebar - Contractor Navigation */}
      <aside style={{ width: '280px', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ padding: '24px' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer', marginBottom: '20px', fontSize: '0.9rem' }}>← Back</button>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px' }}>Contractors</h2>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
          {contractors.map(c => (
            <div key={c.id} onClick={() => setSelectedContractorId(c.id)} className={selectedContractorId === c.id ? 'active-sidebar-item' : 'sidebar-item'}
              style={{ padding: '12px 16px', borderRadius: '12px', marginBottom: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: selectedContractorId === c.id ? 'var(--primary-gradient)' : 'transparent', transition: 'var(--transition-normal)' }}>
              <span style={{ fontWeight: '600' }}>{c.name}</span>
              <button onClick={(e) => { e.stopPropagation(); deleteContractor(c.id); }} style={{ background: 'none', fontStyle: 'normal', border: 'none', color: 'white', opacity: 0.4, cursor: 'pointer', padding: '4px' }}>🗑️</button>
            </div>
          ))}
        </div>
        <div style={{ padding: '20px' }}>
          <button onClick={() => setIsContractorModalOpen(true)} className="btn btn-primary" style={{ width: '100%', borderRadius: '12px' }}>+ New Contractor</button>
        </div>
      </aside>

      {/* Main Content Area - Staff Summary Dashboard */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', padding: '40px' }}>
        {selectedContractor ? (
          <div className="animate-fade-in" key={selectedContractorId} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h1 style={{ fontSize: '2.4rem', fontWeight: '800' }}>{selectedContractor.name}</h1>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <p style={{ opacity: 0.6 }}>Staff Summary & Payroll Dashboard</p>
                  {isSyncing && (
                    <div style={{ color: '#FFD700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="sync-spinner">🔄</span> Syncing...
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    placeholder="Search staff..." 
                    className="input-field" 
                    style={{ marginBottom: 0, width: '220px', paddingLeft: '35px', height: '48px', fontSize: '0.9rem' }}
                    value={staffSearchTerm}
                    onChange={(e) => setStaffSearchTerm(e.target.value)}
                  />
                <button onClick={() => setStaffSearchTerm(e.target.value)} className="btn-icon" style={{ opacity: 0.4 }}>🔍</button>
                </div>
                <button onClick={() => setIsStaffModalOpen(true)} className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>👥 Manage Staff</button>
                <button onClick={() => setIsAttendanceModalOpen(true)} className="btn btn-primary" style={{ height: '48px', padding: '0 24px' }}>📝 Record Daily Sheet</button>
              </div>
            </div>

            <div className="table-container glass-card shadow-glow" style={{ padding: '0', flex: 1, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                <thead>
                  <tr style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(10, 30, 10, 0.95)', backdropFilter: 'blur(10px)' }}>
                    <th style={{ padding: '16px 24px', width: '30%' }}>Staff Name</th>
                    <th style={{ textAlign: 'center', padding: '16px' }}>Present Days (Units)</th>
                    <th style={{ textAlign: 'center', padding: '16px' }}>Total Upad (₹)</th>
                    <th style={{ textAlign: 'center', padding: '16px' }}>Entries</th>
                    <th style={{ textAlign: 'right', padding: '16px 24px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedContractor.staff.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '60px', opacity: 0.5 }}>No staff in this agency. Add staff to begin.</td></tr>
                  ) : (
                    getStaffSummary().map(summary => (
                      <tr key={summary.id} className="clickable-row" onClick={() => setViewingStaffId(summary.id)} style={{ cursor: 'pointer' }}>
                        <td style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--secondary)' }}>{summary.name}</td>
                        <td style={{ textAlign: 'center', padding: '16px', fontWeight: '700' }}>{summary.totalUnits.toFixed(1)}</td>
                        <td style={{ textAlign: 'center', padding: '16px', fontWeight: '700', color: '#ff9500' }}>₹{summary.totalUpad.toLocaleString()}</td>
                        <td style={{ textAlign: 'center', padding: '16px', opacity: 0.6 }}>{summary.recordCount}</td>
                        <td style={{ textAlign: 'right', padding: '16px 24px' }}>
                          <button className="btn-icon" style={{ opacity: 0.5 }}>📂 View Details ›</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
            <span style={{ fontSize: '4rem' }}>📅</span>
            <h2 style={{ marginTop: '20px' }}>Select a Contractor to view Attendance records</h2>
          </div>
        )}
      </main>

      {/* MODALS */}

      {/* 1. Add Contractor Modal */}
      {isContractorModalOpen && (
        <div className="modal-overlay active" onClick={() => setIsContractorModalOpen(false)}>
          <div className="modal-content glass-card animate-scale-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h2>New Contractor</h2>
            <form onSubmit={addContractor}>
              <div className="form-group">
                <label>Agency Name</label>
                <input type="text" className="input-field" autoFocus required value={newContractorName} onChange={e => setNewContractorName(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add</button>
                <button type="button" onClick={() => setIsContractorModalOpen(false)} className="btn btn-export">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Manage Staff Modal */}
      {isStaffModalOpen && (
        <div className="modal-overlay active" onClick={() => setIsStaffModalOpen(false)}>
          <div className="modal-content glass-card animate-scale-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>Staff Master List</h2>
                <button onClick={() => setIsStaffModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            <form onSubmit={addStaff} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input type="text" className="input-field" placeholder="Full name of worker..." style={{ marginBottom: 0 }} value={newStaffName} onChange={e => setNewStaffName(e.target.value)} />
              <button type="submit" className="btn btn-primary" style={{ minWidth: '80px' }}>Add</button>
            </form>
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              {selectedContractor?.staff.map(s => (
                <div key={s.id} style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>{s.name}</span>
                  <button onClick={() => deleteStaff(s.id)} style={{ background: 'none', border: 'none', color: '#ff453a', opacity: 0.6, cursor: 'pointer' }}>🗑️</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Bulk Sheet Entry Modal */}
      {isAttendanceModalOpen && selectedContractor && (
        <div className="modal-overlay active" onClick={() => setIsAttendanceModalOpen(false)}>
          <div className="modal-content glass-card animate-scale-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '1150px', padding: '0' }}>
            <div style={{ padding: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>Attendance Sheet</h2>
              <input type="date" className="input-field" style={{ width: '160px', marginBottom: 0 }} value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} />
            </div>
            <div style={{ maxHeight: '500px', overflowY: 'auto', padding: '10px 30px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '15px 10px' }}>Staff Name</th>
                    <th style={{ padding: '15px 10px', textAlign: 'center' }}>Attendance Units</th>
                    <th style={{ padding: '15px 10px', width: '120px' }}>Upad (₹)</th>
                    <th style={{ padding: '15px 10px', width: '150px' }}>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedContractor.staff.map(s => {
                    const data = bulkAttendance[s.id] || { value: 'Full', upad: '', remarks: '' };
                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '15px 10px', fontWeight: '600' }}>{s.name}</td>
                        <td style={{ padding: '15px 10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            {attendanceOptions.map(opt => (
                              <label key={opt.value} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', opacity: data.value === opt.value ? 1 : 0.4 }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: data.value === opt.value ? 'var(--secondary)' : 'rgba(255,255,255,0.05)', color: data.value === opt.value ? 'black' : 'white', fontSize: '0.75rem', fontWeight: '800' }}>{opt.label}</div>
                                <input type="radio" style={{ display: 'none' }} checked={data.value === opt.value} onChange={() => updateBulkRow(s.id, 'value', opt.value)} />
                              </label>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '15px 10px' }}><input type="number" className="input-field" placeholder="₹" style={{ marginBottom: 0, padding: '8px' }} value={data.upad} onChange={(e) => updateBulkRow(s.id, 'upad', e.target.value)} /></td>
                        <td style={{ padding: '15px 10px' }}><input type="text" className="input-field" placeholder="..." style={{ marginBottom: 0, padding: '8px' }} value={data.remarks} onChange={(e) => updateBulkRow(s.id, 'remarks', e.target.value)} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '20px 30px 40px', display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsAttendanceModalOpen(false)} className="btn btn-export">Cancel</button>
              <button onClick={saveBulkAttendance} className="btn btn-primary" style={{ minWidth: '180px' }}>💾 Save Day Log</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Individual Staff History Modal */}
      {viewingStaffId && selectedContractor && (
        <div className="modal-overlay active" onClick={() => setViewingStaffId(null)}>
          <div className="modal-content glass-card animate-scale-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '1100px', padding: '0' }}>
            <div style={{ padding: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0 }}>{viewingStaff?.name}</h2>
                    <p style={{ margin: 0, opacity: 0.6, fontSize: '0.9rem' }}>Detailed History Log</p>
                </div>
                <button onClick={() => setViewingStaffId(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            <div style={{ maxHeight: '450px', overflowY: 'auto', padding: '0 30px' }}>
                <table style={{ width: '100%', margin: '20px 0' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', opacity: 0.6, fontSize: '0.85rem' }}>
                            <th style={{ padding: '12px' }}>Date</th>
                            <th style={{ padding: '12px' }}>Status</th>
                            <th style={{ padding: '12px' }}>Units</th>
                            <th style={{ padding: '12px' }}>Upad (₹)</th>
                            <th style={{ padding: '12px' }}>Remarks</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedContractor.records.filter(r => String(r.staffId) === String(viewingStaffId)).map(record => (
                            <tr key={record.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '12px' }}>{new Date(record.date).toLocaleDateString('en-GB')}</td>
                                <td style={{ padding: '12px' }}>{record.value}</td>
                                <td style={{ padding: '12px', fontWeight: 600 }}>× {(multipliers[record.value] || 0).toFixed(1)}</td>
                                <td style={{ padding: '12px', fontWeight: 700, color: '#ff9500' }}>{record.upad ? `₹${record.upad}` : '-'}</td>
                                <td style={{ padding: '12px', opacity: 0.6, fontStyle: 'italic', fontSize: '0.85rem' }}>{record.remarks || '-'}</td>
                                <td style={{ padding: '12px', textAlign: 'right' }}>
                                    <button onClick={() => deleteRecord(record.id)} style={{ background: 'none', border: 'none', color: '#ff453a', cursor: 'pointer', opacity: 0.6 }}>🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div style={{ padding: '20px 30px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                        <span style={{ fontSize: '0.9rem', opacity: 0.6 }}>Total Attendance : </span>
                        <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--secondary)' }}>
                            {selectedContractor.records
                              .filter(r => String(r.staffId) === String(viewingStaffId))
                              .reduce((sum, r) => sum + (multipliers[r.value] || 0), 0)
                              .toFixed(1)}
                        </span>
                    </div>
                    <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }}></div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                        <span style={{ fontSize: '0.9rem', opacity: 0.6 }}>Total Upad : </span>
                        <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ff9500' }}>
                            ₹{selectedContractor.records
                              .filter(r => String(r.staffId) === String(viewingStaffId))
                              .reduce((sum, r) => sum + (parseFloat(r.upad) || 0), 0)
                              .toLocaleString('en-IN')}
                        </span>
                    </div>
                </div>
                <button onClick={() => setViewingStaffId(null)} className="btn btn-primary" style={{ padding: '0 30px' }}>Close History</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .sidebar-item:hover, .clickable-row:hover { background: rgba(255,255,255,0.05) !important; }
        .active-sidebar-item { box-shadow: 0 4px 15px rgba(255,215,0,0.3); }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>

    </div>
  );
};

export default AttendanceModule;
