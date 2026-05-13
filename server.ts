import express from "express";
import path from "path";
import multer from "multer";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import * as xlsx from "xlsx";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const UPLOAD_DIR = path.join(process.cwd(), "data");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Fixed filename as requested
const FIXED_FILENAME = "planilha_qualidade.xlsx";
const FIXED_FILEPATH = path.join(UPLOAD_DIR, FIXED_FILENAME);

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => {
      // Overwrite the specific fixed file
      cb(null, FIXED_FILENAME);
    },
  }),
});

async function startServer() {
  // API route to get data
  app.get("/api/data", (req, res) => {
    try {
      if (!fs.existsSync(FIXED_FILEPATH)) {
        return res.status(404).json({ error: "Arquivo não encontrado. Faça o upload manual primeiro." });
      }

      const workbook = xlsx.readFile(FIXED_FILEPATH);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Parse as array of arrays to have strict control over columns A-H and S
      const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as any[][];

      if (rawData.length === 0) {
        return res.json([]);
      }

      // First row is usually headers, find the ones we want based on column indices.
      // A-H are indices 0-7, S is 18
      const formattedData = rawData.slice(1).map((row, idx) => {
        return {
          id: idx, // Adding an id for react rendering mapping
          codigo: row[0] || "",
          descricao: row[1] || "",
          fabricante: row[2] || "",
          marca: row[3] || "",
          data: row[4] || "",
          local: row[5] || "",
          aprovado: row[6] === undefined ? "" : row[6],
          reprovado: row[7] === undefined ? "" : row[7],
          parecer: row[18] || "",
        };
      }).filter(r => r.codigo || r.descricao); // basic filter to remove empty trailing rows

      res.json(formattedData);
    } catch (err) {
      console.error("Error reading file:", err);
      res.status(500).json({ error: "Erro ao ler a planilha" });
    }
  });

  // API route to upload file
  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }
    res.json({ message: "Upload concluído com sucesso!" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
