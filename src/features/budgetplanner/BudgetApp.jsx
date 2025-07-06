import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import 'bootstrap/dist/css/bootstrap.min.css';        // ✅ Load Bootstrap first
import "./BudgetApp.css";                             // ✅ Then your custom styles

import Incomes from "./components/incomes";
import Expenses from "./components/expenses";

// Helper to format to Indian currency
const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);

// InfoCard Component
const InfoCard = ({ title, value, linkText, linkTo, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="mb-3"
  >
    <Card className="info-card">
      <Card.Body>
        <Card.Title className="info-card-title">{title}</Card.Title>
        <Card.Text className="info-card-value">{value}</Card.Text>
        {linkText && linkTo && (
          <Card.Link as={Link} to={linkTo} className="info-card-link">
            {linkText}
            <FontAwesomeIcon icon={faArrowRight} className="icon-right ms-2" />
          </Card.Link>
        )}
      </Card.Body>
    </Card>
  </motion.div>
);

// Dashboard Component
function Dashboard({ totalIncomes, totalExpenses }) {
  const total = totalIncomes - totalExpenses;
  const handleReload = () => window.location.reload();

  return (
    <Container fluid className="mt-5">
      {/* Header Row */}
      <Row className="align-items-center justify-content-center mb-3 px-3">
        <Col xs="auto" className="text-center">
          <h2 className="dashboard-title">🌸 Welcome Back, Sakhi!</h2>
          <p>Empowering your financial journey with AI and clarity.</p>
        </Col>
        <Col xs="auto" className="text-end">
          <Button onClick={handleReload} className="secondary-button">
            <FontAwesomeIcon icon={faRotateRight} className="icon-left" />
          </Button>
        </Col>
      </Row>

      {/* Total */}
      <Row className="mb-4 px-3">
        <Col md={12}>
          <InfoCard
            title="Total"
            value={formatINR(total)}
          />
        </Col>
      </Row>

      {/* Incomes & Expenses */}
      <Row className="px-3">
        <Col xs={12} md={6}>
          <InfoCard
            title="Incomes"
            value={formatINR(totalIncomes)}
            linkText="Add or manage your Income"
            linkTo="/budgetplanner/incomes"
            delay={0.2}
          />
        </Col>
        <Col xs={12} md={6}>
          <InfoCard
            title="Expenses"
            value={formatINR(totalExpenses)}
            linkText="Add or manage your Expenses"
            linkTo="/budgetplanner/expenses"
            delay={0.4}
          />
        </Col>
      </Row>
    </Container>
  );
}

// Main BudgetApp Component
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
      <Route
        path="incomes"
        element={<Incomes incomes={incomes} setIncomes={setIncomes} />}
      />
      <Route
        path="expenses"
        element={<Expenses expenses={expenses} setExpenses={setExpenses} />}
      />
    </Routes>
  );
};

export default BudgetApp;
