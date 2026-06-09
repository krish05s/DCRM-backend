require("dotenv").config();
const db = require("./db");

db.query("DESCRIBE quotation", (err, fields) => {
  if (err) {
    console.error("Error describing quotation:", err);
  } else {
    console.log("=== QUOTATION TABLE SCHEMA ===");
    console.log(fields);
  }
  
  db.query("DESCRIBE quotation_revision", (err2, fields2) => {
    if (err2) {
      console.error("Error describing quotation_revision:", err2);
    } else {
      console.log("=== QUOTATION_REVISION TABLE SCHEMA ===");
      console.log(fields2);
    }
    process.exit(0);
  });
});
