import React from "react";

const EMPLOYEE_TYPES = ["all", "intern", "technical", "non-technical", "sales"];

const EmployeeTypeFilter = ({ selected, onChange }) => {
  return (
    <section style={{ marginTop: 16 }}>
      <label style={{ fontWeight: 600, marginRight: 8 }}>
        Filter by Employee Type:
      </label>
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "6px 10px",
          borderRadius: 6,
          border: "1px solid #ccc",
          marginBottom: 16,
        }}
      >
        {EMPLOYEE_TYPES.map((type) => (
          <option key={type} value={type}>
            {type.toUpperCase()}
          </option>
        ))}
      </select>
    </section>
  );
};

export default EmployeeTypeFilter;
