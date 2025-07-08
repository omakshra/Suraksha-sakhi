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
    graphInsightsTitle: "Graph Insights",
    entries: "Entries",
    trend: "Trend",
    highest: "Highest",
    lowest: "Lowest",
    average: "Average",
    dateAxis: "Date",
    amountAxis: "Income (₹)",
    categories: {
      Salary: "Salary",
      Freelance: "Freelance",
      Business: "Business",
      Investments: "Investments",
      Other: "Other",
    },
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
    graphInsightsTitle: "ग्राफ़ अंतर्दृष्टि",
    entries: "प्रविष्टियाँ",
    trend: "प्रवृत्ति",
    highest: "उच्चतम",
    lowest: "न्यूनतम",
    average: "औसत",
    dateAxis: "तारीख",
    amountAxis: "आय (₹)",
    categories: {
      Salary: "वेतन",
      Freelance: "स्वतंत्र कार्य",
      Business: "व्यवसाय",
      Investments: "निवेश",
      Other: "अन्य",
    },
  },
};

  const t = labels[selectedLanguage];

  const [incomes, setIncomes] = useState([]);
  const [graphInsights, setGraphInsights] = useState([]);
  const [insights, setInsights] = useState([]);
  const [name, setName] = useState(""); 
  const [amount, setAmount] = useState(""); 
  const [date, setDate] = useState(""); 
  const [description, setDescription] = useState(""); 
  const [category, setCategory] = useState(""); 
  const [isPaid, setIsPaid] = useState(false); 
  const [editing, setEditing] = useState(false); 
  const [currentIncome, setCurrentIncome] = useState(null); 
  const [searchQuery, setSearchQuery] = useState(""); 
  const [currentPage, setCurrentPage] = useState(1); 
  const incomesPerPage = 5;  
  const categories = ["Salary", "Freelance", "Business", "Investments", "Other"];

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "incomes"), (snapshot) => {
      const loaded = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setIncomes(loaded);
    });
    return () => unsubscribe();
  }, []);


  // AI Insights Logic – Saving Tips Only

  useEffect(() => {
    if (!incomes.length) return;
    const sorted = [...incomes].sort((a, b) => new Date(a.date) - new Date(b.date));
    const values = sorted.map(i => parseFloat(i.amount));
    const dates = sorted.map(i => i.date);
    const total = values.reduce((a, b) => a + b, 0);
    const avg = total / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const trend = values[values.length - 1] > values[0] ? "increasing" : values[values.length - 1] < values[0] ? "decreasing" : "stable";

    const gi = [
  `${t.entries}: ${values.length}`,
  `${t.trend}: ${trend}`,
  `${t.highest}: ₹${max} on ${dates[values.indexOf(max)]}`,
  `${t.lowest}: ₹${min} on ${dates[values.indexOf(min)]}`,
  `${t.average}: ₹${avg.toFixed(2)}`,
];

    setGraphInsights(gi);
  }, [incomes]);
  // AI Insights Logic

  useEffect(() => {
    if (!incomes.length) return;

    const total = incomes.reduce((sum, inc) => sum + parseFloat(inc.amount || 0), 0);
    const aiTips = [];

    if (total > 0) {
      const tenPercent = (total * 0.1).toFixed(2);
      const fifteenPercent = (total * 0.15).toFixed(2);
      const twentyPercent = (total * 0.2).toFixed(2);
      const goldFive = (total * 0.05).toFixed(2);
      const goldTen = (total * 0.1).toFixed(2);

      aiTips.push(`💡 Your total income is ₹${total.toFixed(2)}. Here's how you can save smartly:`);
      aiTips.push(`🔐 Save at least 10% (~₹${tenPercent}) in a Recurring Deposit (RD) – steady monthly returns.`);
      aiTips.push(`📮 Save 15% (~₹${fifteenPercent}) using Post Office Schemes like POMIS or NSC – safe and government-backed.`);
      aiTips.push(`👑 Invest 5–10% in Gold (~₹${goldFive} to ₹${goldTen}) – try Sovereign Gold Bonds (SGB) or Digital Gold for long-term safety and appreciation.`);
      aiTips.push(`📊 Consider ELSS or PPF to save tax under Section 80C and build wealth. 👉 ` +
  `<a href="https://www.nsiindia.gov.in/(S(kcmfazads4lcngixrnrpr355))/InternalPage.aspx?Id_Pk=27" target="_blank" rel="noopener noreferrer">Click here for more government schemes</a>`);
      aiTips.push(`📈 Saving 20% (~₹${twentyPercent}) every month builds financial security over time. You're on the right track! 💚`);
      aiTips.push(`💭 Tip: Cut down small luxuries and channel that into these saving plans.`);
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
      alert(t.error);
      return;
    }

    const confirmAction = window.confirm(editing ? t.updateConfirm : t.addConfirm);
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
    const confirmDelete = window.confirm(t.deleteConfirm);
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
    datasets: [{
      label: t.total,
      data: incomes.map((i) => i.amount),
      backgroundColor: "rgba(75,192,192,0.2)",
      borderColor: "rgba(75,192,192,1)",
      borderWidth: 2,
      fill: true,
    }],
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
              <li key={i} dangerouslySetInnerHTML={{ __html: tip }}></li>
            ))}
          </ul>

          <h5>AI Insights</h5>
          <div style={{ textAlign: "left", paddingLeft: "10px" }}>
            {insights.map((tip, i) => <div key={i}>{tip}</div>)}
          </div>

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

          {graphInsights.length > 0 && (
            <Card className="mt-3 bg-light p-3">
              <h6 style={{ fontWeight: "bold" }}>{t.graphInsightsTitle}</h6>
              <div style={{ paddingLeft: "10px" }}>
                {graphInsights.map((insight, index) => <div key={index}>{insight}</div>)}
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
    <option key={idx} value={cat}>
      {t.categories[cat] || cat}
    </option>
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
                {t.categories[income.category] || income.category}

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
                  <FontAwesomeIcon icon={faTrashCan} /> {t.remove}
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
