// src/features/budgetplanner/budgetapp.jsx

import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./BudgetApp.css";

import Incomes from "./components/incomes";
import Expenses from "./components/expenses";

import { db } from "../../utils/firebase";
import { collection, onSnapshot } from "firebase/firestore";

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);

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

function Dashboard({ totalIncomes, totalExpenses }) {
  const total = totalIncomes - totalExpenses;
  const selectedLanguage = localStorage.getItem("selectedLanguage") || "en";

  const labels = {
    en: {
      welcome: "🌸 Welcome Back, Sakhi!",
      subtitle: "Empowering your financial journey with AI and clarity.",
      total: "Total",
      incomes: "Incomes",
      expenses: "Expenses",
      manageIncome: "Add or manage your Income",
      manageExpense: "Add or manage your Expenses",
    },
    hi: {
      welcome: "🌸 वापस स्वागत है, सखी!",
      subtitle: "AI और स्पष्टता के साथ आपकी वित्तीय यात्रा को सक्तिशा देना।",
      total: "कुल",
      incomes: "आय",
      expenses: "खर्च",
      manageIncome: "अपनी आय जोड़ें या प्रबंधित करें",
      manageExpense: "अपने खर्च जोड़ें या प्रबंधित करें",
    },
  };

  const t = labels[selectedLanguage];

  const handleReload = () => window.location.reload();

  return (
    <Container fluid className="mt-5">
      <Row className="align-items-center justify-content-center mb-3 px-3">
        <Col xs="auto" className="text-center">
          <h2 className="dashboard-title">{t.welcome}</h2>
          <p>{t.subtitle}</p>
        </Col>
        <Col xs="auto" className="text-end">
          <Button onClick={handleReload} className="secondary-button">
            <FontAwesomeIcon icon={faRotateRight} className="icon-left" />
          </Button>
        </Col>
      </Row>

      <Row className="mb-4 px-3">
        <Col md={12}>
          <InfoCard title={t.total} value={formatINR(total)} />
        </Col>
      </Row>

      <Row className="px-3">
        <Col xs={12} md={6}>
          <InfoCard
            title={t.incomes}
            value={formatINR(totalIncomes)}
            linkText={t.manageIncome}
            linkTo="/budgetplanner/incomes"
            delay={0.2}
          />
        </Col>
        <Col xs={12} md={6}>
          <InfoCard
            title={t.expenses}
            value={formatINR(totalExpenses)}
            linkText={t.manageExpense}
            linkTo="/budgetplanner/expenses"
            delay={0.4}
          />
        </Col>
      </Row>
    </Container>
  );
}

const BudgetApp = () => {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const unsubscribeIncomes = onSnapshot(collection(db, "incomes"), (snapshot) => {
      const loadedIncomes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setIncomes(loadedIncomes);
    });

    const unsubscribeExpenses = onSnapshot(collection(db, "expenses"), (snapshot) => {
      const loadedExpenses = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setExpenses(loadedExpenses);
    });

    return () => {
      unsubscribeIncomes();
      unsubscribeExpenses();
    };
  }, []);

  const totalIncomes = incomes.reduce((total, i) => total + parseFloat(i.amount || 0), 0);
  const totalExpenses = expenses.reduce((total, e) => total + parseFloat(e.amount || 0), 0);

  return (
    <Routes>
      <Route index element={<Navigate to="dashboard" />} />
      <Route path="dashboard" element={<Dashboard totalIncomes={totalIncomes} totalExpenses={totalExpenses} />} />
      <Route path="incomes" element={<Incomes />} />
      <Route path="expenses" element={<Expenses />} />
    </Routes>
  );
};

export default BudgetApp;
