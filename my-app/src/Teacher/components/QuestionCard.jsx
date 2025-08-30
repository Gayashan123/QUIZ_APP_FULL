import React from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip
} from "@mui/material";
import { DeleteOutline, CheckCircle, Radio } from "@mui/icons-material";

export default function QuestionCard({ question, index, onRemove }) {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        borderRadius: 2,
        borderLeft: "4px solid #4f46e5",
        position: "relative",
        "&:hover": {
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box>
          <Typography fontWeight={600} sx={{ mb: 1 }}>
            Q{index + 1}: {question.text}
          </Typography>
          <Box sx={{ ml: 1 }}>
            {question.options.map((opt, idx) => (
              <Typography
                key={idx}
                variant="body2"
                sx={{
                  color: idx === question.correctAnswer ? "#4f46e5" : "#64748b",
                  fontWeight: idx === question.correctAnswer ? 600 : "normal",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 0.5
                }}
              >
                {idx === question.correctAnswer ? (
                  <CheckCircle color="success" sx={{ fontSize: 16 }} />
                ) : (
                  <Radio color="primary" sx={{ p: 0.5 }} disabled />
                )}
                {opt}
              </Typography>
            ))}
          </Box>
          <Chip
            label={`${question.points} point${question.points !== 1 ? "s" : ""}`}
            size="small"
            sx={{ mt: 1, background: "#e0e7ff", color: "#4f46e5" }}
          />
        </Box>
        <IconButton
          onClick={() => onRemove(index)}
          color="error"
          size="small"
          sx={{ alignSelf: "flex-start" }}
        >
          <DeleteOutline />
        </IconButton>
      </Box>
    </Paper>
  );
}