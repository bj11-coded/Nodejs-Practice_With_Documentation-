import mongoose from "mongoose";

const bookschema = new mongoose.Schema({
  title: {
    required: true,
    type: String,
  },
  // many to many relationship
  author: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      required: true,
    },
  ],
  price: {
    required: true,
    type: Number,
  },
  genre: {
    required: true,
    type: String,
  },
  publisher: {
    required: true,
    type: String,
  },
});

export default mongoose.model("Book", bookschema);
