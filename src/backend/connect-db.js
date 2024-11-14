import { connect } from "mongoose";
import mongoose from 'mongoose';

const mongo_username = "yoonuooh";
const mongo_password = "70005812";

connect(`mongodb+srv://${mongo_username}:${mongo_password}@noticeboard.joumi.mongodb.net/?retryWrites=true&w=majority&appName=NoticeBoard`)
  .then(() => console.log("Connected!"))
  .catch(() => console.log("Failed.."))

const noticeSchema = new mongoose.Schema({
  title: String,
  created_at: String,
  content: mongoose.Schema.Types.Mixed,
});
export const Notice = mongoose.model('Document', noticeSchema);