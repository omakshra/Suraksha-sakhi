import './incomes.css';
import React, { useState, useEffect } from "react";
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

function Incomes() {
  const selectedLanguage = localStorage.getItem("selectedLanguage") || "en";

  const labels = {
    en: {
      heading: "Incomes",
      total: "Total Income",
      name: "Name",
      description: "Description",
      amount: "Amount",
      date: "Date",
      category: "Category",
      select: "Select",
      add: "Add Income",
      update: "Update Income",
      export: "Export to Excel",
      search: "Search incomes...",
      edit: "Edit",
      remove: "Remove",
      deleteConfirm: "Delete this income?",
      updateConfirm: "Update this income?",
      addConfirm: "Add new income?",
      error: "All fields are required.",
    },
    hi: {
      heading: "आय",
      total: "कुल आय",
      name: "नाम",
      description: "विवरण",
      amount: "राशि",
      date: "तारीख",
      category: "श्रेणी",
      select: "चुनें",
      add: "आय जोड़ें",
      update: "आय अपडेट करें",
      export: "एक्सेल में निर्यात करें",
      search: "आय खोजें...",
      edit: "संपादित करें",
      remove: "हटाएं",
      deleteConfirm: "क्या आप इस आय को हटाना चाहते हैं?",
      updateConfirm: "क्या आप इस आय को अपडेट करना चाहते हैं?",
      addConfirm: "नई आय जोड़ना चाहते हैं?",
      error: "सभी फ़ील्ड आवश्यक हैं।",
    }
  };

  const t = labels[selectedLanguage];

  const [incomes, setIncomes] = useState([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentIncome, setCurrentIncome] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [incomesPerPage] = useState(5);
  const [category, setCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [insights, setInsights] = useState([]);

  const categories = [
    "Salary / Job",
    "Freelance / Home Business",
    "Family Support",
    "Government Schemes",
    "Investments",
    "Side Hustles",
  ];

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "incomes"), (snapshot) => {
      const loaded = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIncomes(loaded);
    });
    return () => unsubscribe();
  }, []);

  // AI Insights Logic
  useEffect(() => {
    if (!incomes.length) return;

    const categoryTotals = {};
    incomes.forEach((inc) => {
      const cat = inc.category || "Uncategorized";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(inc.amount);
    });

    const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const aiTips = [];

    if (sorted.length) {
      const [topCat, topAmt] = sorted[0];
      aiTips.push(`💰 Top income source: "${topCat}" with ₹${topAmt.toFixed(2)}.`);
    }

    sorted.forEach(([cat, amt]) => {
  const contribution = amt / total;
  if (contribution < 0.1) {
    const targetAmount = total * 0.1;
    const neededGrowth = targetAmount - amt;
    aiTips.push(
      `⚠️ "${cat}" is contributing only ₹${amt.toFixed(2)}. Try increasing it by ₹${neededGrowth.toFixed(2)} to reach 10% of your total income.`
    );
  }
});


    if (sorted[0][1] / total > 0.8) {
      aiTips.push("🔴 Warning: You're relying heavily on one income source. Consider diversifying.");
    } else {
      aiTips.push("✅ Good job! You have a well-balanced income portfolio.");
    }

    setInsights(aiTips);
  }, [incomes]);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(incomes);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Incomes");
    XLSX.writeFile(wb, "Incomes.xlsx");
  };

  const handleEdit = (income) => {
    setEditing(true);
    setCurrentIncome(income);
    setName(income.name);
    setAmount(income.amount);
    setDate(income.date);
    setDescription(income.description);
    setIsPaid(income.status === "PAID");
    setCategory(income.category);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!name || !amount || !date || !description || !category) {
    alert("All fields are required.");
    return;
  }

  const confirmAction = window.confirm(
    editing ? "Update this income?" : "Add new income?"
  );
  if (!confirmAction) return;

  const incomeData = {
    name,
    amount: parseFloat(amount),
    date,
    description,
    status: isPaid ? "PAID" : "DUE",
    category,
  };

  try {
    if (editing && currentIncome) {
      const incomeDocRef = doc(db, "incomes", currentIncome.id);
      await updateDoc(incomeDocRef, incomeData);
    } else {
      await addDoc(collection(db, "incomes"), incomeData);
    }
    resetForm();
  } catch (error) {
    console.error("Error saving income:", error);
    alert("Error saving income. Check console for details.");
  }
};


  const resetForm = () => {
    setName("");
    setAmount("");
    setDate("");
    setDescription("");
    setIsPaid(false);
    setEditing(false);
    setCurrentIncome(null);
    setCategory("");
  };

  const handleRemove = async (id) => {
  const confirmDelete = window.confirm("Delete this income?");
  if (!confirmDelete) return;

    try {
      const incomeDocRef = doc(db, "incomes", id);
      await deleteDoc(incomeDocRef);
    } catch (error) {
      console.error("Error deleting income:", error);
      alert("Error deleting income. Check console for details.");
    }
  };

  const totalIncome = incomes.reduce(
    (total, income) => total + parseFloat(income.amount || 0),
    0
  );

  const filteredIncomes = searchQuery
    ? incomes.filter(
        (income) =>
          income.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          income.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (income.category?.toLowerCase() || "").includes(searchQuery.toLowerCase())
      )
    : incomes;

  const indexOfLast = currentPage * incomesPerPage;
  const indexOfFirst = indexOfLast - incomesPerPage;
  const currentIncomes = filteredIncomes.slice(indexOfFirst, indexOfLast);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) =>
      prev * incomesPerPage < filteredIncomes.length ? prev + 1 : prev
    );
  };

  const chartData = {
    labels: incomes.map((i) => new Date(i.date)),
    datasets: [
      {
        label: t.total,
        data: incomes.map((i) => i.amount),
        backgroundColor: "rgba(75,192,192,0.2)",
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    scales: {
      x: {
        type: "time",
        time: { unit: "day" },
        title: { display: true, text: "Date" },
      },
      y: { title: { display: true, text: "Income (₹)" } },
    },
  };

  return (
    <Container className="income-container">
      <h2 className="mb-3">{t.heading}</h2>

      <InputGroup className="mb-3">
        <FormControl
          placeholder={t.search}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </InputGroup>

      {insights.length > 0 && (
        <Card className="mb-3 bg-light p-3">
          <h5>💡 AI Insights</h5>
          <ul style={{ textAlign: "left", paddingLeft: "20px" }}>
            {insights.map((tip, i) => (
            <li key={i}>{tip}</li>
            ))}
        </ul>

        </Card>
      )}

      <Row>
        <Col md={6}>
          <Card className="mt-3">
            <Card.Body>
              <Card.Title>{t.total}</Card.Title>
              <Card.Text>Total: ₹{totalIncome.toFixed(2)}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <div className="chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>
        </Col>
      </Row>

      <Form onSubmit={handleSubmit} className="mt-4">
        <Row>
          <Col md={4}>
            <Form.Group>
              <Form.Label>{t.name}</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>{t.description}</Form.Label>
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
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>{t.date}</Form.Label>
              <Form.Control
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>{t.category}</Form.Label>
              <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">{t.select}</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Button type="submit" className="mt-3">
          {editing ? t.update : t.add} <FontAwesomeIcon icon={faPlusCircle} className="ms-2" />
        </Button>
      </Form>

      <ListGroup className="mt-4">
        {currentIncomes.map((income) => (
          <ListGroup.Item key={income.id}>
            <div className="d-flex justify-content-between align-items-center">
              <span>
                {income.name} - ₹{income.amount} - {income.date} - {income.description} -{" "}
                {income.category}
              </span>
              <div>
                <Button size="sm" className="me-2" onClick={() => handleEdit(income)}>
                  <FontAwesomeIcon icon={faPenToSquare} /> {t.edit}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemove(income.id)}
                >
                  <FontAwesomeIcon icon={faTrashCan} /> Remove
                </Button>
              </div>
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
          disabled={currentPage * incomesPerPage >= filteredIncomes.length}
        >
          <FontAwesomeIcon icon={faArrowCircleRight} />
        </Button>
      </div>
    </Container>
  );
}

export default Incomes;
