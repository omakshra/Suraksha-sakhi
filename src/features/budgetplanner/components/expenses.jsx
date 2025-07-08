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
  const [graphInsights, setGraphInsights] = useState([]);
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


  const selectedLanguage = localStorage.getItem("selectedLanguage") || "en";

  const labels = {
  en: {
    heading: "Expenses",
    search: "Search by category or amount",
    total: "Total Expenses",
    name: "Name",
    description: "Description",
    amount: "Amount",
    date: "Date",
    category: "Category",
    select: "Select",
    add: "Add Expense",
    paid: "Paid",
    update: "Update Expense",
    export: "Export to Excel",
    search: "Search expenses...",
    graphInsightsTitle: "Graph Insights",
    entries: "Entries",
    trend: "Trend",
    highest: "Highest",
    lowest: "Lowest",
    average: "Average",
    dateAxis: "Date",
    amountAxis: "Expense (₹)",
    increasing: "increasing",
    decreasing: "decreasing",
    stable: "stable",
    categories: {
      "Groceries & Essentials": "Groceries & Essentials",
      "Childcare & Family Support": "Childcare & Family Support",
      "Home & Rent": "Home & Rent",
      "Education & Career": "Education & Career",
      "Health & Medical": "Health & Medical",
      "Personal Care": "Personal Care"
    }
  },
  hi: {
    heading: "खर्च",
    total: "कुल खर्च",
    name: "नाम",
    description: "विवरण",
    amount: "राशि",
    date: "तारीख",
    category: "श्रेणी",
    select: "चुनें",
    add: "खर्च जोड़ें",
    paid: "भुगतान किया गया",
    update: "खर्च अपडेट करें",
    export: "एक्सेल में निर्यात करें",
    search: "खर्च खोजें...",
    graphInsightsTitle: "ग्राफ अंतर्दृष्टि",
    entries: "प्रविष्टियाँ",
    trend: "प्रवृत्ति",
    highest: "उच्चतम",
    lowest: "न्यूनतम",
    average: "औसत",
    dateAxis: "तारीख",
    amountAxis: "खर्च (₹)",
    increasing: "बढ़ती हुई",
    decreasing: "घटती हुई",
    stable: "स्थिर",
    categories: {
      "Groceries & Essentials": "किराना और ज़रूरी सामान",
      "Childcare & Family Support": "बच्चों की देखभाल और पारिवारिक सहायता",
      "Home & Rent": "घर और किराया",
      "Education & Career": "शिक्षा और करियर",
      "Health & Medical": "स्वास्थ्य और चिकित्सा",
      "Personal Care": "व्यक्तिगत देखभाल"
    }
  }
};

  const t = labels[selectedLanguage];

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "expenses"), (snapshot) => {
      const loaded = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setExpenses(loaded);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!expenses.length) return;
    const sorted = [...expenses].sort((a, b) => new Date(a.date) - new Date(b.date));
    const values = sorted.map((e) => parseFloat(e.amount));
    const dates = sorted.map((e) => e.date);
    const total = values.reduce((a, b) => a + b, 0);
    const avg = total / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const trend = values[values.length - 1] > values[0] ? t.increasing : values[values.length - 1] < values[0] ? t.decreasing : t.stable;


    const gi = [
  `${t.entries}: ${values.length}`,
  `${t.trend}: ${trend}`,
  `${t.highest}: ₹${max} ${selectedLanguage === "hi" ? "को" : "on"} ${dates[values.indexOf(max)]}`,
  `${t.lowest}: ₹${min} ${selectedLanguage === "hi" ? "को" : "on"} ${dates[values.indexOf(min)]}`,
  `${t.average}: ₹${avg.toFixed(2)}`,
];

    setGraphInsights(gi);
  }, [expenses]);
  const categories = [
  "Groceries & Essentials",
  "Childcare & Family Support",
  "Home & Rent",
  "Education & Career",
  "Health & Medical",
  "Personal Care",
];


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
      label: t.heading, // or hardcode like label: "Expenses"
      data: filteredMonthlyExpenses.map((e) => e.amount),
      borderColor: "rgba(255, 99, 132, 1)",
      backgroundColor: "rgba(255, 99, 132, 0.2)",
      tension: 0.3,
    },
  ],
};

const chartOptions = {
  maintainAspectRatio: false,
  responsive: true,
  scales: {
    x: {
      type: "time",
      time: { unit: "day" },
      title: { display: true, text: t.dateAxis },
    },
    y: {
      title: { display: true, text: t.amountAxis },
    },
  },
};


  return (
    <Container className="expense-container">
<h2 className="mb-3 fw-semibold" style={{ color: "#6f42c1" }}>
  {t.heading}
</h2>

<InputGroup className="mb-3">
  <FormControl
    placeholder={t.search}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
</InputGroup>

<Row className="mb-3">
  <Col md={6}>
    <Form.Group>
      <Form.Label>Start Month</Form.Label>
      <Form.Control
        type="month"
        value={startMonth}
        onChange={(e) => setStartMonth(e.target.value)}
      />
    </Form.Group>
  </Col>
  <Col md={6}>
    <Form.Group>
      <Form.Label>End Month</Form.Label>
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
          <Card className="mt-3">
            <Card.Body>
              <Card.Title>{t.total}</Card.Title>
              <Card.Text>Total: ₹{totalExpense.toFixed(2)}</Card.Text>
            </Card.Body>
          </Card>

          {graphInsights.length > 0 && (
            <Card className="mt-3 bg-light p-3">
              <h6 style={{ fontWeight: "bold" }}>Graph Insights</h6>
              <div style={{ paddingLeft: "10px" }}>
                {graphInsights.map((insight, index) => (
                  <div key={index}>{insight}</div>
                ))}
              </div>
            </Card>
          )}
        </Col>

        <Col md={6}>
          <div className="chart-container" style={{ height: "300px" }}>
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
    <Form.Label>{t.description}</Form.Label> {/* ✅ This is the missing line */}
    <Form.Control
      type="text"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      required
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
    {t.categories[cat] || cat}
  </option>
))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4} className="d-flex align-items-center mt-4">
  <Form.Check
    type="checkbox"
    id="paidCheckbox"
    label={t.paid || "Paid"}
    checked={isPaid}
    onChange={(e) => setIsPaid(e.target.checked)}
    className="mb-0"
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
              {exp.description} | {t.categories[exp.category] || exp.category} | {selectedLanguage === "hi" ? (exp.status === "PAID" ? "भुगतान किया गया" : "बकाया") : exp.status}


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
