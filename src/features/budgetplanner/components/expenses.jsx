// src/features/expenses/expenses.jsx

import "./expenses.css";
import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Form,
  ListGroup,
  Container,
  Row,
  Col,
  Card,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import * as XLSX from "xlsx";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import "chartjs-adapter-date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileExcel,
  faArrowCircleLeft,
  faArrowCircleRight,
  faPlusCircle,
  faPenToSquare,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

import { db } from "../../../utils/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [category, setCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expensesPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [lang, setLang] = useState(localStorage.getItem("selectedLanguage") || "en");

  useEffect(() => {
    const interval = setInterval(() => {
      const newLang = localStorage.getItem("selectedLanguage") || "en";
      setLang((prev) => (prev !== newLang ? newLang : prev));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const t = {
    title: lang === "hi" ? "खर्च ट्रैकर" : "Expense Tracker",
    name: lang === "hi" ? "नाम" : "Name",
    desc: lang === "hi" ? "विवरण" : "Description",
    amount: lang === "hi" ? "राशि (₹)" : "Amount (₹)",
    date: lang === "hi" ? "तारीख" : "Date",
    category: lang === "hi" ? "श्रेणी" : "Category",
    paid: lang === "hi" ? "भुगतान किया गया" : "Paid",
    add: lang === "hi" ? "खर्च जोड़ें" : "Add Expense",
    update: lang === "hi" ? "अपडेट करें" : "Update Expense",
    total: lang === "hi" ? "कुल खर्च" : "Total Expenses",
    search: lang === "hi" ? "खर्च खोजें..." : "Search expenses...",
    startMonth: lang === "hi" ? "प्रारंभ माह" : "Start Month",
    endMonth: lang === "hi" ? "अंत माह" : "End Month",
    export: lang === "hi" ? "एक्सेल में निर्यात करें" : "Export to Excel",
    confirmAdd: lang === "hi" ? "इस खर्च को जोड़ें?" : "Add this expense?",
    confirmUpdate: lang === "hi" ? "इस खर्च को अपडेट करें?" : "Update this expense?",
    confirmDelete: lang === "hi" ? "इस खर्च को हटाएं?" : "Remove this expense?",
    allFieldsRequired: lang === "hi" ? "सभी फ़ील्ड आवश्यक हैं।" : "All fields are required."
  };

  const categories = [
    "Groceries & Essentials",
    "Childcare & Family Support",
    "Home & Rent",
    "Education & Career",
    "Health & Medical",
    "Personal Care",
    "Entertainment"
  ];

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "expenses"), (snapshot) => {
      const loadedExpenses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExpenses(loadedExpenses);
    });
    return () => unsubscribe();
  }, []);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(expenses);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");
    XLSX.writeFile(wb, "Expenses.xlsx");
  };

  const handleEdit = (expense) => {
    setEditing(true);
    setCurrentExpense(expense);
    setName(expense.name);
    setAmount(expense.amount);
    setDate(expense.date);
    setDescription(expense.description);
    setIsPaid(expense.status === "PAID");
    setCategory(expense.category || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !amount || !date || !description || !category) {
      alert(t.allFieldsRequired);
      return;
    }

    const isConfirmed = window.confirm(editing ? t.confirmUpdate : t.confirmAdd);
    if (!isConfirmed) return;

    const expenseData = {
      name,
      amount: parseFloat(amount),
      date,
      description,
      status: isPaid ? "PAID" : "DUE",
      category,
    };

    try {
      if (editing && currentExpense) {
        const expenseDocRef = doc(db, "expenses", currentExpense.id);
        await updateDoc(expenseDocRef, expenseData);
      } else {
        await addDoc(collection(db, "expenses"), expenseData);
      }
      resetForm();
    } catch (error) {
      console.error("Error saving expense:", error);
      alert("Error saving expense. Check console for details.");
    }
  };

  const resetForm = () => {
    setName("");
    setAmount("");
    setDate("");
    setDescription("");
    setIsPaid(false);
    setEditing(false);
    setCurrentExpense(null);
    setCategory("");
  };

  const handleRemove = async (id) => {
    const confirmDelete = window.confirm(t.confirmDelete);
    if (!confirmDelete) return;

    try {
      const expenseDocRef = doc(db, "expenses", id);
      await deleteDoc(expenseDocRef);
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Error deleting expense. Check console for details.");
    }
  };

  const totalExpense = expenses.reduce(
    (total, exp) => total + parseFloat(exp.amount || 0),
    0
  );

  const filteredMonthlyExpenses = useMemo(() => {
    if (!startMonth || !endMonth) return expenses;
    return expenses.filter((exp) => {
      const expMonth = exp.date.slice(0, 7);
      return expMonth >= startMonth && expMonth <= endMonth;
    });
  }, [expenses, startMonth, endMonth]);

  const filteredExpenses = searchQuery
    ? expenses.filter((exp) =>
        [exp.name, exp.description, exp.category || ""].some((val) =>
          val.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : expenses;

  const indexOfLastExpense = currentPage * expensesPerPage;
  const indexOfFirstExpense = indexOfLastExpense - expensesPerPage;
  const currentExpenses = filteredExpenses.slice(
    indexOfFirstExpense,
    indexOfLastExpense
  );

  const handlePreviousPage = () =>
    setCurrentPage((p) => (p > 1 ? p - 1 : p));
  const handleNextPage = () =>
    setCurrentPage((p) =>
      p * expensesPerPage < filteredExpenses.length ? p + 1 : p
    );

  const chartData = {
    labels: filteredMonthlyExpenses.map((e) => e.date),
    datasets: [
      {
        label: t.title,
        data: filteredMonthlyExpenses.map((e) => e.amount),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        type: "time",
        time: { unit: "day" },
        title: { display: true, text: t.date },
      },
      y: {
        title: { display: true, text: t.amount },
      },
    },
  };

  const [aiInsights, setAiInsights] = useState({
    topCategory: null,
    leastCategory: null,
    overspentCategories: [],
    paidRatio: 0,
    budgetSuggestions: [],
    flaggedUnnecessary: [],
  });

  useEffect(() => {
    if (expenses.length === 0) return;

    const categoryTotals = {};
    expenses.forEach((e) => {
      const cat = e.category || "Uncategorized";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(e.amount || 0);
    });

    const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

    const topCategory = Object.entries(categoryTotals).reduce(
      (top, curr) => (curr[1] > top[1] ? curr : top),
      ["None", 0]
    );

    const leastCategory = Object.entries(categoryTotals).reduce(
      (least, curr) => (curr[1] < least[1] && curr[1] > 0 ? curr : least),
      [null, Infinity]
    );

    const overspentCategories = Object.entries(categoryTotals).filter(
      ([_, amt]) => amt > 0.4 * totalSpent
    );

    const paidCount = expenses.filter((e) => e.status === "PAID").length;
    const dueCount = expenses.filter((e) => e.status === "DUE").length;
    const totalCount = paidCount + dueCount;
    const paidRatio = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;

    const idealBudget = {
      "Groceries & Essentials": 15,
      "Childcare & Family Support": 10,
      "Home & Rent": 30,
      "Education & Career": 10,
      "Health & Medical": 15,
      "Personal Care": 10,
    };

    const budgetSuggestions = Object.entries(categoryTotals).map(([cat, amt]) => {
      const percentage = (amt / totalSpent) * 100;
      const ideal = idealBudget[cat] || 10;
      return {
        category: cat,
        actual: percentage.toFixed(1),
        ideal,
        status:
          percentage > ideal + 5
            ? "⚠️ Over Budget"
            : percentage < ideal - 5
            ? "✅ Under Budget"
            : "👌 On Track",
      };
    });

    const unnecessaryCategories = ["Personal Care"];
    const flaggedUnnecessary = unnecessaryCategories
      .filter((cat) => {
        const amt = categoryTotals[cat] || 0;
        return (amt / totalSpent) * 100 > 15;
      })
      .map((cat) => ({
        category: cat,
        percent: ((categoryTotals[cat] / totalSpent) * 100).toFixed(1),
      }));

    setAiInsights({
      topCategory,
      leastCategory,
      overspentCategories,
      paidRatio,
      budgetSuggestions,
      flaggedUnnecessary,
    });
  }, [expenses]);

  return (
    <Container className="expense-container">
      <h3 className="mb-4">{t.title}</h3>
      <InputGroup className="mb-3">
        <FormControl
          placeholder={t.search}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </InputGroup>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>💡 AI Expense Insights</Card.Title>
            <ul style={{ textAlign: "left", paddingLeft: "1.2rem" }}>
              <li>
                📊 You're mostly spending money on <strong>{aiInsights.topCategory?.[0]}</strong>.
              </li>
              <li>
                💸 You're spending the least on <strong>{aiInsights.leastCategory?.[0]}</strong>.
              </li>
              {aiInsights.overspentCategories.length > 0 ? (() => {
                const essentialCategories = [
                  "Home & Rent",
                  "Health & Medical",
                  "Education & Career",
                  "Childcare & Family Support"
                ];
                const filteredOverspent = aiInsights.overspentCategories.filter(
                  ([cat]) => !essentialCategories.includes(cat)
                );
                if (filteredOverspent.length === 0) {
                  return (
                    <li>✅ Most of your money is going into essential areas. That’s totally fine!</li>
                  );
                } else {
                  return (
                    <li>
                      ⚠️ You're spending a lot on <strong>{filteredOverspent.map(([cat]) => cat).join(", ")}</strong>. Try to reduce if possible.
                    </li>
                  );
                }
              })() : (
                <li>✅ Good job! No area has too much spending.</li>
              )}
              <li>
                💰 So far, most expenses are <strong>{aiInsights.paidRatio > 50 ? "PAID" : "DUE"}</strong>.{" "}
                {aiInsights.paidRatio > 50 ? "You're handling bills well." : "Try to clear dues when you can."}
              </li>
              <li>📋 Your category summary:</li>
<ul>
  {aiInsights.budgetSuggestions.map((s, i) => {
    const essentials = [
      "Home & Rent",
      "Health & Medical",
      "Education & Career",
      "Childcare & Family Support",
    ];
    return (
      <li key={i}>
        {s.category}:{" "}
        {s.status === "⚠️ Over Budget" ? (
          essentials.includes(s.category) ? (
            "This is a necessary cost like rent or health. Don't worry!"
          ) : (
            "Too much spent here. Try to lower it."
          )
        ) : s.status === "✅ Under Budget" ? (
          "You're saving nicely here. Good job!"
        ) : (
          "Spending is balanced."
        )}
      </li>
    );
  })}
</ul>

              {aiInsights.flaggedUnnecessary.length > 0 ? (
                <li>
                  🚫 Try to cut back on extra things like{" "}
                  {aiInsights.flaggedUnnecessary.map((f) => f.category).join(", ")}.
                </li>
              ) : (
                <li>🎯 You're not wasting money. Well done!</li>
              )}
            </ul>
          </Card.Body>
        </Card>
      </motion.div>


      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>{t.startMonth}</Form.Label>
            <Form.Control
              type="month"
              value={startMonth}
              onChange={(e) => setStartMonth(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>{t.endMonth}</Form.Label>
            <Form.Control
              type="month"
              value={endMonth}
              onChange={(e) => setEndMonth(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <Card.Body>
                <Card.Title>{t.total}</Card.Title>
                <Card.Text>
                  ₹{Number(totalExpense).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </Card.Text>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
        <Col md={6}>
          <div className="chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>
        </Col>
      </Row>
      <Form onSubmit={handleSubmit} className="mt-4">
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>{t.name}</Form.Label>
              <Form.Control
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.name}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>{t.desc}</Form.Label>
              <Form.Control
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.desc}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>{t.amount}</Form.Label>
              <Form.Control
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>{t.date}</Form.Label>
              <Form.Control
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>{t.category}</Form.Label>
              <Form.Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select</option>
                {categories.map((cat, i) => (
                  <option key={i} value={cat}>
                    {cat}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4} className="d-flex align-items-center">
            <Form.Check
              type="checkbox"
              label={t.paid}
              checked={isPaid}
              onChange={(e) => setIsPaid(e.target.checked)}
            />
          </Col>
        </Row>
        <Button type="submit" className="mb-3">
          {editing ? t.update : t.add}{" "}
          <FontAwesomeIcon icon={faPlusCircle} className="ms-2" />
        </Button>
      </Form>
      <ListGroup className="mt-3">
        {currentExpenses.map((exp) => (
          <ListGroup.Item
            key={exp.id}
            className="d-flex justify-content-between align-items-center"
          >
            <div>
              <strong>{exp.name}</strong> — ₹
              {Number(exp.amount).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}{" "}
              on {exp.date}
              <br />
              {exp.description} | {exp.category} | {exp.status}
            </div>
            <div className="button-group">
              <Button size="sm" className="me-2" onClick={() => handleEdit(exp)}>
                <FontAwesomeIcon icon={faPenToSquare} /> Edit
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleRemove(exp.id)}
              >
                <FontAwesomeIcon icon={faTrashCan} /> Remove
              </Button>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
      <Button onClick={exportToExcel} className="mt-3">
        <FontAwesomeIcon icon={faFileExcel} className="me-2" /> {t.export}
      </Button>
      <div className="d-flex justify-content-between mt-3">
        <Button onClick={handlePreviousPage} disabled={currentPage === 1}>
          <FontAwesomeIcon icon={faArrowCircleLeft} />
        </Button>
        <Button
          onClick={handleNextPage}
          disabled={currentPage * expensesPerPage >= filteredExpenses.length}
        >
          <FontAwesomeIcon icon={faArrowCircleRight} />
        </Button>
      </div>
    </Container>
  );
}

export default Expenses;


