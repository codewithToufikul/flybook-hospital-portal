import React, { useState, useEffect, useRef } from 'react';
import { X, QrCode, Search, AlertCircle, Camera } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { api } from '../../services/api';
import { Ticket } from '../../types';

interface QRScannerModalProps {
  onClose: () => void;
  onTicketFound: (ticket: Ticket) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ onClose, onTicketFound }) => {
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const startScanner = async () => {
    setError(null);
    try {
      setScanning(true);
      const html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          console.log('Scanned text:', decodedText);
          stopScanner();
          // Extract ticket number if decodedText contains a URL or JSON or code
          let codeToLookup = decodedText;
          if (decodedText.includes('ticket_')) {
            const match = decodedText.match(/ticket_([a-zA-Z0-9-_]+)/);
            if (match && match[1]) {
              codeToLookup = match[1].split('_')[0];
            }
          }
          await handleLookup(codeToLookup);
        },
        () => {}
      );
    } catch (err: any) {
      console.warn('Camera scan failed to start:', err);
      setError('Could not access camera. Please enter the ticket number manually below.');
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      html5QrCodeRef.current.stop().then(() => {
        html5QrCodeRef.current?.clear();
      }).catch(console.error);
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const handleLookup = async (code: string) => {
    if (!code.trim()) {
      setError('Please enter a ticket number or scan a QR code.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.verifyTicket(code.trim());
      if (res.success && res.ticket) {
        onTicketFound(res.ticket);
        onClose();
      } else {
        setError(res.message || 'Ticket not found.');
      }
    } catch (err: any) {
      setError(err.message || 'Ticket verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QrCode size={20} color="var(--primary-500)" />
            <h3>Verify Patient Ticket (QR / Barcode)</h3>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {error && (
            <div
              style={{
                padding: '10px 14px',
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: '10px',
                color: 'var(--rose-500)',
                fontSize: '13px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Scanner View Area */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div id="qr-reader" className="qr-scanner-box" style={{ minHeight: scanning ? '250px' : '0' }} />

            {!scanning ? (
              <button onClick={startScanner} className="btn btn-secondary" style={{ gap: '8px' }}>
                <Camera size={16} />
                <span>Launch Camera Scanner</span>
              </button>
            ) : (
              <button onClick={stopScanner} className="btn btn-secondary btn-sm">
                <span>Stop Camera</span>
              </button>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '20px 0',
              color: 'var(--text-dim)',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
            <span>OR ENTER TICKET CODE</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          </div>

          {/* Manual Input */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup(manualCode)}
              placeholder="e.g. FB-HOSP-2026-42446"
              className="form-input"
              style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}
            />
            <button
              onClick={() => handleLookup(manualCode)}
              disabled={loading}
              className="btn btn-primary"
              style={{ minWidth: '110px' }}
            >
              <Search size={16} />
              <span>{loading ? 'Verifying...' : 'Verify'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
