// src/components/HazardForm.js
import React, { useState, useRef } from "react";
import axios from "axios";
import SignatureCanvas from "react-signature-canvas";

const HAZARD_CONTROLS = {
  "Auto Starting Equipment": ["Auto Start Signage", "Guards", "SWP-009 Lockout/Tag Out", "PPE"],
  "Biohazards": ["SWP-002 Chemical & Biological Hazards", "MSDS", "PPE"],
  "Compressed Gases": ["SWP-020 Compressed Gas Cylinders", "MSDS", "Isolation"],
  "Driving": ["Adhere to Posted Speed Limits", "Road Conditions", "Defensive Driving"],
  "Electrical": ["SWP-009 Lockout/Tag Out", "Grounding & Bonding", "PPE"],
  "Explosive/Flammable Gas": ["Gas Monitor", "Ventilation", "Ignition Control", "MSDS"],
  "Extreme Heat": ["Hydration", "Rest Breaks", "Protective Clothing"],
  "Flying Debris/Dust": ["Safety Glasses/Goggles", "Face Shield", "Dust Mask/Respirator"],
  "Fuelling Equipment": ["No Smoking", "Spill Kit", "Fire Extinguisher"],
  "Hazardous Materials": ["MSDS", "Proper Storage", "PPE"],
  "Hot Fluids": ["Insulated Gloves", "Face Shield", "SWP-009 Lockout/Tag Out"],
  "Housekeeping/Inspections": ["Daily Inspection", "Clean Work Area", "Remove Trip Hazards"],
  "Ignition Source": ["No Smoking", "Fire Watch", "Fire Extinguisher"],
  "Illumination": ["Adequate Lighting", "Portable Lights", "Flashlights"],
  "Inhalation Vapour": ["Respiratory Protection", "Ventilation", "MSDS"],
  "Manual Lifting": ["SWP-010 Manual Lifting", "Buddy System", "Proper Technique"],
  "Mechanical Lifting": ["SWP-011 Mechanical Lifting", "Certified Equipment", "Spotter"],
  "Noise Levels": ["Hearing Protection", "Double Hearing Protection", "Noise Monitoring"],
  "Open Flame": ["Hot Work Permit", "Fire Watch", "Fire Extinguisher"],
  "Pinch Points/Crushing": ["Guards", "SWP-009 Lockout/Tag Out", "Awareness Training"],
  "Rigging/Ropes/Slings": ["SWP-012 Rigging", "Certified Slings", "Inspection Before Use"],
  "Rotating Equipment": ["Guards", "SWP-009 Lockout/Tag Out", "PPE"],
  "Slips/Trips/Falls": ["Housekeeping", "Slip Resistant Boots", "Fall Protection"],
  "Weather": ["Weather Monitoring", "Protective Clothing", "Work Suspension if Unsafe"],
  "Wildlife": ["Awareness Training", "Bear Spray", "Avoidance Procedures"],
  "Working Alone": ["Check-In Procedure", "Communication Device", "Emergency Plan"]
};

const PPE_OPTIONS = [
  "Safety Glasses/Goggles","Gloves","Hard Hat","Respiratory Protection",
  "Fire Retardant Coveralls","Double Hearing Protection","Safety Boots","Gas Monitor","Face Shield"
];

export default function HazardForm() {
  const [formData, setFormData] = useState({
    company: "", jobDescription: "", location: "", date: "",
    hazards: [], hazardControls: {}, ppe: [],
    additionalHazards: "", additionalControls: "", tailgateMeeting: "",
    representatives: Array(6).fill(""),
    representativeEmergencyContact: "",
    clientEmergencyContact: "",
    workerSignature: "", clientName: "", clientSignature: "",
    clientContactNumber: "",
    supervisorName: "", supervisorSignature: "",
    supervisorContactNumber: ""
  });
  const [status, setStatus] = useState("");

  const workerSigRef = useRef(null);
  const clientSigRef = useRef(null);
  const supervisorSigRef = useRef(null);

  const handleChange = e => setFormData(d => ({ ...d, [e.target.name]: e.target.value }));

  const toggleArrayValue = (name, value) => {
    setFormData(d => {
      const set = new Set(d[name]);
      set.has(value) ? set.delete(value) : set.add(value);
      return { ...d, [name]: Array.from(set) };
    });
  };

  const toggleControl = (hazard, control) => {
    setFormData(d => {
      const current = new Set(d.hazardControls[hazard] || []);
      current.has(control) ? current.delete(control) : current.add(control);
      return { ...d, hazardControls: { ...d.hazardControls, [hazard]: Array.from(current) } };
    });
  };

  const handleRepChange = (i, val) => {
    const reps = [...formData.representatives];
    reps[i] = val;
    setFormData({ ...formData, representatives: reps });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const workerSignature = workerSigRef.current && !workerSigRef.current.isEmpty()
      ? workerSigRef.current.getTrimmedCanvas().toDataURL("image/png") : "";
    const clientSignature = clientSigRef.current && !clientSigRef.current.isEmpty()
      ? clientSigRef.current.getTrimmedCanvas().toDataURL("image/png") : "";
    const supervisorSignature = supervisorSigRef.current && !supervisorSigRef.current.isEmpty()
      ? supervisorSigRef.current.getTrimmedCanvas().toDataURL("image/png") : "";

    const payload = { ...formData, workerSignature, clientSignature, supervisorSignature };
    setStatus("Submitting...");

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/submit-form`,
        payload
      );
      setStatus(`Submitted ✔ Form #: ${res.data.formNumber}`);
    } catch (err) {
      console.error("❌ Error submitting form:", err);
      setStatus("Submission failed.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ fontFamily: "sans-serif", maxWidth: 1000, margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>SITE SPECIFIC HAZARD ASSESSMENT</h2>

      {/* Job Info */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
        <tbody>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <td style={{ border: "1px solid #000", padding: 8, fontWeight: "bold" }}>
              Company/Client: <input name="company" value={formData.company} onChange={handleChange} />
            </td>
            <td style={{ border: "1px solid #000", padding: 8, fontWeight: "bold" }}>
              Job Description: <input name="jobDescription" value={formData.jobDescription} onChange={handleChange} />
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: 8, fontWeight: "bold" }}>
              Location/L.S.D.: <input name="location" value={formData.location} onChange={handleChange} />
            </td>
            <td style={{ border: "1px solid #000", padding: 8, fontWeight: "bold" }}>
              Date: <input type="date" name="date" value={formData.date} onChange={handleChange} />
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: 8, fontWeight: "bold" }}>
              Client Emergency Contact: <input name="clientEmergencyContact" value={formData.clientEmergencyContact} onChange={handleChange} />
            </td>
            <td style={{ border: "1px solid #000", padding: 8, fontWeight: "bold" }}>
              Supervisor Name: <input name="supervisorName" value={formData.supervisorName} onChange={handleChange} />
            </td>
          </tr>
        </tbody>
      </table>

      {/* Hazards + Controls */}
      {/* ... keep existing hazards and PPE sections ... */}

      {/* Representatives */}
      <h3 style={{ marginTop: 20, marginBottom: 10 }}>PowerServ Representatives</h3>
      {/* ... keep existing representatives table ... */}

      {/* Representative Emergency Contact */}
      <h4 style={{ marginTop: 10 }}>Representative Emergency Contact #</h4>
      <input
        name="representativeEmergencyContact"
        value={formData.representativeEmergencyContact}
        onChange={handleChange}
        placeholder="Enter Representative Emergency Contact Number"
        style={{ width: "100%", marginBottom: 20 }}
      />

     {/* Signatures */}
<div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
  {/* Worker Signature */}
  <div style={{ flex: 1, marginRight: 10 }}>
    <div style={{ marginBottom: 6, fontWeight: "bold" }}>Worker Signature</div>
    <SignatureCanvas
      ref={workerSigRef}
      penColor="black"
      canvasProps={{
        width: 300,
        height: 100,
        className: "sigCanvas",
        style: { border: "1px solid #000" }
      }}
    />
    <div style={{ marginTop: 6 }}>
      <button
        type="button"
        onClick={() => workerSigRef.current && workerSigRef.current.clear()}
      >
        Clear
      </button>
    </div>
  </div>

  {/* Client Signature + Contact */}
  <div style={{ flex: 1, marginRight: 10 }}>
    <div style={{ marginBottom: 6, fontWeight: "bold" }}>Client Signature</div>
    <SignatureCanvas
      ref={clientSigRef}
      penColor="black"
      canvasProps={{
        width: 300,
        height: 100,
        className: "sigCanvas",
        style: { border: "1px solid #000" }
      }}
    />
    <div style={{ marginTop: 6 }}>
      <button
        type="button"
        onClick={() => clientSigRef.current && clientSigRef.current.clear()}
      >
        Clear
      </button>
    </div>
    <div style={{ marginTop: 10 }}>
      <label style={{ fontWeight: "bold" }}>Client Contact #:</label>
      <input
        type="text"
        name="clientContactNumber"
        value={formData.clientContactNumber}
        onChange={handleChange}
        style={{ width: "100%" }}
      />
    </div>
  </div>

  {/* Supervisor Signature + Contact */}
  <div style={{ flex: 1 }}>
    <div style={{ marginBottom: 6, fontWeight: "bold" }}>Supervisor Signature</div>
    <SignatureCanvas
      ref={supervisorSigRef}
      penColor="black"
      canvasProps={{
        width: 300,
        height: 100,
        className: "sigCanvas",
        style: { border: "1px solid #000" }
      }}
    />
    <div style={{ marginTop: 6 }}>
      <button
        type="button"
        onClick={() => supervisorSigRef.current && supervisorSigRef.current.clear()}
      >
        Clear
      </button>
    </div>
    <div style={{ marginTop: 10 }}>
      <label style={{ fontWeight: "bold" }}>Supervisor Contact #:</label>
      <input
        type="text"
        name="supervisorContactNumber"
        value={formData.supervisorContactNumber}
        onChange={handleChange}
        style={{ width: "100%" }}
      />
    </div>
  </div>
</div>

{/* Submit */}
<div style={{ textAlign: "center", marginTop: 20 }}>
  <button type="submit" style={{ padding: "8px 16px", fontSize: 16 }}>
    Submit Hazard Form
  </button>
  <div style={{ marginTop: 10 }}>{status}</div>
</div>

</form>
);
}
