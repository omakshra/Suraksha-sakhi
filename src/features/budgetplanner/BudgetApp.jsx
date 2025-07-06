import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

import Incomes from "./components/incomes";
import Expenses from "./components/expenses";

import "./BudgetApp.css";

// Helper to format to Indian currency
const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);

// Dashboard component
function Dashboard({ totalIncomes, totalExpenses }) {
  const total = totalIncomes - totalExpenses;

  const handleReload = () => window.location.reload();

  return (
    <Container className="dashboard">
      <h2 className="text-center">Dashboard</h2>
      <p className="text-center">Here's a summary of your overall financial status.</p>

      <div className="text-center mb-3">
        <Button onClick={handleReload} className="reload-button">
          <FontAwesomeIcon icon={faRotateRight} />
        </Button>
      </div>

      {/* Total - Full Width */}
      <Row className="mb-4">
        <Col md={12}>
          <motion.div
            className="card-box"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h5>Total</h5>
            <p>{formatINR(total)}</p>
          </motion.div>
        </Col>
      </Row>

      {/* Incomes & Expenses Side by Side */}
      <Row className="mb-4">
        <Col md={6}>
          <motion.div
            className="card-box"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h5>Incomes</h5>
            <p>{formatINR(totalIncomes)}</p>
          </motion.div>
        </Col>
        <Col md={6}>
          <motion.div
            className="card-box"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h5>Expenses</h5>
            <p>{formatINR(totalExpenses)}</p>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
}

// Main App component
const BudgetApp = () => {
  const [incomes, setIncomes] = useState(() => {
    const saved = localStorage.getItem("incomes");
    return saved ? JSON.parse(saved) : [];
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem("expenses");
    return saved ? JSON.parse(saved) : [];
  });

  const totalIncomes = incomes.reduce((total, i) => total + parseFloat(i.amount), 0);
  const totalExpenses = expenses.reduce((total, e) => total + parseFloat(e.amount), 0);

  useEffect(() => {
    localStorage.setItem("incomes", JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  return (
    <Routes>
      <Route index element={<Navigate to="dashboard" />} />
      <Route
        path="dashboard"
        element={<Dashboard totalIncomes={totalIncomes} totalExpenses={totalExpenses} />}
      />
      <Route path="incomes" element={<Incomes incomes={incomes} setIncomes={setIncomes} />} />
      <Route path="expenses" element={<Expenses expenses={expenses} setExpenses={setExpenses} />} />
    </Routes>
  );
};

export default BudgetApp;
