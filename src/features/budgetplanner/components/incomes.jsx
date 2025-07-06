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

import {
  db,
  ref,
  push,
  set,
  onValue,
  remove,
  update,
} from "../../firebase"; // 🔁 Adjust path as needed

function Incomes() {
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

  const categories = ["Salary", "Freelance", "Investment", "Other"];

  // 🔁 Load incomes from Firebase on mount
  useEffect(() => {
    const incomesRef = ref(db, "incomes");
    const unsubscribe = onValue(incomesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loaded = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setIncomes(loaded);
      } else {
        setIncomes([]);
      }
    });

    return () => unsubscribe();
  }, []);

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

    const confirm = window.confirm(
      editing ? "Update this income?" : "Add new income?"
    );
    if (!confirm) return;

    const incomeData = {
      name,
      amount,
      date,
      description,
      status: isPaid ? "PAID" : "DUE",
      category,
    };

    if (editing) {
      await update(ref(db, `incomes/${currentIncome.id}`), incomeData);
    } else {
      const newRef = push(ref(db, "incomes"));
      await set(newRef, incomeData);
    }

    resetForm();
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
    const confirm = window.confirm("Delete this income?");
    if (confirm) {
      await remove(ref(db, `incomes/${id}`));
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
        label: "Total Income",
        data: incomes.map((i) => i.amount),
        backgroundColor: "rgba(75,192,192,0.2)",
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    scales: {
      x: { type: "time", time: { unit: "day" }, title: { display: true, text: "Date" } },
      y: { title: { display: true, text: "Income (₹)" } },
    },
  };

  return (
    <Container className="income-container">
      <h2 className="mb-3">Incomes</h2>

      <InputGroup className="mb-3">
        <FormControl
          placeholder="Search incomes..."
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </InputGroup>

      <Row>
        <Col md={6}>
          <Card className="mt-3">
            <Card.Body>
              <Card.Title>Total Income</Card.Title>
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
              <Form.Label>Name</Form.Label>
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
              <Form.Label>Description</Form.Label>
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
              <Form.Label>Amount</Form.Label>
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
              <Form.Label>Date</Form.Label>
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
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Button type="submit" className="mt-3">
          {editing ? "Update" : "Add Income"}{" "}
          <FontAwesomeIcon icon={faPlusCircle} className="ms-2" />
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
                  <FontAwesomeIcon icon={faPenToSquare} /> Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleRemove(income.id)}>
                  <FontAwesomeIcon icon={faTrashCan} /> Remove
                </Button>
              </div>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>

      <Button onClick={exportToExcel} className="mt-3">
        <FontAwesomeIcon icon={faFileExcel} className="me-2" /> Export to Excel
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
