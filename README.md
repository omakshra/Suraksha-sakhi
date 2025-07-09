try it out link - https://suraksha-sakhi-git-main-omakshras-projects.vercel.app/
---

# 🌸 Suraksha Sakhi

**Suraksha Sakhi is a smart digital friend that helps women confidently manage money, understand documents, and get clear, trustworthy answers to financial, legal, and business questions.** It offers a friendly chatbot advisor, a simple visual budget planner, and a document transcriber with translation and summarization—designed for local languages, low data use, and voice-first access, meeting women where they are and helping them take charge of their future.

---

## ✨ Features

✅ Chatbot advisor for financial, legal, and business-related queries
✅ Visual budget planner with simple income-expense tracking and insights
✅ Document transcriber with translation and summarization
✅ Multilingual, voice-first, and low-data accessible design
✅ Lightweight, user-friendly interface for women in rural and semi-urban settings

---

## 🚀 Tech Stack

* **Frontend:** React.js, Tailwind CSS
* **Backend:** Node.js, Express
* **Database:** Firebase Firestore
* **OCR:** Tesseract.js
* **Translation:** Mistral (via API)
* **Chatbot and Summarization:** OpenAI (via API)
* **Deployment:** Vercel (frontend), Railway/Render (backend planned)

---

## 🛠️ Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/suraksha-sakhi.git
cd suraksha-sakhi
```

---

### 2️⃣ Run the Frontend


1. Install dependencies:

   ```bash
   npm install
   ```
2. Start the frontend:

   ```bash
   npm start
   ```
3. The app will run locally at:

   ```
   http://localhost:3000
   ```

---

### 3️⃣ Run the Chatbot Server

1. Navigate to your chatbot backend directory if it is separate:

   ```bash
   cd suraksha-sakhi/src/features/server
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Add your environment variable:

   * Create a `.env` file and add:

     ```
     OPENROUTER_API_KEY=your_api_key_here
     ```
4. Start the chatbot server:

   ```bash
   node index.js
   ```
5. The server will run locally at:

   ```
   http://localhost:5000
   ```
6. Ensure your frontend fetch calls point to this local server or your deployed backend URL.

---

## 📦 Deployment

Frontend: Deployed on Vercel for fast, scalable hosting.
Backend: Also deployed on Vercel using Serverless Functions for chatbot API functionality, ensuring seamless integration within the same environment.

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss proposed changes.

---

## 📄 License

MIT License.

---

## 📬 Contact

For queries, reach out at:

* Email: akshratvm@gmail.com or vasundharaa.1720@gmail.com , pragalyajs92@gmail.com

---


