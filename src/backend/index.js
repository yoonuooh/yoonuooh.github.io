import express from "express";
import cors from "cors"
import { Notice } from "./connect-db.js"

const app = express();
const port = 5000;
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Insert Data
app.post("/api/insert_data", async (req, res) => {
  const TIME_ZONE = 9 * 60 * 60 * 1000;
  const date = new Date();
  const now = new Date(date.getTime() + TIME_ZONE).toISOString().replace('T', ' ').slice(0, -5);

  const { title, message } = req.body;
  const newNotice = new Notice({
    title: title,
    created_at: now,
    content: message,
  });

  try {
    const result = await newNotice.save();
    res.json({ received: result, status: 'Success' });
    console.log("Insert Data Success!");
  } catch (err) {
    console.error('Insert Data Fail:', err);
  }
});

// Load Data
app.post("/api/load_data", async (req, res) => {
  try {
    const result = await Notice.find({ title: { $exists: true } });
    console.log(result);
    if (result) {
      res.json(result);
      console.log("Load Data Success!");
    } else {
      res.status(404).json({ message: 'Notice not found' });
    }
  } catch (err) {
    console.error('Load Data Fail:', err);
  }
});

app.listen(port, () => console.log(`Listening on ${port}`));