const express = require("express");
const db = require("./db/database");
const app = express();

app.use(express.json());

app.get("/ping", (req, res) => {
    res.json({ok: true });
});


app.post("/applications", (req, res) => {
    const { company, role } = req.body;
    if (!company || !role){
        return res.status(400).json({
            error: "company and role are required"
        });
    }
    const createdAt = new Date().toISOString();

    db.run(
        `INSERT INTO applications (company, role, created_at)
        VALUES (?, ?, ?)`,
        [company, role, createdAt],
        function (err) {
            if (err) {
                return res.status(500).json({ error: "Failed to save application" });
        }

        res.status(201).json({
            id: this.lastID,
            company,
            role,
            createdAt
         });
        }
     );
});



app.listen(3000, () => {
    console.log("Server running on port 3000");
});