import React, { useState } from 'react';

const EntryForm = ({ isOpen, onClose, onSubmit, sellers = [], initialData = null, masterData = { contractors: [], rates: [], sugarcaneTypes: [], tractorNumbers: [] }, mode = 'deliveries' }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    village: '',
    weight: '',
    unit: 'Tons',
    contractor: '',
    tractorNumber: '',
    sugarcaneType: '',
    rate: '',
    amount: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    entryType: mode === 'lending' ? 'bijane_apeli' : (mode || 'deliveries'),
    receiverName: '',
    pumpName: '',
    liters: '',
    remark: ''
  });



  // Populate form when initialData is provided (Edit Mode)
  React.useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        village: initialData.village || '',
        weight: initialData.weight || '',
        unit: initialData.unit || 'Tons',
        contractor: initialData.contractor || '',
        tractorNumber: initialData.tractorNumber || '',
        sugarcaneType: initialData.sugarcaneType || '',
        rate: initialData.rate || '',
        amount: initialData.amount || '',
        deliveryDate: initialData.deliveryDate || new Date().toISOString().split('T')[0],
        entryType: initialData.entryType === 'lending' ? 'bijane_apeli' : (initialData.entryType || mode || 'deliveries'),
        receiverName: initialData.receiverName || initialData.giverName || initialData.lenderName || '',
        pumpName: initialData.pumpName || '',
        liters: initialData.liters || '',
        remark: initialData.remark || ''
      });


    } else {
      setFormData({
        firstName: '',
        lastName: '',
        village: '',
        weight: '',
        unit: 'Tons',
        contractor: '',
        tractorNumber: '',
        sugarcaneType: '',
        rate: '',
        amount: '',
        deliveryDate: new Date().toISOString().split('T')[0],
        entryType: mode === 'lending' ? 'bijane_apeli' : (mode || 'deliveries'),
        receiverName: ''
      });
    }
  }, [initialData, isOpen, mode]);

  // Auto-calculate amount based on weight and rate
  React.useEffect(() => {
    if (formData.entryType !== 'diesel' && formData.weight && formData.rate) {
      const calculated = parseFloat(formData.weight) * parseFloat(formData.rate);
      setFormData(prev => ({ ...prev, amount: calculated.toFixed(0) }));
    }
  }, [formData.weight, formData.rate, formData.entryType]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isExistingSeller = sellers.some(s => 
    s.firstName.toLowerCase() === formData.firstName.toLowerCase() && 
    s.lastName.toLowerCase() === formData.lastName.toLowerCase() && 
    (s.village || '').toLowerCase() === (formData.village || '').toLowerCase()
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.entryType !== 'diesel') {
      if (!formData.firstName || !formData.lastName || !formData.weight || !formData.amount) {
        alert('Please fill in all fields (Name, Surname, and Weight are required)');
        return;
      }
    } else {
      if (!formData.tractorNumber || !formData.amount) {
        alert('Please select a Tractor and enter the Total Amount');
        return;
      }
    }

    onSubmit(formData);
    setFormData({
      firstName: '',
      lastName: '',
      village: '',
      weight: '',
      unit: 'Tons',
      contractor: '',
      tractorNumber: '',
      sugarcaneType: '',
      rate: '',
      amount: '',
      deliveryDate: new Date().toISOString().split('T')[0],
      entryType: mode === 'lending' ? 'bijane_apeli' : (mode || 'deliveries'),
      receiverName: '',
      remark: ''
    });
    onClose();
  };


  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="glass-card modal-content" onClick={e => e.stopPropagation()}>
        <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--secondary)' }}>
            {initialData ? 'Edit Record' : (formData.entryType === 'bijane_apeli' || formData.entryType === 'lending') ? 'New BIJANE APELI Entry' : 'New Delivery Entry'}
          </h2>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}
          >
            &times;
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          {/* Type Selector */}
          {!initialData && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, entryType: 'borrowing' }))}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: formData.entryType === 'borrowing' ? '2px solid #FF453A' : '1px solid var(--glass-border)',
                  background: formData.entryType === 'borrowing' ? 'rgba(255, 69, 58, 0.1)' : 'transparent',
                  color: formData.entryType === 'borrowing' ? '#FF453A' : 'var(--text-secondary)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                📉 Bijethi Lidhel
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, entryType: 'deliveries' }))}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: formData.entryType === 'deliveries' ? '2px solid #4CAF50' : '1px solid var(--glass-border)',
                  background: formData.entryType === 'deliveries' ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                  color: formData.entryType === 'deliveries' ? '#4CAF50' : 'var(--text-secondary)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                🌿 Delivery (Inward)
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, entryType: 'bijane_apeli' }))}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: (formData.entryType === 'bijane_apeli' || formData.entryType === 'lending') ? '2px solid #FFD700' : '1px solid var(--glass-border)',
                  background: (formData.entryType === 'bijane_apeli' || formData.entryType === 'lending') ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                  color: (formData.entryType === 'bijane_apeli' || formData.entryType === 'lending') ? '#FFD700' : 'var(--text-secondary)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                🤝 BIJANE APELI
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, entryType: 'diesel' }))}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: formData.entryType === 'diesel' ? '2px solid #4CAF50' : '1px solid var(--glass-border)',
                  background: formData.entryType === 'diesel' ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                  color: formData.entryType === 'diesel' ? '#4CAF50' : 'var(--text-secondary)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ⛽ Diesel (Expense)
              </button>
            </div>
          )}
          {/* Landscape Grid Rows */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${ (formData.entryType === 'bijane_apeli' || formData.entryType === 'lending' || formData.entryType === 'borrowing' || formData.entryType === 'diesel') ? '5' : '4'}, 1fr)`, gap: '20px', marginBottom: '20px' }}>
            {formData.entryType !== 'diesel' ? (
              <>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">First Name</label>
                  <input 
                    type="text" 
                    name="firstName"
                    value={formData.firstName || ''}
                    onChange={handleChange}
                    className="input-field" 
                    placeholder="Name"
                    autoComplete="off"
                    list="name-options"
                    required
                    style={isExistingSeller ? { borderColor: 'var(--secondary)', boxShadow: '0 0 10px rgba(255, 215, 0, 0.2)' } : {}}
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Surname</label>
                  <input 
                    type="text" 
                    name="lastName"
                    value={formData.lastName || ''}
                    onChange={handleChange}
                    className="input-field" 
                    placeholder="Surname"
                    autoComplete="off"
                    list="surname-options"
                    required
                    style={isExistingSeller ? { borderColor: 'var(--secondary)', boxShadow: '0 0 10px rgba(255, 215, 0, 0.2)' } : {}}
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Village</label>
                  <input 
                    type="text" 
                    name="village"
                    value={formData.village || ''}
                    onChange={handleChange}
                    className="input-field" 
                    placeholder="Village"
                    required={!isExistingSeller}
                  />
                </div>
              </>
            ) : (
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Record Date</label>
                  <input 
                    type="date" 
                    name="deliveryDate"
                    value={formData.deliveryDate || ''}
                    onChange={handleChange}
                    className="input-field" 
                    required
                  />
                </div>
            )}

             {formData.entryType !== 'diesel' && (
               <div className="input-group" style={{ marginBottom: 0 }}>
                 <label className="input-label">Contractor</label>
                 <select 
                   name="contractor"
                   value={formData.contractor || ''}
                   onChange={handleChange}
                   className="input-field"
                 >
                   <option value="">Select Contractor</option>
                   {masterData.contractors.map((c, i) => (
                     <option key={i} value={c}>{c}</option>
                   ))}
                   {formData.contractor && !masterData.contractors.includes(formData.contractor) && (
                     <option value={formData.contractor}>{formData.contractor} (Current)</option>
                   )}
                 </select>
               </div>
             )}

             {(formData.entryType === 'bijane_apeli' || formData.entryType === 'lending' || formData.entryType === 'borrowing') && (
               <div className="input-group" style={{ marginBottom: 0 }}>
                 <label className="input-label">Receiver / Payer Name</label>
                 <input 
                   type="text"
                   name="receiverName"
                   value={formData.receiverName || ''}
                   onChange={handleChange}
                   className="input-field"
                   placeholder="Who is receiving/paying?"
                 />
               </div>
             )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '20px' }}>
            {formData.entryType !== 'diesel' && (
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Sugarcane Type</label>
                 <select 
                   name="sugarcaneType"
                   value={formData.sugarcaneType || ''}
                   onChange={handleChange}
                   className="input-field"
                 >
                   <option value="">Select Type</option>
                   {masterData.sugarcaneTypes.map((t, i) => (
                     <option key={i} value={t}>{t}</option>
                   ))}
                   {formData.sugarcaneType && !masterData.sugarcaneTypes.includes(formData.sugarcaneType) && (
                     <option value={formData.sugarcaneType}>{formData.sugarcaneType}</option>
                   )}
                 </select>
              </div>
            )}
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Tractor Number</label>
               <select 
                 name="tractorNumber"
                 value={formData.tractorNumber || ''}
                 onChange={handleChange}
                 className="input-field"
               >
                 <option value="">Select Tractor</option>
                 {masterData.tractorNumbers.map((tn, i) => (
                   <option key={i} value={tn}>{tn}</option>
                 ))}
                 {formData.tractorNumber && !masterData.tractorNumbers.includes(formData.tractorNumber) && (
                   <option value={formData.tractorNumber}>{formData.tractorNumber}</option>
                 )}
               </select>
            </div>
            {formData.entryType !== 'diesel' && (
              <>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Rate (₹ / {formData.unit})</label>
                  <select 
                    name="rate"
                    value={formData.rate || ''}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select Rate</option>
                    {masterData.rates.map((r, i) => (
                      <option key={i} value={r}>₹ {r}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Record Date</label>
                  <input 
                    type="date" 
                    name="deliveryDate"
                    value={formData.deliveryDate || ''}
                    onChange={handleChange}
                    className="input-field" 
                    required
                  />
                </div>
              </>
            )}
          </div>


          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
            {formData.entryType !== 'diesel' && (
              <>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Weight</label>
                  <input 
                    type="number" 
                    name="weight"
                    step="0.01"
                    value={formData.weight || ''}
                    onChange={handleChange}
                    className="input-field" 
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Unit</label>
                  <select 
                    name="unit"
                    value={formData.unit || 'Tons'}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="Tons">Tons</option>
                    <option value="Quintals">Quintals</option>
                    <option value="KG">KG</option>
                  </select>
                </div>
              </>
            )}

            <div className="input-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
              <label className="input-label">Remark (Optional)</label>
              <input 
                type="text" 
                name="remark"
                value={formData.remark || ''}
                onChange={handleChange}
                className="input-field" 
                placeholder="Example: Bharat Petroleum, Extra Tank, etc."
              />
            </div>
            <div className="input-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
              <label className="input-label">Total Amount (₹)</label>
              <input 
                type="number" 
                name="amount"
                step="1"
                value={formData.amount || ''}
                onChange={handleChange}
                className="input-field" 
                placeholder="Final Amount ₹"
                required
                style={{ fontWeight: '700', fontSize: '1.2rem', color: 'var(--secondary)' }}
              />
            </div>
          </div>


          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px', height: '54px' }}>
            {initialData ? 'Save Changes' : 'Add Entry'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EntryForm;
