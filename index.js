var express = require("express");
var router = express.Router();
var User = require("../Schema/UserSchema");
var Admin = require("../Schema/AdminSchema");
var bcrypt = require("bcrypt");
const session = require("express-session");
const jwt = require("jsonwebtoken");

function checklogin(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect("/login");

  try {
    const decoded = jwt.verify(token, "mySecretKey");
    if (decoded.role !== "admin") return res.redirect("/login"); // only admin

    req.user = decoded; // attach admin info
    next();
  } catch (err) {
    return res.redirect("/login");
  }
}

router.get("/login", (req, res) => {
  res.render("login.ejs", { msg: null });
});
router.post("/login/usertable", async (req, res) => {
  let { Email, Password } = req.body;

  try {
    // find admin
    let admin = await Admin.findOne({ Email });
    if (!admin) {
      return res.render("login.ejs", { msg: "Admin Not Found" }); // return stops execution
    }

    // compare password
    const ismatch = await bcrypt.compare(Password, admin.Password);
    if (!ismatch) {
      return res.render("login.ejs", { msg: "Invalid Password" }); // return stops execution
    }

    // generate JWT
    const token = jwt.sign(
      { id: admin._id, email: admin.Email, role: "admin" },
      "mySecretKey",
      { expiresIn: "1d" }
    );

    // set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    });

    // redirect only once
    return res.redirect("/usertable");
  } catch (error) {
    console.error(error);
    return res.status(500).render("login.ejs", { msg: "Something Went Wrong" });
  }
});

router.post('/logout',(req,res) =>{
res.clearCookie('token')
res.redirect('/login')
})


router.post("/usertable/:id/delete", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect("/usertable");
});

router.get("/usertable/adduser", checklogin, function (req, res) {
  res.render("AddUser.ejs", { msg: null });
});

router.post("/usertable/adduser", checklogin, async (req, res) => {
  let { Fullname, Lastname, Email, Password } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(Password, salt);
  try {
    let data = await User.create({
      Fullname,
      Lastname,
      Email,
      Password: hash,
    });

    console.log(data);

    res.redirect("/usertable");
  } catch (error) {
    res.send(error);
    res.status(500);
    res.json({ Msg: "Something Went Wrong" });
  }
});

router.get("/usertable/:id/update", checklogin, async (req, res) => {
  const user = await User.findById(req.params.id);
  res.render("update.ejs", { user });
});

router.post("/usertable/:id/update", checklogin, async (req, res) => {
  const userId = req.params.id;
  let { Fullname, Lastname, Email, Password } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(Password, salt);
  try {
    await User.findByIdAndUpdate(
      userId,
      {
        Fullname,
        Lastname,
        Email,
        Password: hash,
      },
      { new: true }
    );
    res.redirect("/usertable");
  } catch (error) {
    res.send(error);
    res.status(500);
    res.json({ Msg: "Something Went Wrong" });
  }
});


router.get("/usertable", checklogin,async (req, res) => {
  try {
    let data = await User.find();
    res.render("index.ejs", { dt: data });
  } catch (error) {
    console.log(error);
  }
});
module.exports = router;
