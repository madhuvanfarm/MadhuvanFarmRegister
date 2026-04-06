"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import CloudDiagnostics from '../components/CloudDiagnostics';
import { supabase } from '../lib/supabase';
import EntryForm from '../components/EntryForm';
import Login from '../components/Login';
import ModuleSelection from '../components/ModuleSelection';
import AttendanceModule from '../components/AttendanceModule';
import Sidebar from '../components/Sidebar';
import EntryList from '../components/EntryList';
import EntryDetailModal from '../components/EntryDetailModal';
import BillModal from '../components/BillModal';
import NotificationCenter from '../components/NotificationCenter';
import SummaryModal from '../components/SummaryModal';
export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const [activeModule, setActiveModule] = useState(null); // 'sugarcane' or 'attendance'
  
  // Persist active module choice
  useEffect(() => {
    if (mounted) {
      const savedModule = localStorage.getItem('madhuvan_active_module');
      if (savedModule) setActiveModule(savedModule);
    }
  }, [mounted]);

  useEffect(() => {
    if (mounted && activeModule) {
      localStorage.setItem('madhuvan_active_module', activeModule);
    } else if (mounted && !activeModule) {
      localStorage.removeItem('madhuvan_active_module');
    }
  }, [activeModule, mounted]);
  
  // State initialization
  const [reminderDays, setReminderDays] = useState(15);
  const [masterData, setMasterData] = useState({
    contractors: [],
    rates: [],
    sugarcaneTypes: [],
    tractorNumbers: []
  });

  const updateMasterData = (newData) => {
    setMasterData(newData);
    syncMasterDataToSupabase(newData);
  };
  const [entries, setEntries] = useState([]);
  const [bijaneApeliEntries, setBijaneApeliEntries] = useState([]);
  const [borrowEntries, setBorrowEntries] = useState([]);
  const [dieselEntries, setDieselEntries] = useState([]);

  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [activeTab, setActiveTab] = useState('Active'); 
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [syncLogs, setSyncLogs] = useState([]);
  const addSyncLog = (msg, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setSyncLogs(prev => [{ time, msg, type }, ...prev].slice(0, 20)); // Keep last 20
  };

  const [cloudCounts, setCloudCounts] = useState({
    deliveries: 0,
    lending: 0,
    borrowing: 0,
    diesel: 0,
    master: 0
  });
  const [showSummary, setShowSummary] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [currentReg, setCurrentReg] = useState('deliveries');
  const [showBillModal, setShowBillModal] = useState(false);
  const [billTarget, setBillTarget] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudStatus, setCloudStatus] = useState('Checking...');
  useEffect(() => {
    setMounted(true);
    const savedReminder = localStorage.getItem('sugarcane_reminder_days');
    if (savedReminder) setReminderDays(parseInt(savedReminder));
    
    // Immediate UI from localStorage
    const savedEntries = localStorage.getItem('sugarcane_entries');
    if (savedEntries) setEntries(JSON.parse(savedEntries));
    
    const savedBijane = localStorage.getItem('sugarcane_bijane_apeli_entries');
    if (savedBijane) setBijaneApeliEntries(JSON.parse(savedBijane));
    
    const savedBorrow = localStorage.getItem('sugarcane_borrow_entries');
    if (savedBorrow) setBorrowEntries(JSON.parse(savedBorrow));

    const savedDiesel = localStorage.getItem('sugarcane_diesel_entries');
    if (savedDiesel) setDieselEntries(JSON.parse(savedDiesel));

    const savedMaster = localStorage.getItem('sugarcane_master_data');
    if (savedMaster) setMasterData(JSON.parse(savedMaster));
  }, []);


  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('sugarcane_reminder_days', reminderDays.toString());
  }, [reminderDays, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('sugarcane_entries', JSON.stringify(entries));
  }, [entries, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('sugarcane_bijane_apeli_entries', JSON.stringify(bijaneApeliEntries));
  }, [bijaneApeliEntries, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('sugarcane_borrow_entries', JSON.stringify(borrowEntries));
  }, [borrowEntries, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('sugarcane_diesel_entries', JSON.stringify(dieselEntries));
  }, [dieselEntries, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('sugarcane_master_data', JSON.stringify(masterData));
    
    // Automate sync for dropdown lists (Master Data)
    if (user && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      syncMasterDataToSupabase(masterData);
    }
  }, [masterData, mounted, user]);

  const syncToSupabase = async (table, entry) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !user) return;
    setIsSyncing(true);
    try {
      let payload = {
        id: entry.id,
        user_id: user.id,
        sr_no: entry.srNo || entry.sr_no,
        status: entry.status || 'Pending',
        transactions: entry.transactions || [],
        total_amount: parseFloat(entry.totalAmount) || 0,
        done_date: entry.doneDate || null,
        reminder_days: entry.reminderDays || 15
      };

      if (table === 'diesel_entries' || table === 'diesel') {
        payload = {
          ...payload,
          tractor_number: entry.tractorNumber,
          total_liters: parseFloat(entry.totalLiters) || 0
        };
        const { error } = await supabase.from('diesel_entries').upsert(payload);
        if (error) throw error;
      } else {
        payload = {
          ...payload,
          first_name: entry.firstName,
          last_name: entry.lastName,
          village: entry.village,
          total_weight_kg: parseFloat(entry.totalWeightKG) || 0,
          unit: entry.unit,
          contractor: entry.contractor,
          tractor_number: entry.tractorNumber,
          sugarcane_type: entry.sugarcaneType,
          rate: parseFloat(entry.rate) || 0
        };

        // Only deliveries table has the total_bijane_apeli (Advance) column
        if (table === 'deliveries') {
          payload.total_bijane_apeli = parseFloat(entry.totalBijaneApeli || entry.totalLended) || 0;
        }

        if (table !== 'deliveries') {
          payload.receiver_name = entry.receiverName;
        }

        const { error } = await supabase.from(table).upsert(payload);
        if (error) throw error;
        addSyncLog(`Synced record to ${table}`);
      }
      console.log(`✅ Synced to ${table} successfully`);
    } catch (err) {
      console.error(`❌ Supabase sync error (${table}):`, err.message);
      addSyncLog(`Sync ERROR (${table}): ${err.message}`, 'error');
      setCloudStatus('Error');
      alert(`Sync Failed for ${table}: ` + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteFromSupabase = async (table, id) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    try {
      await supabase.from(table).delete().eq('id', id);
    } catch (err) {
      console.error(`Supabase delete error (${table}):`, err.message);
    }
  };

  const syncMasterDataToSupabase = async (data) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !user) return;
    try {
      await supabase.from('master_data').upsert({ key: 'sugarcane_master', user_id: user.id, data });
      addSyncLog('Synced Master Data to cloud');
    } catch (err) {
      console.error('Supabase master sync error:', err.message);
      addSyncLog(`Master Sync ERROR: ${err.message}`, 'error');
    }
  };

  const pushLocalToSupabase = async (isSilent = false, overrideData = null) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    if (!isSilent && !window.confirm('This will push all your LOCAL data to CLOUD Supabase. It will overwrite cloud records with matching IDs. Continue?')) return;
    
    try {
      const dataToPush = overrideData || {
        entries,
        bijane: bijaneApeliEntries,
        borrow: borrowEntries,
        diesel: dieselEntries,
        master: masterData
      };

      let count = 0;
      addSyncLog(`Starting background push of local data...`);
      // 1. Deliveries
      for (const e of dataToPush.entries) { await syncToSupabase('deliveries', e); count++; }
      // 2. Lending
      for (const e of dataToPush.bijane) { await syncToSupabase('lending', e); count++; }
      // 3. Borrowing
      for (const e of dataToPush.borrow) { await syncToSupabase('borrowing', e); count++; }
      // 4. Diesel
      for (const e of dataToPush.diesel) { await syncToSupabase('diesel_entries', e); count++; }
      // 5. Master Data
      if (dataToPush.master) await syncMasterDataToSupabase(dataToPush.master);
      
      if (!isSilent) alert(`✅ Migration Complete! ${count} records synchronized with Supabase.`);
      
      // Always refresh local state once pushed
      fetchAllFromSupabase();
      localStorage.setItem('sugarcane_last_full_sync', Date.now().toString());
    } catch (err) {
      if (!isSilent) alert('❌ Error pushing data: ' + err.message);
    }
  };

  const fetchAllFromSupabase = async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !user) return;
    setIsSyncing(true);
    let hasData = false;
    
    try {
      // 1. Deliveries
      try {
        const { data: deliv, error: drr } = await supabase.from('deliveries').select('*').eq('user_id', user.id).order('sr_no');
        if (drr) throw drr;
        if (deliv && deliv.length > 0) {
          setEntries(deliv.map(d => ({ ...d, firstName: d.first_name, lastName: d.last_name, totalWeightKG: d.total_weight_kg, totalAmount: d.total_amount, totalBijaneApeli: d.total_bijane_apeli, srNo: d.sr_no, doneDate: d.done_date, reminderDays: d.reminder_days })));
          hasData = true;
          setCloudCounts(prev => ({ ...prev, deliveries: deliv.length }));
        } else {
          setCloudCounts(prev => ({ ...prev, deliveries: 0 }));
        }
      } catch (err) { console.error('❌ Supabase fetch deliveries error:', err.message); }

      // 2. Lending
      try {
        const { data: lend, error: lrr } = await supabase.from('lending').select('*').eq('user_id', user.id).order('sr_no');
        if (lrr) throw lrr;
        if (lend && lend.length > 0) {
          setBijaneApeliEntries(lend.map(d => ({ ...d, firstName: d.first_name, lastName: d.last_name, totalWeightKG: d.total_weight_kg, totalAmount: d.total_amount, srNo: d.sr_no, doneDate: d.done_date, reminderDays: d.reminder_days })));
          hasData = true;
          setCloudCounts(prev => ({ ...prev, lending: lend.length }));
        } else {
          setCloudCounts(prev => ({ ...prev, lending: 0 }));
        }
      } catch (err) { console.error('❌ Supabase fetch lending error:', err.message); }

      // 3. Borrowing
      try {
        const { data: borr, error: brr } = await supabase.from('borrowing').select('*').eq('user_id', user.id).order('sr_no');
        if (brr) throw brr;
        if (borr && borr.length > 0) {
          setBorrowEntries(borr.map(d => ({ ...d, firstName: d.first_name, lastName: d.last_name, totalWeightKG: d.total_weight_kg, totalAmount: d.total_amount, srNo: d.sr_no, doneDate: d.done_date, reminderDays: d.reminder_days })));
          hasData = true;
          setCloudCounts(prev => ({ ...prev, borrowing: borr.length }));
        } else {
          setCloudCounts(prev => ({ ...prev, borrowing: 0 }));
        }
      } catch (err) { console.error('❌ Supabase fetch borrowing error:', err.message); }

      // 4. Master Data
      try {
        const { data: master, error: mrr } = await supabase.from('master_data').select('*').eq('key', 'sugarcane_master').eq('user_id', user.id).single();
        if (mrr && mrr.code !== 'PGRST116') throw mrr;
        if (master?.data) {
          setMasterData(master.data);
          hasData = true;
          setCloudCounts(prev => ({ ...prev, master: 1 }));
        } else {
          setCloudCounts(prev => ({ ...prev, master: 0 }));
        }
      } catch (err) { console.error('❌ Supabase fetch master error:', err.message); }
      
      // 5. Diesel Entries
      try {
        const { data: diesel, error: dsrr } = await supabase.from('diesel_entries').select('*').eq('user_id', user.id).order('sr_no');
        if (dsrr) throw dsrr;
        if (diesel && diesel.length > 0) {
          setDieselEntries(diesel.map(d => ({ ...d, tractorNumber: d.tractor_number, totalLiters: d.total_liters, totalAmount: d.total_amount, srNo: d.sr_no, doneDate: d.done_date, reminderDays: d.reminder_days })));
          hasData = true;
          setCloudCounts(prev => ({ ...prev, diesel: diesel.length }));
        } else {
          setCloudCounts(prev => ({ ...prev, diesel: 0 }));
        }
      } catch (err) { console.error('❌ Supabase fetch diesel error:', err.message); }

      console.log('✅ Background cloud sync complete.');
      setCloudStatus('Connected');
      return hasData;
    } catch (err) {
      console.error('❌ Critical Supabase fetch error:', err.message);
      setCloudStatus('Error');
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (mounted && user) {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setCloudStatus('Connecting...');
        fetchAllFromSupabase().then(hasCloudData => {
          // If the cloud is empty OR it's been more than 1 hour, perform an auto-push
          const lastSync = localStorage.getItem('sugarcane_last_full_sync');
          const shouldAutoPush = !hasCloudData || !lastSync || (Date.now() - parseInt(lastSync) > 3600000);
          
          if (shouldAutoPush) {
            console.log('🚀 Automatic background sync (local -> cloud) triggered.');
            pushLocalToSupabase(true);
          }
        });
      } else {
        setCloudStatus('Local Only');
      }
    }
  }, [mounted, user]);

  // Sync selectedEntry
  useEffect(() => {
    if (selectedEntry && mounted) {
      const all = [...entries, ...bijaneApeliEntries, ...borrowEntries];
      const found = all.find(e => e.id === selectedEntry.id);
      if (found && found !== selectedEntry) {
        setSelectedEntry(found);
      } else if (!found) {
        setSelectedEntry(null);
      }
    }
  }, [entries, bijaneApeliEntries, borrowEntries, mounted]);

  const addEntry = (data) => {
    const toKG = (w, u) => {
      if (u === 'Tons') return parseFloat(w) * 1000;
      if (u === 'Quintals') return parseFloat(w) * 100;
      return parseFloat(w);
    };

    const kgWeight = toKG(data.weight, data.unit);
    const amount = parseFloat(data.amount);
    const targetType = data.entryType || currentReg;

    if (targetType === 'bijane_apeli' || targetType === 'lending') {
      const existingIndex = bijaneApeliEntries.findIndex(l => 
        (l.firstName || '').toLowerCase() === (data.firstName || '').toLowerCase() &&
        (l.lastName || '').toLowerCase() === (data.lastName || '').toLowerCase() &&
        (l.village || '').toLowerCase() === (data.village || '').toLowerCase()
      );

      if (existingIndex !== -1) {
        const updated = [...bijaneApeliEntries];
        updated[existingIndex] = {
          ...updated[existingIndex],
          totalWeightKG: (updated[existingIndex].totalWeightKG || 0) + kgWeight,
          totalAmount: (updated[existingIndex].totalAmount || 0) + amount,
          unit: data.unit,
          contractor: data.contractor,
          tractorNumber: data.tractorNumber,
          sugarcaneType: data.sugarcaneType,
          rate: data.rate,
          receiverName: data.receiverName || '',
          transactions: [...(updated[existingIndex].transactions || []), { id: Date.now(), ...data, weight: parseFloat(data.weight) }]
        };
        setBijaneApeliEntries(updated);
        syncToSupabase('lending', updated[existingIndex]);
      } else {
        const newEntry = {
          id: crypto.randomUUID(),
          srNo: bijaneApeliEntries.length + 1,
          firstName: data.firstName,
          lastName: data.lastName,
          village: data.village,
          totalWeightKG: kgWeight,
          totalAmount: amount,
          unit: data.unit,
          contractor: data.contractor,
          tractorNumber: data.tractorNumber,
          sugarcaneType: data.sugarcaneType,
          rate: data.rate,
          receiverName: data.receiverName || '',
          status: 'Pending',
          transactions: [{ id: Date.now(), ...data, weight: parseFloat(data.weight) }]
        };
        setBijaneApeliEntries([...bijaneApeliEntries, newEntry]);
        syncToSupabase('lending', newEntry);
      }
    } else if (targetType === 'borrowing') {
      const existingIndex = borrowEntries.findIndex(b => 
        (b.firstName || '').toLowerCase() === (data.firstName || '').toLowerCase() &&
        (b.lastName || '').toLowerCase() === (data.lastName || '').toLowerCase() &&
        (b.village || '').toLowerCase() === (data.village || '').toLowerCase()
      );

      if (existingIndex !== -1) {
        const updated = [...borrowEntries];
        updated[existingIndex] = {
          ...updated[existingIndex],
          totalWeightKG: (updated[existingIndex].totalWeightKG || 0) + kgWeight,
          totalAmount: (updated[existingIndex].totalAmount || 0) + amount,
          unit: data.unit,
          contractor: data.contractor,
          tractorNumber: data.tractorNumber,
          sugarcaneType: data.sugarcaneType,
          rate: data.rate,
          receiverName: data.receiverName || '',
          transactions: [...(updated[existingIndex].transactions || []), { id: Date.now(), ...data, weight: parseFloat(data.weight) }]
        };
        setBorrowEntries(updated);
        syncToSupabase('borrowing', updated[existingIndex]);
      } else {
        const newEntry = {
          id: crypto.randomUUID(),
          srNo: borrowEntries.length + 1,
          firstName: data.firstName,
          lastName: data.lastName,
          village: data.village,
          totalWeightKG: kgWeight,
          totalAmount: amount,
          unit: data.unit,
          contractor: data.contractor,
          tractorNumber: data.tractorNumber,
          sugarcaneType: data.sugarcaneType,
          rate: data.rate,
          receiverName: data.receiverName || '',
          status: 'Pending',
          transactions: [{ id: Date.now(), ...data, weight: parseFloat(data.weight) }]
        };
        setBorrowEntries([...borrowEntries, newEntry]);
        syncToSupabase('borrowing', newEntry);
      }
    } else if (targetType === 'diesel') {
      const existingIndex = dieselEntries.findIndex(d => 
        (d.tractorNumber || '').toLowerCase() === (data.tractorNumber || '').toLowerCase()
      );

      if (existingIndex !== -1) {
        const updated = [...dieselEntries];
        updated[existingIndex] = {
          ...updated[existingIndex],
          totalAmount: (updated[existingIndex].totalAmount || 0) + amount,
          totalLiters: (updated[existingIndex].totalLiters || 0) + (parseFloat(data.liters) || 0),
          transactions: [...(updated[existingIndex].transactions || []), { id: Date.now(), ...data }]
        };
        setDieselEntries(updated);
        syncToSupabase('diesel_entries', { ...updated[existingIndex], tractorNumber: updated[existingIndex].tractorNumber, totalLiters: updated[existingIndex].totalLiters }); // Custom mapping if needed or just use raw
        // Wait, diesel has different fields (liters). I should probably use a separate helper or fix syncToSupabase.
        // Actually, syncToSupabase is tailored for sugarcane.
      } else {
        const newEntry = {
          id: crypto.randomUUID(),
          srNo: dieselEntries.length + 1,
          tractorNumber: data.tractorNumber,
          totalAmount: amount,
          totalLiters: parseFloat(data.liters) || 0,
          status: 'Pending',
          transactions: [{ id: Date.now(), ...data }]
        };
        setDieselEntries([...dieselEntries, newEntry]);
        // saveDieselToSupabase was deleted in favor of syncToSupabase.
        // Let's use a specific call for diesel.
        syncToSupabase('diesel_entries', newEntry);
      }
    } else {
      const existingIndex = entries.findIndex(e => 
        (e.firstName || '').toLowerCase() === (data.firstName || '').toLowerCase() &&
        (e.lastName || '').toLowerCase() === (data.lastName || '').toLowerCase() &&
        (e.village || '').toLowerCase() === (data.village || '').toLowerCase()
      );

      if (existingIndex !== -1) {
        const updated = [...entries];
        updated[existingIndex] = {
          ...updated[existingIndex],
          totalWeightKG: (updated[existingIndex].totalWeightKG || 0) + kgWeight,
          totalAmount: (updated[existingIndex].totalAmount || 0) + amount,
          village: data.village,
          unit: data.unit,
          contractor: data.contractor,
          tractorNumber: data.tractorNumber,
          sugarcaneType: data.sugarcaneType,
          rate: data.rate,
          receiverName: data.receiverName || '',
          transactions: [...(updated[existingIndex].transactions || []), { id: Date.now(), ...data, weight: parseFloat(data.weight) }]
        };
        setEntries(updated);
        syncToSupabase('deliveries', updated[existingIndex]);
      } else {
        const newEntry = {
          id: crypto.randomUUID(),
          srNo: entries.length + 1,
          firstName: data.firstName,
          lastName: data.lastName,
          village: data.village,
          totalWeightKG: kgWeight,
          totalAmount: amount,
          totalBijaneApeli: 0,
          unit: data.unit,
          contractor: data.contractor,
          tractorNumber: data.tractorNumber,
          sugarcaneType: data.sugarcaneType,
          rate: data.rate,
          receiverName: data.receiverName || '',
          status: 'Pending',
          transactions: [{ id: Date.now(), ...data, weight: parseFloat(data.weight) }]
        };
        setEntries([...entries, newEntry]);
        syncToSupabase('deliveries', newEntry);
      }
    }
    setIsModalOpen(false);
  };

  const updateAccount = (data) => {
    const toKG = (w, u) => {
      if (u === 'Tons') return parseFloat(w) * 1000;
      if (u === 'Quintals') return parseFloat(w) * 100;
      return parseFloat(w);
    };

    const kgWeight = toKG(data.weight, data.unit);
    const amount = parseFloat(data.amount);
    const targetType = data.entryType || currentReg;
    
    let originalType = 'deliveries';
    if (bijaneApeliEntries.some(e => e.id === editingAccount.id)) originalType = 'bijane_apeli';
    else if (borrowEntries.some(e => e.id === editingAccount.id)) originalType = 'borrowing';
    else if (dieselEntries.some(e => e.id === editingAccount.id)) originalType = 'diesel';


    let updatedEntry = null;

    if (targetType !== originalType) {
      if (originalType === 'deliveries') setEntries(entries.filter(e => e.id !== editingAccount.id));
      else if (originalType === 'bijane_apeli') setBijaneApeliEntries(bijaneApeliEntries.filter(e => e.id !== editingAccount.id));
      else setBorrowEntries(borrowEntries.filter(e => e.id !== editingAccount.id));

      const baseInfo = { ...editingAccount, ...data, totalWeightKG: kgWeight, totalAmount: amount, id: crypto.randomUUID(), status: editingAccount.status || 'Pending' };

      if (targetType === 'deliveries') {
        updatedEntry = { ...baseInfo, srNo: entries.length + 1 };
        setEntries([...entries, updatedEntry]);
      } else if (targetType === 'bijane_apeli' || targetType === 'lending') {
        updatedEntry = { ...baseInfo, srNo: bijaneApeliEntries.length + 1 };
        setBijaneApeliEntries([...bijaneApeliEntries, updatedEntry]);
      } else if (targetType === 'diesel') {
        updatedEntry = { ...baseInfo, srNo: dieselEntries.length + 1 };
        setDieselEntries([...dieselEntries, updatedEntry]);
      } else {
        updatedEntry = { ...baseInfo, srNo: borrowEntries.length + 1 };
        setBorrowEntries([...borrowEntries, updatedEntry]);
      }
    } else {
      if (targetType === 'bijane_apeli' || targetType === 'lending') {
        setBijaneApeliEntries(bijaneApeliEntries.map(l => {
          if (l.id === editingAccount.id) {
            updatedEntry = { ...l, ...data, totalWeightKG: kgWeight, totalAmount: amount };
            return updatedEntry;
          }
          return l;
        }));
      } else if (targetType === 'borrowing') {
        setBorrowEntries(borrowEntries.map(b => {
          if (b.id === editingAccount.id) {
            updatedEntry = { ...b, ...data, totalWeightKG: kgWeight, totalAmount: amount };
            return updatedEntry;
          }
          return b;
        }));
      } else if (targetType === 'diesel') {
        setDieselEntries(dieselEntries.map(d => {
          if (d.id === editingAccount.id) {
            updatedEntry = { ...d, ...data, totalAmount: amount };
            return updatedEntry;
          }
          return d;
        }));
      } else {
        setEntries(entries.map(e => {
          if (e.id === editingAccount.id) {
            updatedEntry = { ...e, ...data, totalWeightKG: kgWeight, totalAmount: amount };
            return updatedEntry;
          }
          return e;
        }));
      }

    }
    
    if (updatedEntry && selectedEntry && selectedEntry.id === editingAccount.id) {
      setSelectedEntry(updatedEntry);
    }
    if (updatedEntry) {
      const tableMap = {
        'deliveries': 'deliveries',
        'bijane_apeli': 'lending',
        'lending': 'lending',
        'borrowing': 'borrowing',
        'diesel': 'diesel_entries'
      };
      const table = tableMap[targetType];
      if (table) syncToSupabase(table, updatedEntry);
    }
    setEditingAccount(null);
    setIsModalOpen(false);
  };


  const totalInwardKG = [...entries, ...borrowEntries, ...bijaneApeliEntries].reduce((acc, curr) => acc + (parseFloat(curr.totalWeightKG) || 0), 0);
  const totalOutwardKG = bijaneApeliEntries.reduce((acc, curr) => acc + (parseFloat(curr.totalWeightKG) || 0), 0);
  const formatTons = (kg) => (kg / 1000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const globalStats = {
    inwardTons: formatTons(totalInwardKG),
    outwardTons: formatTons(totalOutwardKG),
    balanceTons: formatTons(totalInwardKG - totalOutwardKG),
    deliveryTons: formatTons(entries.reduce((acc, curr) => acc + (parseFloat(curr.totalWeightKG) || 0), 0)),
    borrowTons: formatTons(borrowEntries.reduce((acc, curr) => acc + (parseFloat(curr.totalWeightKG) || 0), 0))
  };

  const openEditModal = (account) => {
    const fromKG = (kg, unit) => {
      if (unit === 'Tons') return (kg / 1000).toFixed(2);
      if (unit === 'Quintals') return (kg / 100).toFixed(2);
      return kg.toFixed(2);
    };
    setEditingAccount({ ...account, weight: fromKG(account.totalWeightKG, account.unit), amount: account.totalAmount, entryType: currentReg });
    setIsModalOpen(true);
  };

  const deleteEntry = (id) => {
    if (window.confirm('Are you sure?')) {
      if (currentReg === 'deliveries') {
        setEntries(entries.filter(e => e.id !== id).map((e, index) => ({ ...e, srNo: index + 1 })));
        deleteFromSupabase('deliveries', id);
      }
      else if (currentReg === 'bijane_apeli' || currentReg === 'lending') {
        setBijaneApeliEntries(bijaneApeliEntries.filter(e => e.id !== id).map((e, index) => ({ ...e, srNo: index + 1 })));
        deleteFromSupabase('lending', id);
      }
      else if (currentReg === 'diesel') {
        setDieselEntries(dieselEntries.filter(e => e.id !== id).map((e, index) => ({ ...e, srNo: index + 1 })));
        deleteFromSupabase('diesel_entries', id);
      }
      else {
        setBorrowEntries(borrowEntries.filter(e => e.id !== id).map((e, index) => ({ ...e, srNo: index + 1 })));
        deleteFromSupabase('borrowing', id);
      }
    }

  };
  const markPaid = (id) => {
    setEntries(entries.map(e => e.id === id ? { ...e, status: 'Paid', doneDate: null } : e));
    setBijaneApeliEntries(bijaneApeliEntries.map(l => l.id === id ? { ...l, status: 'Paid', doneDate: null } : l));
    setBorrowEntries(borrowEntries.map(b => b.id === id ? { ...b, status: 'Paid', doneDate: null } : b));
    setDieselEntries(dieselEntries.map(d => {
      if (d.id === id) {
        const updated = { ...d, status: 'Paid', doneDate: null };
        syncToSupabase('diesel_entries', updated);
        return updated;
      }
      return d;
    }));
    // Sync other types too
    const ent = entries.find(e => e.id === id);
    if (ent) syncToSupabase('deliveries', { ...ent, status: 'Paid', doneDate: null });
    const lend = bijaneApeliEntries.find(e => e.id === id);
    if (lend) syncToSupabase('lending', { ...lend, status: 'Paid', doneDate: null });
    const borr = borrowEntries.find(e => e.id === id);
    if (borr) syncToSupabase('borrowing', { ...borr, status: 'Paid', doneDate: null });
  };


  const lendMoney = (id, amount) => {
    const upadTx = { 
      id: Date.now(), 
      amount: parseFloat(amount), 
      deliveryDate: new Date().toISOString().split('T')[0], 
      entryType: 'upad', 
      remark: 'Advance (Upad) Given' 
    };

    const update = prev => prev.map(e => {
      if (e.id === id) {
        return { 
          ...e, 
          totalBijaneApeli: (e.totalBijaneApeli || 0) + parseFloat(amount),
          transactions: [...(e.transactions || []), upadTx]
        };
      }
      return e;
    });

    setEntries(update);
    setBijaneApeliEntries(update);
    setBorrowEntries(update);
    setDieselEntries(prev => prev.map(e => {
      if (e.id === id) {
        const updated = { 
          ...e, 
          totalBijaneApeli: (e.totalBijaneApeli || 0) + parseFloat(amount),
          transactions: [...(e.transactions || []), upadTx]
        };
        syncToSupabase('diesel_entries', updated);
        return updated;
      }
      return e;
    }));

    // Sync others
    const ent = entries.find(e => e.id === id);
    if (ent) syncToSupabase('deliveries', { ...ent, totalBijaneApeli: (ent.totalBijaneApeli || 0) + parseFloat(amount), transactions: [...(ent.transactions || []), upadTx] });
    const lend = bijaneApeliEntries.find(e => e.id === id);
    if (lend) syncToSupabase('lending', { ...lend, totalBijaneApeli: (lend.totalBijaneApeli || 0) + parseFloat(amount), transactions: [...(lend.transactions || []), upadTx] });
    const borr = borrowEntries.find(e => e.id === id);
    if (borr) syncToSupabase('borrowing', { ...borr, totalBijaneApeli: (borr.totalBijaneApeli || 0) + parseFloat(amount), transactions: [...(borr.transactions || []), upadTx] });
  };



  const toggleStatus = (id, customDays) => {
    const update = (prev) => prev.map(e => {
      if (e.id === id) {
        let newStatus = e.status === 'Done' ? 'Pending' : 'Done';
        return { 
          ...e, 
          status: newStatus,
          doneDate: newStatus === 'Done' ? Date.now() : null,
          reminderDays: newStatus === 'Done' ? (customDays !== undefined ? parseInt(customDays) : 15) : (e.reminderDays || 15)
        };
      }
      return e;
    });
    setEntries(update);
    setBijaneApeliEntries(update);
    setBorrowEntries(update);
    setDieselEntries(prev => prev.map(e => {
      if (e.id === id) {
        let newStatus = e.status === 'Done' ? 'Pending' : 'Done';
        const updated = { 
          ...e, 
          status: newStatus,
          doneDate: newStatus === 'Done' ? Date.now() : null,
          reminderDays: newStatus === 'Done' ? (customDays !== undefined ? parseInt(customDays) : 15) : (e.reminderDays || 15)
        };
        syncToSupabase('diesel_entries', updated);
        return updated;
      }
      return e;
    }));

    // Sync others
    const ent = entries.find(e => e.id === id);
    if (ent) {
        let newStatus = ent.status === 'Done' ? 'Pending' : 'Done';
        syncToSupabase('deliveries', { ...ent, status: newStatus, doneDate: newStatus === 'Done' ? Date.now() : null, reminderDays: newStatus === 'Done' ? (customDays !== undefined ? parseInt(customDays) : 15) : (ent.reminderDays || 15) });
    }
  };

  const exportToExcel = () => {
    const activeEntries = currentReg === 'bijane_apeli' || currentReg === 'lending' ? bijaneApeliEntries : 
                         currentReg === 'borrowing' ? borrowEntries : 
                         currentReg === 'diesel' ? dieselEntries : entries;
    
    if (activeEntries.length === 0) {
      alert('No data to export');
      return;
    }

    const fromKG = (kg, unit) => {
      if (unit === 'Tons') return (kg / 1000).toFixed(2);
      if (unit === 'Quintals') return (kg / 100).toFixed(2);
      return kg.toFixed(2);
    };

    const headers = ['Sr No', 'Date', 'First Name', 'Last Name', 'Village', 'Contractor', 'Tractor No', 'Type', 'Rate', 'Total Weight', 'Unit', 'Gross Amount (₹)', 'Upad Amount (₹)', 'Net Amount (₹)', 'Status'];
    
    // Prepare raw data rows
    const dataRows = activeEntries.map(e => {
      const gross = parseFloat(e.totalAmount) || 0;
      const upad = parseFloat(e.totalBijaneApeli || e.totalLended) || 0;
      return [
        String(e.srNo || ''),
        e.deliveryDate || new Date().toISOString().split('T')[0],
        e.firstName || '',
        e.lastName || '',
        e.village || 'N/A',
        e.contractor || 'N/A',
        e.tractorNumber || 'N/A',
        e.sugarcaneType || 'N/A',
        String(e.rate || '0'),
        fromKG(e.totalWeightKG || 0, e.unit || 'Tons'),
        e.unit || 'Tons',
        String(gross),
        String(upad),
        String(gross - upad),
        e.status || 'Pending'
      ];
    });

    // Calculate max width for each column to "justify" spaces
    const colWidths = headers.map((h, i) => {
      const maxDataWidth = Math.max(...dataRows.map(row => String(row[i]).length));
      return Math.max(h.length, maxDataWidth) + 2; // Add 2 extra spaces for breathing room
    });

    // Helper to pad strings
    const pad = (str, width) => String(str).padEnd(width, ' ');

    // Format headers and rows with padding and quotes to prevent Excel errors
    const formattedHeaders = headers.map((h, i) => `"${pad(h, colWidths[i])}"`).join(',');
    const formattedRows = dataRows.map(row => 
      row.map((cell, i) => `"${pad(cell, colWidths[i])}"`).join(',')
    );

    const csvContent = [
      formattedHeaders,
      ...formattedRows
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.body.appendChild(document.createElement('a'));
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `MADHUVAN_FARM_${currentReg}_${new Date().toLocaleDateString()}.csv`;
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportAccountHistory = (account) => {
    const headers = ['Date', 'Weight', 'Unit', 'Amount (₹)'];
    const dataRows = (account.transactions || []).map(t => [
      t.date || new Date(t.id).toLocaleDateString(),
      String(t.weight),
      t.unit,
      String(t.amount)
    ]);

    if (dataRows.length === 0) {
      alert('No history found');
      return;
    }

    // Calculate max width for each column to "justify" spaces
    const colWidths = headers.map((h, i) => {
      const maxDataWidth = Math.max(...dataRows.map(row => String(row[i]).length));
      return Math.max(h.length, maxDataWidth) + 2;
    });

    const pad = (str, width) => String(str).padEnd(width, ' ');

    // Format headers and rows with padding and quotes to prevent Excel errors
    const formattedHeaders = headers.map((h, i) => `"${pad(h, colWidths[i])}"`).join(',');
    const formattedRows = dataRows.map(row => 
      row.map((cell, i) => `"${pad(cell, colWidths[i])}"`).join(',')
    );

    const csvContent = [
      formattedHeaders,
      ...formattedRows
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.body.appendChild(document.createElement('a'));
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${account.firstName}_${account.lastName}_History.csv`;
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getConsolidatedMasterData = () => {
    const map = new Map();
    
    // Process Deliveries
    entries.forEach(e => {
      const key = `${(e.firstName || '').toLowerCase()}|${(e.lastName || '').toLowerCase()}|${(e.village || '').toLowerCase()}`;
      if (!map.has(key)) {
        map.set(key, {
          id: `master-${e.id}`,
          firstName: e.firstName,
          lastName: e.lastName,
          village: e.village,
          totalDeliveries: 0,
          totalInternalUpad: 0,
          totalBijaneApeli: 0,
          totalWeightKG: 0,
          unit: 'Tons',
          status: 'Active',
          isMaster: true,
          transactions: []
        });
      }
      const master = map.get(key);
      master.totalDeliveries += (parseFloat(e.totalAmount) || 0);
      master.totalInternalUpad += (parseFloat(e.totalBijaneApeli || e.totalLended) || 0);
      master.totalWeightKG += (parseFloat(e.totalWeightKG) || 0);
      master.transactions.push(...(e.transactions || []).map(t => ({ ...t, type: 'Delivery' })));
    });

    // Process Bijane Apeli
    bijaneApeliEntries.forEach(e => {
      const key = `${(e.firstName || '').toLowerCase()}|${(e.lastName || '').toLowerCase()}|${(e.village || '').toLowerCase()}`;
      if (!map.has(key)) {
        map.set(key, {
          id: `master-${e.id}`,
          firstName: e.firstName,
          lastName: e.lastName,
          village: e.village,
          totalDeliveries: 0,
          totalInternalUpad: 0,
          totalBijaneApeli: 0,
          totalWeightKG: 0,
          unit: 'Tons',
          status: 'Active',
          isMaster: true,
          transactions: []
        });
      }
      const master = map.get(key);
      master.totalBijaneApeli += (parseFloat(e.totalAmount) || 0);
      // We also track Upads inside Bijane entries if any
      master.totalInternalUpad += (parseFloat(e.totalBijaneApeli || e.totalLended) || 0);
      master.totalWeightKG += (parseFloat(e.totalWeightKG) || 0);
      master.transactions.push(...(e.transactions || []).map(t => ({ ...t, type: 'BIJANE APELI' })));
    });

    return Array.from(map.values()).map((m, i) => ({
      ...m,
      srNo: i + 1,
      totalAmount: (m.totalDeliveries || 0) + (m.totalBijaneApeli || 0) - (m.totalInternalUpad || 0)
    }));
  };

  const exportMasterDataHistory = () => {
    const list = getConsolidatedMasterData();
    if (list.length === 0) {
      alert('No master data to export');
      return;
    }

    const headers = ['Sr No', 'Type', 'Date', 'First Name', 'Last Name', 'Village', 'Contractor', 'Tractor No', 'S.Type', 'Weight', 'Unit', 'Rate', 'Amount (₹)'];
    
    // Flatten all transactions for all masters
    const dataRows = [];
    list.forEach(m => {
      (m.transactions || []).forEach(t => {
        dataRows.push([
          String(m.srNo),
          t.type || 'N/A',
          t.deliveryDate || t.date || new Date(t.id).toLocaleDateString(),
          m.firstName,
          m.lastName,
          m.village,
          t.contractor || 'N/A',
          t.tractorNumber || 'N/A',
          t.sugarcaneType || 'N/A',
          String(t.weight || '0'),
          t.unit || 'Tons',
          String(t.rate || '0'),
          String(t.amount || '0')
        ]);
      });
    });

    const colWidths = headers.map((h, i) => {
      const maxDataWidth = Math.max(...dataRows.map(row => String(row[i]).length), 0);
      return Math.max(h.length, maxDataWidth) + 2;
    });

    const pad = (str, width) => String(str).padEnd(width, ' ');
    const formattedHeaders = headers.map((h, i) => `"${pad(h, colWidths[i])}"`).join(',');
    const formattedRows = dataRows.map(row => row.map((cell, i) => `"${pad(cell, colWidths[i])}"`).join(','));

    const csvContent = [formattedHeaders, ...formattedRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.body.appendChild(document.createElement('a'));
    link.href = URL.createObjectURL(blob);
    link.download = `MADHUVAN_FARM_MASTER_TRANSACTIONS_${new Date().toLocaleDateString()}.csv`;
    link.click();
    document.body.removeChild(link);
  };

  const handleViewBill = (account) => {
    setBillTarget(account);
    setShowBillModal(true);
  };

  const overdueEntries = mounted ? [
    ...entries.map(e => ({ ...e, source: 'Delivery' })), 
    ...bijaneApeliEntries.map(e => ({ ...e, source: 'BIJANE APELI' })), 
    ...borrowEntries.map(e => ({ ...e, source: 'Bijethi Lidhel' }))
  ].filter(e => {
    if (e.status !== 'Done' || !e.doneDate) return false;
    const daysDiff = (Date.now() - e.doneDate) / (1000 * 60 * 60 * 24);
    const threshold = typeof e.reminderDays === 'number' ? e.reminderDays : 15;
    return daysDiff >= threshold;
  }) : [];

  if (!mounted) return <div style={{ background: '#051605', height: '100vh' }}></div>;

  if (!user) {
    return <Login />;
  }

  if (!activeModule) {
    return <ModuleSelection 
      onSelect={setActiveModule} 
      onLogout={() => {
        setIsAuthorized(false);
        sessionStorage.removeItem('madhuvan_auth');
      }} 
    />;
  }

  if (activeModule === 'attendance') {
    return <AttendanceModule onBack={() => setActiveModule(null)} />;
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to end your session?')) {
      logout();
      setActiveModule(null);
    }
  };

  return (
    <div className="app-wrapper" style={{ background: 'var(--bg-dark)', display: 'flex', minHeight: '100vh' }}>
      <Sidebar 
        currentReg={currentReg} 
        onRegChange={setCurrentReg} 
        masterData={masterData} 
        onUpdateMasterData={updateMasterData} 
        onExportFiltered={() => {}} 
        onLogout={handleLogout} 
        onChangeModule={() => setActiveModule(null)} 
        onMigrateToCloud={() => {}} // Disabled as it is now automated
      />
      <div className="main-content" style={{ flex: 1, marginLeft: '280px', padding: '20px' }}>
        <div className="container" style={{ maxWidth: '1600px', margin: '0 auto' }}>
          <header className="animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '700', background: 'linear-gradient(135deg, #FFD700, #4CAF50)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {currentReg === 'bijane_apeli' || currentReg === 'lending' ? 'BIJANE APELI' : currentReg === 'borrowing' ? 'Bijethi Lidhel Register' : currentReg === 'master_data' ? 'MASTER DATA ACCOUNT' : 'MADHUVAN FARM'}
              </h1>
              <p style={{ color: 'var(--primary-light)', marginTop: '8px', opacity: 0.8 }}>
                {currentReg === 'bijane_apeli' || currentReg === 'lending' ? 'Seller Management' : currentReg === 'borrowing' ? 'Bijethi Lidhel Source Management' : currentReg === 'master_data' ? 'Consolidated Farmer/Seller Records' : 'MADHUVAN FARM | Sugarcane Entry Register'}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div 
                onClick={() => setIsDiagnosticsOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', color: cloudStatus === 'Connected' ? '#4CAF50' : cloudStatus === 'Error' ? '#ff453a' : '#FFD700', fontSize: '0.8rem', opacity: 0.8, cursor: 'help' }} 
                title={cloudStatus === 'Local Only' ? 'Credentials missing in .env.local - Working in LOCAL mode.' : `Sync Health: ${cloudStatus} (Click for Diagnostics)`}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cloudStatus === 'Connected' ? '#4CAF50' : cloudStatus === 'Error' ? '#ff453a' : '#FFD700' }}></span>
                {cloudStatus}
              </div>
              {isSyncing && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFD700', fontSize: '0.8rem', opacity: 0.8 }}>
                  <span className="sync-spinner" style={{ 
                    display: 'inline-block', 
                    animation: 'spin 1.5s linear infinite'
                  }}>🔄</span>
                  Syncing...
                </div>
              )}
              <CloudStatusIndicator 
                status={cloudStatus} 
                onClick={() => setIsDiagnosticsOpen(true)} 
              />
              <button className="btn export-btn" onClick={() => setShowSummary(true)} style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', height: '50px' }}>📊 Dashboard Summary</button>
              <div 
                onClick={() => setShowNotifications(true)} 
                className="bell-icon" 
                style={{ 
                  cursor: 'pointer', 
                  fontSize: '24px', 
                  position: 'relative',
                  background: 'rgba(255, 255, 255, 0.05)', 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '1px solid var(--glass-border)',
                  transition: 'all 0.3s ease'
                }}
              >
                🔔
                {overdueEntries.length > 0 && (
                  <span style={{ 
                    position: 'absolute', 
                    top: '-5px', 
                    right: '-5px', 
                    background: '#ff453a', 
                    color: 'white', 
                    borderRadius: '50%', 
                    width: '24px', 
                    height: '24px', 
                    fontSize: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: '700',
                    border: '2px solid var(--bg-dark)'
                  }}>
                    {overdueEntries.length}
                  </span>
                )}
              </div>
            </div>
          </header>

          <main className="animate-fade-in">
            <EntryList 
              entries={currentReg === 'bijane_apeli' || currentReg === 'lending' ? bijaneApeliEntries : currentReg === 'borrowing' ? borrowEntries : currentReg === 'master_data' ? getConsolidatedMasterData() : currentReg === 'diesel' ? dieselEntries : entries} 
              activeTab={activeTab} onTabChange={setActiveTab} mode={currentReg} onDelete={deleteEntry} onEdit={openEditModal} 
              onToggleStatus={toggleStatus} onMarkPaid={markPaid} onLendMoney={lendMoney} onExport={exportToExcel} 
              onExportMasterHistory={exportMasterDataHistory}
              onExportHistory={exportAccountHistory} onSelectEntry={setSelectedEntry}
              onViewBill={handleViewBill}
            />
          </main>

          <button className="btn btn-primary btn-floating" onClick={() => { setEditingAccount(null); setIsModalOpen(true); }}>+</button>

          <EntryForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={editingAccount ? updateAccount : addEntry} 
            sellers={[]} initialData={editingAccount} masterData={masterData} mode={currentReg} />

          <EntryDetailModal isOpen={!!selectedEntry} onClose={() => setSelectedEntry(null)} entry={selectedEntry} 
            onDelete={deleteEntry} onEdit={openEditModal} onToggleStatus={toggleStatus} onMarkPaid={markPaid} onLendMoney={lendMoney} onExportHistory={exportAccountHistory} mode={currentReg} />

          <BillModal isOpen={showBillModal} onClose={() => setShowBillModal(false)} entry={billTarget} />

          <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} overdueRecords={overdueEntries} onMarkPaid={markPaid} />
          
          <SummaryModal 
            isOpen={showSummary} 
            onClose={() => setShowSummary(false)} 
            stats={globalStats} 
            counts={{ 
              deliveries: entries.length, 
              bijane_apeli: bijaneApeliEntries.length, 
              borrowing: borrowEntries.length,
              totalDelivered: entries.length + bijaneApeliEntries.length + borrowEntries.length,
              diesel: dieselEntries.length
            }} 
            financial={{
              deliveryNet: entries.filter(e => e.status !== 'Paid').reduce((acc, curr) => acc + (parseFloat(curr.totalAmount) || 0) - (parseFloat(curr.totalBijaneApeli || curr.totalLended) || 0), 0),
              borrowDues: borrowEntries.filter(e => e.status !== 'Paid').reduce((acc, curr) => acc + (parseFloat(curr.totalAmount) || 0) - (parseFloat(curr.totalBijaneApeli || curr.totalLended) || 0), 0),
              totalBijaneApeli: (
                entries.reduce((acc, curr) => acc + (parseFloat(curr.totalBijaneApeli || curr.totalLended) || 0), 0) + 
                bijaneApeliEntries.filter(e => e.status !== 'Paid').reduce((acc, curr) => acc + (parseFloat(curr.totalAmount) || 0), 0) +
                bijaneApeliEntries.reduce((acc, curr) => acc + (parseFloat(curr.totalBijaneApeli || curr.totalLended) || 0), 0) +
                borrowEntries.reduce((acc, curr) => acc + (parseFloat(curr.totalBijaneApeli || curr.totalLended) || 0), 0)
              ),
              bijaneApeliRegisterAmount: bijaneApeliEntries.filter(e => e.status !== 'Paid').reduce((acc, curr) => acc + (parseFloat(curr.totalAmount) || 0), 0),
              deliveryAdvance: entries.reduce((acc, curr) => acc + (parseFloat(curr.totalBijaneApeli || curr.totalLended) || 0), 0),
              totalDieselExpense: dieselEntries.reduce((acc, curr) => acc + (parseFloat(curr.totalAmount) || 0) || 0, 0)
            }} 
          />

          <CloudDiagnostics 
            isOpen={isDiagnosticsOpen}
            onClose={() => setIsDiagnosticsOpen(false)}
            user={user}
            cloudStatus={cloudStatus}
            counts={cloudCounts}
            logs={syncLogs}
          />
        </div>
      </div>
    </div>
  );
}

const CloudStatusIndicator = ({ status, onClick }) => {
  const color = status === 'Connected' ? '#34c759' : status === 'Error' ? '#ff453a' : '#ff9500';
  return (
    <div 
      onClick={onClick} 
      style={{ 
        cursor: 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        padding: '10px 15px', 
        background: 'rgba(255,255,255,0.05)', 
        borderRadius: '10px', 
        border: '1px solid var(--glass-border)',
        transition: 'all 0.2s ease'
      }}
      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
      onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
    >
      <div style={{ 
        width: '8px', 
        height: '8px', 
        borderRadius: '50%', 
        background: color, 
        boxShadow: `0 0 10px ${color}`,
        animation: status === 'Syncing' ? 'pulse 1.5s infinite' : 'none'
      }}></div>
      <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'white', letterSpacing: '0.5px' }}>
        {status === 'Connected' ? 'CONNECTED' : (status === 'Error' || status === 'Sync Error') ? 'SYNC ERROR' : 'SYNCING...'}
      </span>
    </div>
  );
};
