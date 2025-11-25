const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// READ DATA
app.get("/data", (req, res) => {
  const data = JSON.parse(fs.readFileSync("data.json", "utf-8"));
  res.json(data);
});

// CREATE
app.post("/data", (req, res) => {
  const data = JSON.parse(fs.readFileSync("data.json", "utf-8"));
  const newData = req.body;

  newData.id = data.length + 1;
  data.push(newData);

  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
  res.json({ message: "Data berhasil ditambahkan!", data: newData });
});

// UPDATE
app.put("/data/:id", (req, res) => {
  const data = JSON.parse(fs.readFileSync("data.json", "utf-8"));
  const id = parseInt(req.params.id);

  const index = data.findIndex(item => item.id === id);
  if (index === -1) return res.json({ message: "ID tidak ditemukan!" });

  data[index] = { ...data[index], ...req.body };

  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
  res.json({ message: "Data berhasil diupdate!", data: data[index] });
});

// DELETE
app.delete("/data/:id", (req, res) => {
  let data = JSON.parse(fs.readFileSync("data.json", "utf-8"));
  const id = parseInt(req.params.id);

  data = data.filter(item => item.id !== id);

  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
  res.json({ message: "Data berhasil dihapus!" });
});

app.listen(3000, () => {
  console.log("API berjalan di http://localhost:3000/data");
});
