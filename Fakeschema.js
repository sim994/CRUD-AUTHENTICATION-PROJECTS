const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

main()
  .then(() => console.log("connection successfully"))
  .catch((err) => console.log("something went wrong", err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/FakeUser");
}

const userSchema = new mongoose.Schema({
  Id: {
    type: String,
    default: uuidv4(), // auto-generate unique ID
  },
  Fullname: {
    type: String,
    required: true,
  },
  Lastname: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
    unique: true, // better to keep Email unique
  },
  Password: {
    type: String,
    required: true, // do NOT use unique here
  },
});

const FakeUser = mongoose.model("signup", userSchema, "signup");
module.exports = FakeUser;
