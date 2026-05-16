import React, { useMemo, useState } from 'react';
import { Building2, MapPin, Clock3, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';

export default function PendingHospitals({ list = [], onApprove, onReject }) {
  const [loadingId, setLoadingId] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [actionNote, setActionNote] = useState('');

  const selectedItem = useMemo(() => list.find((item) => item.hospitalId === selectedHospital) || null, [list, selectedHospital]);

  const openModal = (action) => {
    setModalAction(action);
    setActionNote('');
    setModalOpen(true);
  };

  const closeModal = () => {
    if (loadingId) return;
    setModalOpen(false);
    setModalAction(null);
    setActionNote('');
  };

  const handleConfirm = async () => {
    if (!selectedItem) return;
    const note = actionNote.trim();
    setLoadingId(selectedItem.hospitalId);

    try {
      if (modalAction === 'approve') {
        await onApprove(selectedItem.hospitalId, note || 'Approved by super admin');
      } else if (modalAction === 'reject') {
        await onReject(selectedItem.hospitalId, note || 'Rejected by super admin');
      }
      closeModal();
      setSelectedHospital(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  if (!list.length) {
    return (
      <div className="super-empty-state">
        <CheckCircle2 size={28} />
        <h4>No pending hospitals</h4>
        <p>Everything is up to date. New requests will appear here.</p>
      </div>
    );
  }

  return (
    <>
      <div className="super-pending-layout">
        <div className="super-pending-list">
          {list.map((h) => (
            <button
              key={h.hospitalId}
              className={`super-pending-item ${selectedHospital === h.hospitalId ? 'active' : ''}`}
              onClick={() => setSelectedHospital(h.hospitalId)}
            >
              <div className="super-pending-item-left">
                <div className="super-pending-icon"><Building2 size={16} /></div>
                <div>
                  <div className="super-pending-title">{h.name}</div>
                  <div className="super-pending-meta">
                    <MapPin size={13} />
                    <span>{h.address?.city || h.city || 'Unknown city'}</span>
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="super-pending-chevron" />
            </button>
          ))}
        </div>

        <div className="super-review-panel">
          {selectedItem ? (
            <>
              <div className="super-review-header">
                <div>
                  <div className="super-review-kicker">Selected hospital</div>
                  <h4>{selectedItem.name}</h4>
                </div>
                <span className="super-status-pill pending">Pending</span>
              </div>

              <div className="super-review-grid">
                <div className="super-review-row"><span><Building2 size={14} /> ID</span><strong>{selectedItem.hospitalId}</strong></div>
                <div className="super-review-row"><span><MapPin size={14} /> City</span><strong>{selectedItem.address?.city || selectedItem.city || '—'}</strong></div>
                <div className="super-review-row"><span><Clock3 size={14} /> Status</span><strong>Awaiting review</strong></div>
              </div>

              <div className="super-review-actions">
                <button type="button" className="super-action-btn ghost" onClick={() => setSelectedHospital(null)} disabled={loadingId === selectedItem.hospitalId}>
                  Cancel
                </button>
                <button type="button" className="super-action-btn danger" onClick={() => openModal('reject')} disabled={loadingId === selectedItem.hospitalId}>
                  <XCircle size={16} /> Reject
                </button>
                <button type="button" className="super-action-btn primary" onClick={() => openModal('approve')} disabled={loadingId === selectedItem.hospitalId}>
                  <CheckCircle2 size={16} /> Approve
                </button>
              </div>
            </>
          ) : (
            <div className="super-review-empty">
              <Building2 size={28} />
              <h4>Review details</h4>
              <p>Select a hospital from the list to see approval actions and notes.</p>
            </div>
          )}
        </div>
      </div>

      {modalOpen && selectedItem && (
        <div className="super-modal-backdrop" role="presentation" onClick={closeModal}>
          <div className="super-modal-card" role="dialog" aria-modal="true" aria-label={`${modalAction} hospital`} onClick={(e) => e.stopPropagation()}>
            <div className="super-modal-header">
              <div>
                <div className="super-modal-kicker">{modalAction === 'approve' ? 'Approve hospital' : 'Reject hospital'}</div>
                <h4>{selectedItem.name}</h4>
              </div>
              <button type="button" className="super-modal-close" onClick={closeModal} aria-label="Close modal">
                <XCircle size={18} />
              </button>
            </div>

            <label className="super-modal-label" htmlFor="super-admin-note">
              Write a note
            </label>
            <textarea
              id="super-admin-note"
              className="super-modal-textarea"
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              placeholder="Write a note"
              rows={5}
            />

            <div className="super-modal-actions">
              <button type="button" className="super-action-btn ghost" onClick={closeModal} disabled={loadingId === selectedItem.hospitalId}>
                Cancel
              </button>
              <button type="button" className={`super-action-btn ${modalAction === 'approve' ? 'primary' : 'danger'}`} onClick={handleConfirm} disabled={loadingId === selectedItem.hospitalId}>
                {modalAction === 'approve' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
