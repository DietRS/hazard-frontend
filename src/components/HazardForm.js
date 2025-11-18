// src/components/HazardForm.js
import React, { useState, useRef } from "react";
import axios from "axios";
import SignatureCanvas from "react-signature-canvas";

const HAZARD_CONTROLS = {
  "Auto Starting Equipment": ["Auto Start Signage", "Guards", "SWP-009 Lockout/Tag Out", "PPE"],
  "Biohazards": ["SWP-002 Chemical & Biological Hazards", "MSDS", "PPE"],
  "Compressed Gases": ["SWP-020 Compressed Gas Cylinders", "MSDS", "Isolation"],
  "Driving": ["Adhere to Posted Speed Limits/Signage", "Road Conditions", "Defensive Driving"],
  "Electrical": ["SWP-009 Lockout/Tag Out", "Grounding & Bonding", "PPE"],
  "Explosive/Flammable Gas": ["Gas Monitor", "Ventilation", "Ignition Control", "SWP - Gas Detection", "PPE - Fire Retardant/Gas Monitor"],
  "Extreme Heat": ["SWP-019 Working in Extreme Heat", "Hydration", "Rest Breaks", "Protective Clothing"],
  "Flying Debris/Dust": ["Safety Glasses/Goggles", "Face Shield", "Dust Mask/Respirator", "Guards"],
  "Fuelling Equipment": ["No Smoking", "Spill Kit", "Fire Extinguisher", "Grounding & Bonding", "MSDS", "PPE - Chemical Resistant Gloves"],
  "Hazardous Materials": ["SWP-003 WHMIS", "MSDS", "Proper Storage", "PPE"],
  "Hot Fluids": ["Insulated Gloves", "Face Shield", "SWP-009 Lockout/Tag Out", "MSDS", "PPE"],
  "Housekeeping/Inspections": ["Daily Inspection", "Clean Work Area", "Remove Trip Hazards"],
  "Ignition Source": ["Hot Work Permit", "Fire Watch", "Fire Extinguisher", "Equipment Isolation", "Positive Air Shutoff", "Grounding"],
  "Illumination": ["Adequate Lighting for the Job", "Portable Lights", "Flashlights"],
  "Inhalation Vapour (Varsol, Brakleen)": ["SWP-003 WHMIS", "Respiratory Protection", "Ventilation", "MSDS", "1/2 Mask Respirator w/ Organic Cartridge"],
  "Manual Lifting": ["SWP-010 Manual Lifting", "Buddy System", "Proper Technique", "PPE"],
  "Mechanical Lifting - Cranes/Hoisting": ["SWP-014 Cranes, Hoists, Lifting Devices", "Certified Equipment", "Spotter", "Pre Inspection", "Equipment Certification", "Use According to Manufacturer Specs", "Tag Lines where needed"],
  "Noise Levels": ["SWP-012 Noise", "Hearing Protection", "Double Hearing Protection", "Noise Monitoring", "PPE"],
  "Open Flame": ["Hot Work Permit", "Fire Watch", "Fire Extinguisher", "SWP-018 Gas Detection", "PPE"],
  "Pinch Points/Crushing": ["Guards", "SWP-009 Lockout/Tag Out", "Awareness Training", "PPE"],
  "Radioactive Sources - NORMS": ["Signage", "Awareness Training", "PPE"],
  "Rigging/Ropes/Slings/Cable": ["SWP-015 Rigging", "Certified Slings", "Inspection Before Use", "Equipment Inspection", "PPE"],
  "Rotating Equipment": ["Guards", "SWP-009 Lockout/Tag Out", "Safeguards", "No Loose Clothing", "PPE"],
  "Slips/Trips/Falls": ["Housekeeping", "Slip Resistant Boots", "Fall Protection", "Awareness", "PPE"],
  "Weather": ["Weather Monitoring", "Protective Clothing", "Work Suspension if Unsafe", "SWP-016 Working Alone", "Emergency Response Planning", "PPE"],
  "Wildlife": ["Awareness Training", "Bear Spray", "Avoidance Procedures"],
  "Working Alone": ["Check-In Procedure", "Communication Device", "Emergency Plan", "SWP-016 Working Alone", "Site Specific Procedures"]
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
    representativeCompany: "", representativeEmergencyContact: "",
    clientEmergencyContact: "",
    workerSignature: "", clientSignature: "", supervisorSignature: "",
    clientContactNumber: "", supervisorName: "", supervisorContactNumber: ""
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
      <h3 style={{ marginTop: 20, marginBottom: 10 }}>Hazards and Controls</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
        <thead style={{ backgroundColor: "#d9d9d9" }}>
          <tr>
            <th style={{ border: "1px solid #000", padding: 6 }}>Hazard</th>
            <th style={{ border: "1px solid #000", padding: 6 }}>Controls</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(HAZARD_CONTROLS).map(([hazard, controls], idx) => (
            <tr key={hazard} style={{ backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "#ffffff" }}>
              <td style={{ border: "1px solid #000", padding: 6 }}>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.hazards.includes(hazard)}
                    onChange={() => toggleArrayValue("hazards", hazard)}
                  /> {hazard}
                </label>
              </td>
              <td style={{ border: "1px solid #000", padding: 6 }}>
                {controls.map(c => (
                  <label key={c} style={{ marginRight: 12, display: "inline-block", marginBottom: 6 }}>
                    <input
                      type="checkbox"
                      disabled={!formData.hazards.includes(hazard)}
                      checked={(formData.hazardControls[hazard] || []).includes(c)}
                      onChange={() => toggleControl(hazard, c)}
                    /> <strong>{c}</strong>
                  </label>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PPE */}
      <h3>PPE Required</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
        {PPE_OPTIONS.map(p => (
          <label key={p}>
            <input
              type="checkbox"
              checked={formData.ppe.includes(p)}
              onChange={() => toggleArrayValue("ppe", p)}
            /> {p}
          </label>
        ))}
      </div>

      {/* Additional Hazards/Controls */}
      <h3>Additional Hazards and Controls</h3>
      <input
        name="additionalHazards"
        value={formData.additionalHazards}
        onChange={handleChange}
        placeholder="Additional Hazards"
        style={{ width: "100%", marginBottom: 8 }}
      />
      <input
        name="additionalControls"
        value={formData.additionalControls}
        onChange={handleChange}
        placeholder="Additional Controls"
        style={{ width: "100%", marginBottom: 20 }}
      />

      {/* Tailgate Meeting */}
      <h3>Tailgate / Safety Meeting</h3>
      <textarea
        name="tailgateMeeting"
        value={formData.tailgateMeeting}
        onChange={handleChange}
        style={{ width: "100%", height: 100, marginBottom: 20 }}
      />

      {/* Representative Company */}
      <h3>Representative Company</h3>
      <input
        name="representativeCompany"
        value={formData.representativeCompany}
        onChange={handleChange}
        placeholder="Enter Representative Company Name"
        style={{ width: "100%", marginBottom: 20 }}
      />

      {/* Representatives */}
      <h3>Representatives</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 12 }}>
        <thead style={{ backgroundColor: "#d9d9d9" }}>
          <tr>
            <th style={{ border: "1px solid #000", padding: 6 }}>Name (Please Print)</th>
          </tr>
        </thead>
        <tbody>
          {formData.representatives.map((rep, idx) => (
            <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "#ffffff" }}>
              <td style={{ border: "1px solid #000", padding: 6 }}>
                <input
                  value={rep}
                  onChange={(e) => handleRepChange(idx, e.target.value)}
                  placeholder={`Representative ${idx + 1}`}
                  style={{ width: "100%" }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Representative Emergency Contact */}
      <h4>Representative Emergency Contact #</h4>
      <input
        name="representativeEmergencyContact"
        value={formData.representativeEmergencyContact}
        onChange={handleChange}
        placeholder="Enter Representative Emergency Contact Number"
        style={{ width: "100%", marginBottom: 20 }}
      />

      {/* Acknowledgement */}
      <h3>Acknowledgement</h3>
      <p style={{ marginBottom: 20 }}>
        I acknowledge that I have participated in the hazard assessment and understand the hazards,
        controls, and PPE requirements for this job. I agree to follow all safety procedures and
        use the required protective equipment.
      </p>

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
            <button type="button" onClick={() => workerSigRef.current && workerSigRef.current.clear()}>
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
            <button type="button" onClick={() => clientSigRef.current && clientSigRef.current.clear()}>
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
            <button type="button" onClick={() => supervisorSigRef.current && supervisorSigRef.current.clear()}>
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
