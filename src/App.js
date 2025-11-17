import React from 'react';
import HazardForm from './components/HazardForm';

export default function App() {
  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Site Hazard Assessment</h1>
      <HazardForm />
    </div>
  );
}
