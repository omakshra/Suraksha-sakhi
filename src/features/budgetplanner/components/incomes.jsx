import React, { useState } from "react";

const Incomes = ({ incomes, setIncomes }) => {
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");

  const handleAdd = () => {
    if (desc && amount) {
      setIncomes([...incomes, { desc, amount }]);
      setDesc("");
      setAmount("");
    }
  };

  return (
    <div>
      <h2>➕ Add Income</h2>
      <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" />
      <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" type="number" />
      <button onClick={handleAdd}>Add</button>

      <ul>
        {incomes.map((i, idx) => (
          <li key={idx}>{i.desc} - ₹{i.amount}</li>
        ))}
      </ul>
    </div>
  );
};

export default Incomes;
