import React from 'react';
import './Popup.css';

const Popup = ({ value, onChange, onSubmit }) => {
  return (
    <div className="popup">
      <label>Enter API Key:</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button onClick={() => onSubmit(value)}>Submit</button>
    </div>
  );
};

export default Popup;
