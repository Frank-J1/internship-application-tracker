const express = require("express");
const db = require("./db/database");
const app = express();

app.use(express.json());

app.get("/ping", (req, res) => {
    res.json({ok: true });
});


app.post("/applications", (req, res) => {
    const { company, role, status } = req.body;
    if (!company || !role){
        return res.status(400).json({
            error: "company and role are required"
        });
    }
    const createdAt = new Date().toISOString();

    db.run(
        `INSERT INTO applications (company, role, status, created_at)
        VALUES (?, ?, ?, ?)`,
        [company, role, status, createdAt],
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
        "SELECT id, company, role, status, created_at FROM applications",
        [],
        (err, rows) => {
            if(err){
                return res.status(500).json({ error: "Failed to fetch applications!" });
            }
            const formatted = rows.map(row => ({
                id: row.id,
                company: row.company,
                role: row.role,
                status: row.status,
                createdAt: row.created_at
            }));
            res.json(formatted);
        }
    );
});

app.delete("/applications/:id", (req, res) => {
    const id = Number(req.params.id); //Convery url variable to a number.

    if (!Number.isInteger(id)){ 
        return res.status(400).json({ error: "Invalid id" });
    }

    db.run(
        "DELETE FROM applications WHERE id = ?", // Delete application from db
        [id],
        function (err){
            if (err){
                return res.status(500).json({ error: "Failed to delete application" });
            }

            if (this.changes === 0){ //Changes is always 0/1, ensure it is exactly 0/1
                return res.status(404).json({ error: "Application not found" });
            }

            return res.status(204).send(); //204 beacuse we dont want to send a JSON messsage
        }
    );
});

app.put("/applications/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)){
        return res.status(400).json({ error: "Invalid id" });
    }

    const { company, role, status } = req.body;
    if(!company || !role || !status){
        return res.status(400).json({ error: "company, role and status are required!" });
    }

    const allowedStatuses = new Set(["applied", "interview", "offer", "rejected"]);
    const finalStatus = String(status).toLowerCase();

    if (!allowedStatuses.has(finalStatus)) {
        return res.status(400).json({ error: "invalid status!"});
    }

    db.run(
        "UPDATE applications SET company = ?, role = ?, status = ? WHERE id = ?", //update the ENTIRE application
        [company, role, finalStatus, id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: "Failed to update applications" });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: "Application not found" });
            }

            res.status(200).json({ id, company, role, status: finalStatus }); //Write the new information to JSON
        }
    );
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});