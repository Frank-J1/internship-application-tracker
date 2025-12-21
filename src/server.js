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

app.get("/applications", (req, res) => {
    db.all(
        "SELECT id, company, role, created_at FROM applications",
        [],
        (err, rows) => {
            if(err){
                return res.status(500).json({ error: "Failed to fetch applications!" });
            }
            const formatted = rows.map(row => ({
                id: row.id,
                company: row.company,
                role: row.role,
                createdAt: row.created_at
            }));
            res.json(formatted);
        }
    );
});

app.delete("/applications/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)){
        return res.status(400).json({ error: "Invalid id" });
    }

    db.run(
        "DELETE FROM applications WHERE id = ?",
        [id],
        function (err){
            if (err){
                return res.status(500).json({ error: "Failed to delete application" });
            }

            if (this.changes === 0){
                return res.status(404).json({ error: "Application not found" });
            }

            return res.status(204).send();
        }
    );

});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});