var express = require("express");
var router = express.Router();
var bcrypt = require("bcryptjs");
const session = require("express-session");
const jwt = require("jsonwebtoken");
var FakeUser = require("../Schema/Fakeschema");

let checklogin = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.redirect("/signup");

  try {
    const decoded = jwt.verify(token, "screate");
    if (decoded.role !== "user") return res.redirect("/signup"); // only admin

    req.user = decoded; // attach admin info
    next();
  } catch (err) {
    return res.redirect("/signup");
  }
};

router.get("/signup", (req, res) => {
  res.render("index.ejs");
});
router.post("/signup", async (req, res) => {
  let { Fullname, Lastname, Email, Password } = req.body;

  try {
    let salt = await bcrypt.genSalt(10);
    let hash = await bcrypt.hash(Password, salt);

    let Data = await FakeUser.create({
      Fullname,
      Lastname,
      Email,
      Password: hash,
    });
    let token = jwt.sign(
      { id: Data.Id, email: Data.Email, role: "user" },
      "screate",
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    });
    req.session.fullname = Data.Fullname;
    return res.redirect("/message");
  } catch (error) {
    res.status(404);
    res.json({ msg: "Sorry You Can't Sign Up" });
  }
});
router.get("/message",checklogin, (req, res) => {
  res.send(`Wellcome ${req.session.fullname}`);
});

module.exports = router;
