const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

main()
  .then((res) => {
    console.log("connection succefuly");
  })
  .catch((err) => {
    console.log("something went wong");
  });
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/UserAuthentication");
}


const AdminSchema = new mongoose.Schema({
    Id:{
      type:Number,
    },
    Email:{
        type:String,
        require:true,
    },
    
    Password:{
        type:String,
        require:true,
    },
    

  
});


const Admin = mongoose.model("Admin",AdminSchema)

module.exports = Admin