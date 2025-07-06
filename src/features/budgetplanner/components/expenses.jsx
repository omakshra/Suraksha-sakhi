import React, { useState } from "react";

const Expenses = ({ expenses, setExpenses }) => {
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");

  const handleAdd = () => {
    if (desc && amount) {
      setExpenses([...expenses, { desc, amount }]);
      setDesc("");
      setAmount("");
    }
  };

  return (
    <div>
      <h2>➖ Add Expense</h2>
      <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" />
      <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" type="number" />
      <button onClick={handleAdd}>Add</button>

      <ul>
        {expenses.map((e, idx) => (
          <li key={idx}>{e.desc} - ₹{e.amount}</li>
        ))}
      </ul>
    </div>
  );
};

export default Expenses;
