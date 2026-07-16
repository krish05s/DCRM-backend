const express = require("express");
const db = require("../db");
const authenticateAndAuthorize = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/add", authenticateAndAuthorize("Super Admin"), (req, res) => {
    const {
        organization_name,
        industry,
        email,
        address_1,
        address_2,
        country,
        state,
        city,
        pincode,
        gst_number,
        contact_1,
        contact_2,
        benificiary_name,
        bank_name,
        account_no,
        account_type,
        ifsc_code,
        micr_code,
    } = req.body;

// validation for require this 5 field 
  const requiredFields = [
    { value: organization_name, label: "Organization Name" },
    { value: email, label: "Email" },
    { value: address_1, label: "Address Line 1" },
    { value: country, label: "Country" },
    { value: state, label: "State" },
  ];

  for (const field of requiredFields) {
    if (!field.value?.trim()) {
      return res.status(400).json({
        success: false,
        message: `${field.label} is required`,
      });
    }
  }


    const sql = `INSERT INTO organizations (
    organization_name, industry, email, address_1, address_2, country, state, city, pincode, gst_number, contact_1,
    contact_2, benificiary_name, bank_name, account_no, account_type, ifsc_code, micr_code 
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `;

    const values = [
        organization_name,
        industry,
        email,
        address_1,
        address_2,
        country,
        state,
        city,
        pincode,
        gst_number,
        contact_1,
        contact_2,
        benificiary_name,
        bank_name,
        account_no,
        account_type,
        ifsc_code,
        micr_code,
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error inserting data:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(200).json({ message: "Organization added successfully" });
    })
})


router.get("/read", authenticateAndAuthorize("Super Admin"), (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const offset = (page - 1) * limit

        const countSql = `SELECT COUNT(*) AS total FROM organizations`;

        const dataSql = `SELECT id, organization_name, industry, email, address_1, address_2, country, state, city, pincode, gst_number, contact_1, contact_2, benificiary_name, bank_name, account_no, account_type, ifsc_code, micr_code FROM organizations
        LIMIT ? OFFSET ?`;

        db.query(countSql, (countErr, countResult) => {
            if (countErr) {
                console.error(countErr);
                return res.status(500).json({ error: "Count query failed" });
            }

            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);

            db.query(dataSql, [limit, offset], (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: "Data fetch failed" });
                }

                res.status(200).json({
                    currentPage: page,
                    totalPages,
                    totalRecords: total,
                    limit,
                    data: results,
                })
            })
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
})



router.get("/get-column-scroll", authenticateAndAuthorize("Super Admin"), async (req, res) => {
  const { column, direction, offset = 0, limit = 5 } = req.query;

  const allowedColumns = ["organization_name", "email", "address_1", "country", "state"];
  if (!allowedColumns.includes(column)) {
    return res.status(400).json({ success: false, message: "Invalid column" });
  }

  const [countRows] = await db.promise().query("SELECT COUNT(*) AS total FROM organizations");
  const total = countRows[0].total;

  let newOffset = Number(offset);
  if (direction === "down") newOffset = Math.min(newOffset + 1, Math.max(total - limit, 0));
  else if (direction === "up") newOffset = Math.max(newOffset - 1, 0);

  const [rows] = await db.promise().query(
    `SELECT ?? FROM organizations ORDER BY id ASC LIMIT ? OFFSET ?`,
    [column, Number(limit), newOffset]
  );

  res.json({ success: true, data: rows, newOffset, total });
});


router.get("/organization-name", (req, res) => {
  const sql = ` SELECT id, organization_name FROM organizations ORDER BY organization_name ASC `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("Error fetching organizations:", err);
      return res.status(500).json({
        success: false,
        message: "Database error",
        error: err.message,
      });
    }

    res.json({success: true, data: rows});
  });
});

// Update organization data
router.put("/update/:id", authenticateAndAuthorize("Super Admin"), (req, res) => {
    const { id } = req.params;
    const {
        organization_name,
        industry,
        email,
        address_1,
        address_2,
        country,
        state,
        city,
        pincode,
        gst_number,
        contact_1,
        contact_2,
        benificiary_name,
        bank_name,
        account_no,
        account_type,
        ifsc_code,
        micr_code,
    } = req.body;

// validation for require this 5 field 
  const requiredFields = [
    { value: organization_name, label: "Organization Name" },
    { value: email, label: "Email" },
    { value: address_1, label: "Address Line 1" },
    { value: country, label: "Country" },
    { value: state, label: "State" },
  ];

  for (const field of requiredFields) {
    if (!field.value?.trim()) {
      return res.status(400).json({
        success: false,
        message: `${field.label} is required`,
      });
    }
  }


    const sql = `UPDATE organizations SET 
        organization_name = ?, industry = ?, email = ?, address_1 = ?, address_2 = ?, country = ?, state = ?, city = ?, pincode = ?, gst_number = ?, contact_1 = ?,
        contact_2 = ?, benificiary_name = ?, bank_name = ?, account_no = ?, account_type = ?, ifsc_code = ?, micr_code = ? 
        WHERE id = ?`;

    const values = [
        organization_name,
        industry,
        email,
        address_1,
        address_2,
        country,
        state,
        city,
        pincode,
        gst_number,
        contact_1,
        contact_2,
        benificiary_name,
        bank_name,
        account_no,
        account_type,
        ifsc_code,
        micr_code,
        id,
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error updating organization:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Organization not found" });
        }
        res.status(200).json({ message: "Organization updated successfully" });
    });
});

// Delete organization data
router.delete("/:id", authenticateAndAuthorize("Super Admin"), (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM organizations WHERE id = ?`;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error deleting organization:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Organization not found" });
        }
        res.status(200).json({ message: "Organization deleted successfully" });
    });
});

module.exports = router;