import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import '../styles/appointment-booking.css';

export function SlotSelector({ slots, loading, error, onSelect, selectedSlot, minDate }) {
  const [currentDateIndex, setCurrentDateIndex] = useState(0);

  const dates = useMemo(() => {
    return Object.keys(slots || {}).sort();
  }, [slots]);

  const currentDate = dates[currentDateIndex];
  const currentSlots = slots?.[currentDate] || [];

  const handlePrevDate = () => {
    setCurrentDateIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextDate = () => {
    setCurrentDateIndex(prev => Math.min(dates.length - 1, prev + 1));
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="slot-selector-skeleton">
        <div className="skeleton-line"></div>
        <div className="slots-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton-slot"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="form-error alert-error">
        <AlertCircle size={20} />
        <div>
          <strong>Error loading slots</strong>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!dates || dates.length === 0) {
    return (
      <div className="empty-state">
        <AlertCircle size={48} color="var(--primary-light)" />
        <h3>No available slots</h3>
        <p>This doctor has no available appointments in the selected period</p>
      </div>
    );
  }

  return (
    <div className="slot-selector">
      <h3>Select Date & Time</h3>

      {/* Date Navigation */}
      <div className="slot-date-nav">
        <button
          onClick={handlePrevDate}
          disabled={currentDateIndex === 0}
          className="date-nav-btn"
          aria-label="Previous date"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="slot-dates-scroll">
          {dates.map((date, idx) => (
            <button
              key={date}
              onClick={() => setCurrentDateIndex(idx)}
              className={`date-btn ${idx === currentDateIndex ? 'active' : ''}`}
            >
              <span className="date-btn-day">{formatDate(date).split(',')[0]}</span>
              <span className="date-btn-date">{formatDate(date).split(',')[1]}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleNextDate}
          disabled={currentDateIndex === dates.length - 1}
          className="date-nav-btn"
          aria-label="Next date"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Time Slots */}
      <div className="slot-selected-date">
        <h4>Available slots for {formatDate(currentDate)}</h4>
      </div>

      {currentSlots.length === 0 ? (
        <div className="empty-state compact">
          <AlertCircle size={32} color="var(--primary-light)" />
          <p>No slots available on this date</p>
        </div>
      ) : (
        <div className="slots-grid">
          {currentSlots.map((slot) => {
            const isSelected = selectedSlot?.date === currentDate && selectedSlot?.slot === slot;
            return (
              <button
                key={slot}
                onClick={() => onSelect({ date: currentDate, slot })}
                className={`slot-btn ${isSelected ? 'selected' : ''}`}
              >
                <span className="slot-time">{formatTime(slot)}</span>
                {isSelected && (
                  <CheckCircle size={16} color="var(--primary)" fill="var(--primary)" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {selectedSlot && (
        <div className="slot-selection-summary">
          <CheckCircle size={18} color="var(--primary)" />
          <div>
            <strong>Selected:</strong> {formatDate(selectedSlot.date)} at {formatTime(selectedSlot.slot)}
          </div>
        </div>
      )}

      <p className="slot-selector-hint">
        💡 Tip: Book ahead to get your preferred time slot
      </p>
    </div>
  );
}

export default SlotSelector;
