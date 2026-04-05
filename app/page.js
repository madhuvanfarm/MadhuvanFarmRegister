"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import EntryForm from '../components/EntryForm';
// ... (rest of imports)

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const [activeModule, setActiveModule] = useState(null); // 'sugarcane' or 'attendance'
  
  // State initialization
  const [reminderDays, setReminderDays] = useState(15);
  const [masterData, setMasterData] = useState({
    contractors: [],
    rates: [],
    sugarcaneTypes: [],
    tractorNumbers: []
  });
  const [entries, setEntries] = useState([]);
  const [bijaneApeliEntries, setBijaneApeliEntries] = useState([]);
  const [borrowEntries, setBorrowEntries] = useState([]);
  const [dieselEntries, setDieselEntries] = useState([]);

  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [activeTab, setActiveTab] = useState('Active'); 
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [currentReg, setCurrentReg] = useState('deliveries');
  const [showBillModal, setShowBillModal] = useState(false);
  const [billTarget, setBillTarget] = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    
    const savedReminder = localStorage.getItem('sugarcane_reminder_days');
    if (savedReminder) setReminderDays(parseInt(savedReminder));
    
    const savedMaster = localStorage.getItem('sugarcane_master_data');
    if (savedMaster) setMasterData(JSON.parse(savedMaster));
    
    const savedEntries = localStorage.getItem('sugarcane_entries');
    if (savedEntries) {
      const parsed = JSON.parse(savedEntries);
      setEntries(parsed.map(e => {
        let migrated = { ...e };
        if (migrated.seller && !migrated.firstName) {
          const parts = migrated.seller.split(' ');
          migrated.firstName = parts[0] || '';
          migrated.lastName = parts.slice(1).join(' ') || '';
        }
        migrated.totalWeightKG = parseFloat(migrated.totalWeightKG) || 0;
        migrated.totalAmount = parseFloat(migrated.totalAmount) || 0;
        migrated.totalBijaneApeli = parseFloat(migrated.totalBijaneApeli || migrated.totalLended) || 0;
        if (migrated.contractor === undefined) migrated.contractor = '';
        if (migrated.tractorNumber === undefined) migrated.tractorNumber = '';
        if (migrated.sugarcaneType === undefined) migrated.sugarcaneType = '';
        if (migrated.rate === undefined) migrated.rate = '';
        if (!migrated.deliveryDate) migrated.deliveryDate = new Date().toISOString().split('T')[0];
        return migrated;
      }));
    }
    
    const savedBijane = localStorage.getItem('sugarcane_bijane_apeli_entries') || localStorage.getItem('sugarcane_lender_entries');
    if (savedBijane) setBijaneApeliEntries(JSON.parse(savedBijane).map(e => ({ ...e, entryType: 'bijane_apeli', receiverName: e.receiverName || e.giverName || e.lenderName || '' })));
    
    const savedBorrow = localStorage.getItem('sugarcane_borrow_entries');
    if (savedBorrow) setBorrowEntries(JSON.parse(savedBorrow));

    const savedDiesel = localStorage.getItem('sugarcane_diesel_entries');
    if (savedDiesel) setDieselEntries(JSON.parse(savedDiesel));
  }, []);


  // Save to localStorage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('sugarcane_master_data', JSON.stringify(masterData));
  }, [masterData, mounted]);

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
    localStorage.setItem('sugarcane_reminder_days', reminderDays.toString());
  }, [reminderDays, mounted]);

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
      } else {
        setBijaneApeliEntries([...bijaneApeliEntries, {
          id: Date.now(),
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
        }]);
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
      } else {
        setBorrowEntries([...borrowEntries, {
          id: Date.now(),
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
        }]);
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
      } else {
        setDieselEntries([...dieselEntries, {
          id: Date.now(),
          srNo: dieselEntries.length + 1,
          tractorNumber: data.tractorNumber,
          totalAmount: amount,
          totalLiters: parseFloat(data.liters) || 0,
          status: 'Pending',
          transactions: [{ id: Date.now(), ...data }]
        }]);
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
      } else {
        setEntries([...entries, {
          id: Date.now(),
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
        }]);
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

      const baseInfo = { ...editingAccount, ...data, totalWeightKG: kgWeight, totalAmount: amount, id: Date.now(), status: editingAccount.status || 'Pending' };

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
    setEditingAccount(null);
    setIsModalOpen(false);
  };

  const totalInwardKG = [...entries, ...borrowEntries].reduce((acc, curr) => acc + (parseFloat(curr.totalWeightKG) || 0), 0);
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
      if (currentReg === 'deliveries') setEntries(entries.filter(e => e.id !== id).map((e, index) => ({ ...e, srNo: index + 1 })));
      else if (currentReg === 'bijane_apeli' || currentReg === 'lending') setBijaneApeliEntries(bijaneApeliEntries.filter(e => e.id !== id).map((e, index) => ({ ...e, srNo: index + 1 })));
      else if (currentReg === 'diesel') setDieselEntries(dieselEntries.filter(e => e.id !== id).map((e, index) => ({ ...e, srNo: index + 1 })));
      else setBorrowEntries(borrowEntries.filter(e => e.id !== id).map((e, index) => ({ ...e, srNo: index + 1 })));
    }

  };
  const markPaid = (id) => {
    setEntries(entries.map(e => e.id === id ? { ...e, status: 'Paid', doneDate: null } : e));
    setBijaneApeliEntries(bijaneApeliEntries.map(l => l.id === id ? { ...l, status: 'Paid', doneDate: null } : l));
    setBorrowEntries(borrowEntries.map(b => b.id === id ? { ...b, status: 'Paid', doneDate: null } : b));
    setDieselEntries(dieselEntries.map(d => d.id === id ? { ...d, status: 'Paid', doneDate: null } : d));
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
    setDieselEntries(update);
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
    setDieselEntries(update);
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
        onUpdateMasterData={setMasterData} 
        onExportFiltered={() => {}} 
        onLogout={handleLogout} 
        onChangeModule={() => setActiveModule(null)} 
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
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
              totalDieselExpense: dieselEntries.reduce((acc, curr) => acc + (parseFloat(curr.totalAmount) || 0), 0)
            }} 
          />
        </div>
      </div>
    </div>
  );
}
