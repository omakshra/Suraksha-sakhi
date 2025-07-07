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

  // ✅ Corrected: Detect localStorage changes using the correct key
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

  const categories = ["Utility", "Rent", "Groceries", "Entertainment", "Other"];

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

  return (
    <Container className="expense-container">
      <h3 className="mb-4">{t.title}</h3>
      <InputGroup className="mb-3">
        <FormControl
          placeholder={t.search}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </InputGroup>
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
