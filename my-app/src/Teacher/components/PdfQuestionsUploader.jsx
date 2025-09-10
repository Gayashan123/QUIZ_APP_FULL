// src/Teacher/components/PdfQuestionsUploader.jsx
import React, { useState } from "react";
import { Box, Paper, Typography, Button, CircularProgress } from "@mui/material";
import { FaUpload } from "react-icons/fa";
import * as pdfjsLib from "pdfjs-dist";

// Set local worker for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.js",
  import.meta.url
).href;

export default function PdfQuestionsUploader({ onExtract, maxSizeMB = 10, disabled = false }) {
  const [isParsing, setIsParsing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState("");

  const browse = async (e) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };

  const onDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  const processFile = async (file) => {
    if (disabled) return;
    if (file.type !== "application/pdf") return setStatus("Please upload a valid PDF file");
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) return setStatus(`File too large. Max allowed is ${maxSizeMB} MB`);

    try {
      setIsParsing(true);
      setStatus("Reading PDF...");
      const buf = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;

      let fullText = "";
      for (let p = 1; p <= pdf.numPages; p++) {
        setStatus(`Extracting text (page ${p}/${pdf.numPages})...`);
        const page = await pdf.getPage(p);
        const content = await page.getTextContent();
        const pageText = content.items.map((it) => it.str).join(" ");
        fullText += "\n" + pageText + "\n";
      }

      setStatus("Analyzing text...");
      const questions = extractQuestions(fullText);

      if (!questions.length) {
        setStatus("No questions detected. Please check PDF formatting and try again.");
      } else {
        setStatus(`Parsed ${questions.length} question(s).`);
        onExtract?.(questions);
      }
    } catch (err) {
      console.error(err);
      setStatus("Failed to parse PDF. Try a different file or adjust formatting.");
    } finally {
      setIsParsing(false);
    }
  };

  function extractQuestions(text) {
    if (!text) return [];
    let normalized = text
      .replace(/\r/g, "\n")
      .replace(/\u00A0/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/(?:^|\s)(Q?\s*\d+)[.)]\s+/g, "\n$1) ")
      .replace(/(?:^|\s)([A-H])[.)-]\s+/g, "\n$1) ")
      .replace(/(?:Ans|Answer)\s*[:\-]\s*/gi, "\nAnswer: ");

    const blocks = normalized
      .split(/\n(?=Q?\s*\d+[).]\s+)/g)
      .map((b) => b.trim())
      .filter((b) => /^Q?\s*\d+[).]\s+/i.test(b));

    const out = [];
    for (const block of blocks) {
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
      const title = lines[0] || "";
      const questionText = title.replace(/^Q?\s*\d+[).]\s*/i, "").trim();

      const optionLines = lines.filter((l) => /^[A-H][).]\s+/i.test(l));
      const options = optionLines.map((l) => l.replace(/^[A-H][).]\s+/i, "").trim());

      let correctIndex = 0;
      const ansLine = lines.find((l) => /^Answer:\s*/i.test(l));
      if (ansLine) {
        const ans = ansLine.replace(/^Answer:\s*/i, "").trim();
        const letter = ans.match(/^[A-H]/i)?.[0]?.toUpperCase();
        if (letter) {
          const idx = "ABCDEFGH".indexOf(letter);
          if (idx >= 0 && idx < options.length) correctIndex = idx;
        } else {
          const num = parseInt(ans, 10);
          if (!isNaN(num) && num >= 1 && num <= options.length) correctIndex = num - 1;
        }
      }

      let points = 1;
      const pts = block.match(/Points?\s*[:\-]\s*(\d+)/i);
      if (pts) {
        const val = parseInt(pts[1], 10);
        if (!isNaN(val) && val > 0) points = val;
      }

      const expIdx = lines.findIndex((l) => /^Explanation[:\-]/i.test(l));
      const explanation =
        expIdx >= 0 ? lines.slice(expIdx).join(" ").replace(/^Explanation[:\-]\s*/i, "") : "";

      if (questionText && options.length >= 2) {
        out.push({
          text: questionText,
          options,
          correctAnswer: Math.max(0, Math.min(correctIndex, options.length - 1)),
          points,
          explanation,
          imageUrl: "",
        });
      }
    }
    return out;
  }

  return (
    <Paper
      elevation={2}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      sx={{
        p: 4,
        borderRadius: 3,
        border: dragOver ? "2px dashed #6366f1" : "2px dashed #e2e8f0",
        textAlign: "center",
        background: dragOver ? "#f0f5ff" : "#f8fafc",
        transition: "all .2s ease",
      }}
    >
      <FaUpload color="#4f46e5" size={48} style={{ marginBottom: 16 }} />
      <Typography variant="h6" sx={{ mb: 1 }}>
        Upload Questions PDF
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Drag & drop your PDF here, or click to choose a file. Max {maxSizeMB}MB.
      </Typography>

      <Button
        disabled={disabled || isParsing}
        variant="contained"
        component="label"
        startIcon={<FaUpload />}
        sx={{
          background: "linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)",
          "&:hover": { background: "linear-gradient(90deg, #4338ca 0%, #6d28d9 100%)" },
        }}
      >
        Select PDF File
        <input type="file" hidden accept="application/pdf" onChange={browse} />
      </Button>

      <Box sx={{ mt: 3, minHeight: 28 }}>
        {isParsing ? (
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={18} thickness={4} />
            <Typography variant="body2" color="text.secondary">
              {status || "Parsing..."}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {status}
          </Typography>
        )}
      </Box>

      <Typography variant="caption" display="block" sx={{ mt: 2, color: "text.secondary" }}>
        Tip: Use “1) Question…”, options “A) … B) … C) … D) …”, and “Answer: C”.
      </Typography>
    </Paper>
  );
}
