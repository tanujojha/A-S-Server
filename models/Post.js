const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      max: 500,
    }, 
    img: {
      type: String,
    },
    likes: {
      type: Array,
      default: [],
    },
    comments: [
      {
        userID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        comment: {
          type: String,
          required: true
        },
        date: {
          type: Date,
          default: Date.now
        },
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
