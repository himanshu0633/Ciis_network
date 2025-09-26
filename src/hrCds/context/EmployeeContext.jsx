import React, { createContext, useContext, useState, useEffect } from 'react';

const EmployeeContext = createContext();

export const useEmployees = () => useContext(EmployeeContext);

export const EmployeeProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [notification, setNotification] = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('employees');
    if (stored) setEmployees(JSON.parse(stored));
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);

  // CRUD operations
  const addEmployee = (employee) => {
    setEmployees(prev => [...prev, { ...employee, id: Date.now() }]);
    setNotification('Employee added!');
  };

  const updateEmployee = (id, updated) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
    setNotification('Employee updated!');
  };

  const deleteEmployee = (id) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    setNotification('Employee deleted!');
  };

  const clearNotification = () => setNotification(null);

  return (
    <EmployeeContext.Provider value={{ employees, addEmployee, updateEmployee, deleteEmployee, notification, clearNotification }}>
      {children}
    </EmployeeContext.Provider>
  );
}; 