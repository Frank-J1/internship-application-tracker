const express = require("express");
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
    res.status(201).json({
        message: "Application validated",
        company,
        role
    });
});



app.listen(3000, () => {
    console.log("Server running on port 3000");
});