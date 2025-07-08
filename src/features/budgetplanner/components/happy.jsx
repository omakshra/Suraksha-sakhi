// src/features/budgetplanner/components/happy.jsx

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, ListGroup, InputGroup } from "react-bootstrap";
import { db } from "../../../utils/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import "./../../budgetplanner/BudgetApp.css";

const Happy = () => {
  const selectedLanguage = localStorage.getItem("selectedLanguage") || "en";

  const labels = {
    en: {
      title: "😊 Your Happiness Index",
      goals: "🎯 Personal Goals",
      goalPlaceholder: "e.g., Learn coding, Attend yoga",
      addGoal: "Add Goal",
      wishlist: "💖 Wishlist Dreams",
      wishPlaceholder: "e.g., DSLR, Solo trip",
      addWish: "Add Wish",
      completeQuestion: "✅ Have you completed your goals?",
      goalCompleted: "🎉 Goal Completed!",
      scoreTitle: "🎉 Happiness Score",
      noGoals: "Set your personal goals above to get started 💜",
      highMsg: "🌺 You're living your dream life, Sakhi! Shine bright 💫",
      midMsg: "💪 You're getting closer to your goals. Keep going!",
      lowMsg: "🚀 Let’s invest more in *you*. You deserve happiness 💜",
    },
    hi: {
      title: "😊 आपकी हैप्पीनेस इंडेक्स",
      goals: "🎯 व्यक्तिगत लक्ष्य",
      goalPlaceholder: "जैसे, कोडिंग सीखें, योग कक्षा में जाएं",
      addGoal: "लक्ष्य जोड़ें",
      wishlist: "💖 इच्छा सूची सपने",
      wishPlaceholder: "जैसे, DSLR, सोलो ट्रिप",
      addWish: "इच्छा जोड़ें",
      completeQuestion: "✅ क्या आपने अपने लक्ष्य पूरे कर लिए हैं?",
      goalCompleted: "🎉 लक्ष्य पूरा हुआ!",
      scoreTitle: "🎉 हैप्पीनेस स्कोर",
      noGoals: "शुरू करने के लिए ऊपर अपने लक्ष्य सेट करें 💜",
      highMsg: "🌺 आप अपने सपनों की ज़िंदगी जी रही हैं, सखी! चमकती रहें 💫",
      midMsg: "💪 आप अपने लक्ष्यों के करीब पहुँच रही हैं। जारी रखें!",
      lowMsg: "🚀 चलिए *आप* में और निवेश करते हैं। आप खुशियाँ डिज़र्व करती हैं 💜",
    },
  };

  const t = labels[selectedLanguage];

  const [goals, setGoals] = useState([]);
  const [completedGoals, setCompletedGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");

  const [wishlist, setWishlist] = useState([]);
  const [newWish, setNewWish] = useState("");

  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editingWishId, setEditingWishId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    const fetchGoals = async () => {
      const snap = await getDocs(collection(db, "happy_goals"));
      setGoals(snap.docs.map((doc) => ({ id: doc.id, name: doc.data().name })));
    };

    const fetchCompleted = async () => {
      const snap = await getDocs(collection(db, "completed_goals"));
      setCompletedGoals(snap.docs.map((doc) => doc.data().name));
    };

    const fetchWishlist = async () => {
      const snap = await getDocs(collection(db, "happy_wishlist"));
      setWishlist(snap.docs.map((doc) => ({ id: doc.id, item: doc.data().item })));
    };

    fetchGoals();
    fetchCompleted();
    fetchWishlist();
  }, []);

  const handleCompleteGoal = async (goal) => {
    await setDoc(doc(db, "completed_goals", goal), { name: goal });
    if (!completedGoals.includes(goal)) {
      setCompletedGoals([...completedGoals, goal]);
    }
  };

  const handleEdit = async (type, id, newText) => {
    if (type === "goal") {
      await updateDoc(doc(db, "happy_goals", id), { name: newText });
      setGoals(goals.map((g) => (g.id === id ? { ...g, name: newText } : g)));
      setEditingGoalId(null);
    } else if (type === "wish") {
      await updateDoc(doc(db, "happy_wishlist", id), { item: newText });
      setWishlist(wishlist.map((w) => (w.id === id ? { ...w, item: newText } : w)));
      setEditingWishId(null);
    }
  };

  const handleDelete = async (type, id) => {
    if (type === "goal") {
      await deleteDoc(doc(db, "happy_goals", id));
      setGoals(goals.filter((g) => g.id !== id));
    } else if (type === "wish") {
      await deleteDoc(doc(db, "happy_wishlist", id));
      setWishlist(wishlist.filter((w) => w.id !== id));
    }
  };

  const goalNames = goals.map((g) => g.name);
  const uniqueCompletedGoals = Array.from(new Set(completedGoals)).filter((name) =>
    goalNames.includes(name)
  );

  const totalGoals = goalNames.length;
  const completedCount = uniqueCompletedGoals.length;
  const score = totalGoals === 0 ? 0 : Math.min(100, Math.round((completedCount / totalGoals) * 100));

  return (
    <Container className="mt-5">
      <h2 className="text-center dashboard-title mb-4">{t.title}</h2>

      <Row className="mb-4">
        <Col md={6}>
          <Card className="info-card">
            <Card.Body>
              <Card.Title className="info-card-title">{t.goals}</Card.Title>
              <Form>
                <Form.Control
                  type="text"
                  value={newGoal}
                  placeholder={t.goalPlaceholder}
                  onChange={(e) => setNewGoal(e.target.value)}
                />
                <Button
                  className="mt-2 secondary-button"
                  onClick={async () => {
                    if (newGoal.trim()) {
                      const docRef = await addDoc(collection(db, "happy_goals"), {
                        name: newGoal.trim(),
                      });
                      setGoals([...goals, { id: docRef.id, name: newGoal.trim() }]);
                      setNewGoal("");
                    }
                  }}
                >
                  {t.addGoal}
                </Button>
              </Form>
              <ListGroup className="mt-3">
                {goals.map((g) => (
                  <ListGroup.Item key={g.id}>
                    {editingGoalId === g.id ? (
                      <InputGroup>
                        <Form.Control
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                        />
                        <Button size="sm" onClick={() => handleEdit("goal", g.id, editText)}>
                          Save
                        </Button>
                      </InputGroup>
                    ) : (
                      <>
                        🌼 {g.name}
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => {
                            setEditingGoalId(g.id);
                            setEditText(g.name);
                          }}
                        >
                          ✏️
                        </Button>
                        <Button variant="link" size="sm" onClick={() => handleDelete("goal", g.id)}>
                          🗑️
                        </Button>
                      </>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="info-card">
            <Card.Body>
              <Card.Title className="info-card-title">{t.wishlist}</Card.Title>
              <Form>
                <Form.Control
                  type="text"
                  value={newWish}
                  placeholder={t.wishPlaceholder}
                  onChange={(e) => setNewWish(e.target.value)}
                />
                <Button
                  className="mt-2 secondary-button"
                  onClick={async () => {
                    if (newWish.trim()) {
                      const docRef = await addDoc(collection(db, "happy_wishlist"), {
                        item: newWish.trim(),
                      });
                      setWishlist([...wishlist, { id: docRef.id, item: newWish.trim() }]);
                      setNewWish("");
                    }
                  }}
                >
                  {t.addWish}
                </Button>
              </Form>
              <ListGroup className="mt-3">
                {wishlist.map((w) => (
                  <ListGroup.Item key={w.id}>
                    {editingWishId === w.id ? (
                      <InputGroup>
                        <Form.Control
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                        />
                        <Button size="sm" onClick={() => handleEdit("wish", w.id, editText)}>
                          Save
                        </Button>
                      </InputGroup>
                    ) : (
                      <>
                        🌟 {w.item}
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => {
                            setEditingWishId(w.id);
                            setEditText(w.item);
                          }}
                        >
                          ✏️
                        </Button>
                        <Button variant="link" size="sm" onClick={() => handleDelete("wish", w.id)}>
                          🗑️
                        </Button>
                      </>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="info-card">
            <Card.Body>
              <Card.Title className="info-card-title">{t.completeQuestion}</Card.Title>
              <ListGroup>
                {goals.map((goal) => (
                  <ListGroup.Item key={goal.id}>
                    <Form.Check
                      type="checkbox"
                      label={goal.name}
                      checked={uniqueCompletedGoals.includes(goal.name)}
                      onChange={() => handleCompleteGoal(goal.name)}
                    />
                    {uniqueCompletedGoals.includes(goal.name) && (
                      <span style={{ marginLeft: "10px", color: "green" }}>{t.goalCompleted}</span>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="info-card" style={{ backgroundColor: "var(--hover-color)", color: "white" }}>
            <Card.Body className="text-center">
              <h4 className="info-card-title">{t.scoreTitle}</h4>
              <p style={{ fontSize: "2rem", fontWeight: "bold" }}>
                {score} / 100 {score > 80 && <span className="emoji-burst">🎉💜✨</span>}
              </p>
              <p>
                {score > 80 ? (
                  <span className="glow-text">{t.highMsg}</span>
                ) : score > 50 ? (
                  <span className="glow-text">{t.midMsg}</span>
                ) : totalGoals === 0 ? (
                  t.noGoals
                ) : (
                  <span>{t.lowMsg}</span>
                )}
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Happy;
