
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

function Expenses() {
  const [expenses, setExpenses] = useState(() => {
    const savedExpenses = localStorage.getItem("expenses");
    return savedExpenses ? JSON.parse(savedExpenses) : [];
  });
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

  const categories = ["Utility", "Rent", "Groceries", "Entertainment", "Other"];

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !amount || !date || !description || !category) {
      alert("All fields are required, including the category.");
      return;
    }

    const isConfirmed = window.confirm(
      editing ? "Update this expense?" : "Add this expense?"
    );
    if (!isConfirmed) return;

    const expenseData = {
      id: editing ? currentExpense.id : Date.now(),
      name,
      amount,
      date,
      description,
      status: isPaid ? "PAID" : "DUE",
      category,
    };

    if (editing) {
      setExpenses(expenses.map((exp) =>
        exp.id === currentExpense.id ? expenseData : exp
      ));
    } else {
      setExpenses([...expenses, expenseData]);
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
    setCurrentExpense(null);
    setCategory("");
  };

  const handleRemove = (id) => {
    if (window.confirm("Remove this expense?")) {
      setExpenses(expenses.filter((exp) => exp.id !== id));
    }
  };

  const totalExpense = expenses.reduce(
    (total, exp) => total + parseFloat(exp.amount),
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
        [exp.name, exp.description, exp.category || ""]
          .some(val => val.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : expenses;

  const indexOfLastExpense = currentPage * expensesPerPage;
  const indexOfFirstExpense = indexOfLastExpense - expensesPerPage;
  const currentExpenses = filteredExpenses.slice(indexOfFirstExpense, indexOfLastExpense);

  const paginate = (num) => setCurrentPage(num);
  const handlePreviousPage = () => setCurrentPage((p) => (p > 1 ? p - 1 : p));
  const handleNextPage = () =>
    setCurrentPage((p) =>
      p * expensesPerPage < filteredExpenses.length ? p + 1 : p
    );

  const chartData = {
    labels: filteredMonthlyExpenses.map((e) => e.date),
    datasets: [
      {
        label: "Expenses (Filtered by Month)",
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
        title: { display: true, text: "Date" },
      },
      y: {
        title: { display: true, text: "Amount (€)" },
      },
    },
  };

  return (
    <Container className="mt-5">
      <h3 className="mb-4">Expense Tracker</h3>

      <InputGroup className="mb-3">
        <FormControl
          placeholder="Search expenses..."
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </InputGroup>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Start Month</Form.Label>
            <Form.Control
              type="month"
              value={startMonth}
              onChange={(e) => setStartMonth(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <Card.Body>
                <Card.Title>Total Expenses</Card.Title>
                <Card.Text>€{totalExpense.toFixed(2)}</Card.Text>
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
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Expense Name"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Amount (€)</Form.Label>
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
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
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
              label="Paid"
              checked={isPaid}
              onChange={(e) => setIsPaid(e.target.checked)}
            />
          </Col>
        </Row>

        <Button type="submit" className="mb-3">
          {editing ? "Update Expense" : "Add Expense"}
          <FontAwesomeIcon icon={faPlusCircle} className="ms-2" />
        </Button>
      </Form>

      <ListGroup className="mt-3">
        {currentExpenses.map((exp) => (
          <ListGroup.Item key={exp.id}>
            <div>
              <strong>{exp.name}</strong> — €{exp.amount} on {exp.date}<br />
              {exp.description} | {exp.category} | {exp.status}
            </div>
            <div className="mt-2">
              <Button size="sm" className="me-2" onClick={() => handleEdit(exp)}>
                <FontAwesomeIcon icon={faPenToSquare} /> Edit
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleRemove(exp.id)}>
                <FontAwesomeIcon icon={faTrashCan} /> Remove
              </Button>
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
          disabled={currentPage * expensesPerPage >= filteredExpenses.length}
        >
          <FontAwesomeIcon icon={faArrowCircleRight} />
        </Button>
      </div>
    </Container>
  );
}

export default Expenses;
