import React from 'react';

const BillModal = ({ isOpen, onClose, entry }) => {
  if (!isOpen || !entry) return null;

  // Helper for Number to Words (Indian Format)
  const numberToWords = (num) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function inWords(n) {
      if ((n = n.toString()).length > 9) return 'Overflow';
      let nArray = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
      if (!nArray) return '';
      let str = '';
      str += (Number(nArray[1]) !== 0) ? (a[Number(nArray[1])] || b[nArray[1][0]] + ' ' + a[nArray[1][1]]) + 'Crore ' : '';
      str += (Number(nArray[2]) !== 0) ? (a[Number(nArray[2])] || b[nArray[2][0]] + ' ' + a[nArray[2][1]]) + 'Lakh ' : '';
      str += (Number(nArray[3]) !== 0) ? (a[Number(nArray[3])] || b[nArray[3][0]] + ' ' + a[nArray[3][1]]) + 'Thousand ' : '';
      str += (Number(nArray[4]) !== 0) ? (a[Number(nArray[4])] || b[nArray[4][0]] + ' ' + a[nArray[4][1]]) + 'Hundred ' : '';
      str += (Number(nArray[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(nArray[5])] || b[nArray[5][0]] + ' ' + a[nArray[5][1]]) : '';
      return str.trim();
    }
    
    const words = inWords(Math.floor(num));
    return words ? words + ' Only' : 'Zero Only';
  };

  const handlePrint = () => {
    window.print();
  };

  const deliveryAmount = parseFloat(entry.totalDeliveries || 0);
  const bijaneApeliAmount = parseFloat(entry.totalBijaneApeli || 0);
  const upadAmount = parseFloat(entry.totalInternalUpad || 0);
  
  // Taxable Amount is the sum of business contributions (before deductions)
  const taxableAmount = deliveryAmount + bijaneApeliAmount;
  const grandTotal = taxableAmount - upadAmount;

  const weight = (parseFloat(entry.totalWeightKG) || 0) / 1000;
  // Calculate average rate based on combined taxable amount
  const rate = weight > 0 ? (taxableAmount / weight) : 0;

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} style={{ zIndex: 3000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }} onClick={onClose}>
      <div className="modal-content bill-modal" onClick={(e) => e.stopPropagation()} style={{ 
        width: '900px', 
        maxWidth: '95vw', 
        background: 'white', 
        color: '#333', 
        padding: '0', 
        borderRadius: '0',
        overflowY: 'auto',
        maxHeight: '90vh',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}>
        
        {/* Controls - Hidden during print */}
        <div style={{ padding: '15px 30px', background: '#f8f9fa', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="no-print">
          <h3 style={{ margin: 0, color: '#444' }}>Print Preview</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handlePrint} className="btn" style={{ background: '#4CAF50', color: 'white', padding: '8px 20px' }}>🖨️ Print Bill</button>
            <button onClick={onClose} className="btn" style={{ background: '#666', color: 'white', padding: '8px 20px' }}>Close</button>
          </div>
        </div>

        {/* The Bill Content */}
        <div id="printable-bill" style={{ padding: '30px', fontFamily: '"Arial", sans-serif' }}>
          
          <div style={{ border: '2px solid #000', padding: '0' }}>
            
            {/* Main Header */}
            <div style={{ textAlign: 'center', borderBottom: '1px solid #000', padding: '10px' }}>
              <h1 style={{ margin: '0', fontSize: '28px', fontWeight: '800', letterSpacing: '1px' }}>MADHUVAN FARM</h1>
              <p style={{ margin: '5px 0', fontSize: '13px' }}>1, VILLAGE GAMTALAV, GAMTALAV KURD, MANDVI, SURAT - 394160</p>
              <p style={{ margin: '2px 0', fontSize: '13px' }}>M : 7016687499, EMAIL : vadikrutik525@gmail.com</p>
            </div>

            {/* Bill Sub-Header */}
            <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
              <div style={{ flex: 1, padding: '5px 10px', fontWeight: '700', fontSize: '14px' }}>Debit Memo</div>
              <div style={{ flex: 2, textAlign: 'center', borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '5px', fontWeight: '800', fontSize: '14px' }}>PURC. BILL</div>
              <div style={{ flex: 1, textAlign: 'right', padding: '5px 10px', fontWeight: '700', fontSize: '14px' }}>Original</div>
            </div>

            {/* Customer & Bill Meta Info */}
            <div style={{ display: 'flex', borderBottom: '1px solid #000', minHeight: '100px' }}>
              <div style={{ flex: 3, padding: '10px', fontSize: '14px' }}>
                <div style={{ marginBottom: '15px' }}>
                  <span style={{ fontWeight: '700' }}>M/s. : </span>
                  <span style={{ fontSize: '16px', fontWeight: '800', textTransform: 'uppercase' }}>{entry.firstName} {entry.lastName}</span>
                </div>
                <div style={{ fontWeight: '700', marginTop: '20px' }}>
                  {entry.village.toUpperCase()} - 394160
                </div>
                <div style={{ fontWeight: '700', marginTop: '5px' }}>Mo. : </div>
              </div>
              <div style={{ flex: 2, borderLeft: '1px solid #000' }}>
                <div style={{ padding: '8px 10px', borderBottom: '1px solid #000', fontSize: '14px' }}>
                  <span style={{ fontWeight: '700' }}>Bill No. : </span> {entry.srNo || '106'}
                </div>
                <div style={{ padding: '8px 10px', borderBottom: '1px solid #000', fontSize: '14px' }}>
                  <span style={{ fontWeight: '700' }}>Date &nbsp;&nbsp;&nbsp;&nbsp; : </span> {new Date().toLocaleDateString('en-GB')}
                </div>
                <div style={{ minHeight: '40px' }}></div>
              </div>
            </div>

            {/* Bill Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#fff', textAlign: 'center' }}>
                  <th style={{ borderBottom: '1px solid #000', borderRight: '1px solid #000', padding: '5px', width: '40px' }}>Sr.</th>
                  <th style={{ borderBottom: '1px solid #000', borderRight: '1px solid #000', padding: '5px', textAlign: 'left' }}>Product Name</th>
                  <th style={{ borderBottom: '1px solid #000', borderRight: '1px solid #000', padding: '5px', width: '80px' }}>HSN/SAC Code</th>
                  <th style={{ borderBottom: '1px solid #000', borderRight: '1px solid #000', padding: '5px', width: '60px' }}>Qty</th>
                  <th style={{ borderBottom: '1px solid #000', borderRight: '1px solid #000', padding: '5px', width: '80px' }}>Rate</th>
                  <th style={{ borderBottom: '1px solid #000', borderRight: '1px solid #000', padding: '5px', width: '90px' }}>Taxable Amount</th>
                  <th style={{ borderBottom: '1px solid #000', borderRight: '1px solid #000', padding: '5px', width: '40px' }}>GST %</th>
                  <th style={{ borderBottom: '1px solid #000', borderRight: '1px solid #000', padding: '5px', width: '100px' }}>Tax Amount</th>
                  <th style={{ borderBottom: '1px solid #000', padding: '5px', width: '100px' }}>Net Amount</th>
                </tr>
              </thead>
              <tbody style={{ minHeight: '250px' }}>
                <tr style={{ height: '250px', verticalAlign: 'top' }}>
                  <td style={{ borderRight: '1px solid #000', padding: '10px', textAlign: 'center' }}>1</td>
                  <td style={{ borderRight: '1px solid #000', padding: '10px' }}>sugarcane.</td>
                  <td style={{ borderRight: '1px solid #000', padding: '10px' }}></td>
                  <td style={{ borderRight: '1px solid #000', padding: '10px', textAlign: 'right' }}>{weight.toFixed(3)}</td>
                  <td style={{ borderRight: '1px solid #000', padding: '10px', textAlign: 'right' }}>{(parseFloat(entry.rate) || rate).toFixed(2)}</td>
                  <td style={{ borderRight: '1px solid #000', padding: '10px', textAlign: 'right' }}>{taxableAmount.toFixed(2)}</td>
                  <td style={{ borderRight: '1px solid #000', padding: '10px', textAlign: 'center' }}></td>
                  <td style={{ borderRight: '1px solid #000', padding: '10px' }}></td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>{taxableAmount.toFixed(2)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr style={{ fontWeight: '700' }}>
                  <td colSpan="5" style={{ borderTop: '2px solid #000', borderRight: '1px solid #000', padding: '5px', textAlign: 'right' }}>Total</td>
                  <td style={{ borderTop: '2px solid #000', borderRight: '1px solid #000', padding: '5px', textAlign: 'right' }}>{taxableAmount.toFixed(2)}</td>
                  <td style={{ borderTop: '2px solid #000', borderRight: '1px solid #000' }}></td>
                  <td style={{ borderTop: '2px solid #000', borderRight: '1px solid #000' }}></td>
                  <td style={{ borderTop: '2px solid #000', padding: '5px', textAlign: 'right' }}>{taxableAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            {/* Bottom Section */}
            <div style={{ display: 'flex', borderTop: '1px solid #000' }}>
              <div style={{ flex: 3, padding: '10px' }}>
                <div style={{ marginBottom: '10px', fontSize: '13px' }}>
                  <span style={{ fontWeight: '700' }}>GSTIN No. : </span> 24AHBPV9744N1ZL
                </div>
                <div style={{ marginBottom: '10px', fontSize: '13px' }}>
                  <span style={{ fontWeight: '700' }}>Total GST : </span>
                </div>
                <div style={{ marginBottom: '10px', fontSize: '14px' }}>
                  <span style={{ fontWeight: '700' }}>Bill Amount : </span> 
                  <span style={{ fontStyle: 'italic', marginLeft: '10px' }}>{numberToWords(grandTotal)}</span>
                </div>
              </div>
              <div className="bill-border-fix" style={{ flex: 2, borderLeft: '1px solid #000' }}>
                <div style={{ display: 'flex', padding: '8px 10px', borderBottom: '1px solid #000', fontSize: '14px' }}>
                  <div style={{ flex: 1 }}>Advance Upad</div>
                  <div style={{ flex: 1, textAlign: 'right' }}>{upadAmount.toFixed(2)}</div>
                </div>
                <div style={{ display: 'flex', padding: '12px 10px', fontSize: '16px', fontWeight: '800', background: '#f0f0f0', borderBottom: '1px solid #000', borderTop: '1px solid #000' }}>
                  <div style={{ flex: 1 }}>Grand Total</div>
                  <div style={{ flex: 1, textAlign: 'right' }}>{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
              </div>
            </div>

            {/* Terms & Signature */}
            <div style={{ display: 'flex', borderTop: '1px solid #000', padding: '10px 0' }}>
              <div style={{ flex: 1, paddingLeft: '10px' }}>
                <div style={{ fontWeight: '700', fontSize: '12px', borderBottom: '1px solid #000', width: 'fit-content', marginBottom: '5px' }}>Terms & Condition :</div>
                <div style={{ fontSize: '11px', fontStyle: 'italic' }}>
                  1. "Subject to 'SURAT' Jurisdiction only. E.&.O.E"
                </div>
              </div>
              <div style={{ flex: 1, textAlign: 'right', paddingRight: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '40px' }}>For, MADHUVAN FARM</div>
                <div style={{ fontSize: '11px' }}>(Authorised Signatory)</div>
              </div>
            </div>

          </div>

        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              margin: 0;
              size: A4;
            }
            body {
              margin: 0;
              padding: 0;
              background: white !important;
            }
            body * {
              visibility: hidden;
            }
            .modal-overlay {
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              backdrop-filter: none !important;
              width: 100% !important;
              height: 100% !important;
              display: flex !important;
              justify-content: center !important;
              align-items: flex-start !important;
              visibility: visible !important;
            }
            .modal-content {
              position: static !important;
              margin: 40px auto !important;
              padding: 0 !important;
              width: 210mm !important;
              box-shadow: none !important;
              max-width: none !important;
              max-height: none !important;
              overflow: visible !important;
              visibility: visible !important;
              background: white !important;
              border: none !important;
            }
            #printable-bill, #printable-bill * {
              visibility: visible !important;
              color: black !important;
            }
            #printable-bill {
              padding: 0 !important;
              margin: 0 auto !important;
              width: 190mm !important;
            }
            .no-print {
              display: none !important;
            }
            .bill-border-fix {
              border-left: 2px solid black !important;
            }
          }
        ` }} />
      </div>
    </div>
  );
};

export default BillModal;
