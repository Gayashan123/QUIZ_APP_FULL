import React from "react";
import {
  Grid,
  Typography,
  Card,
  Chip,
  Box,
  Divider
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";

export default function ReviewStep({ quiz }) {
  return (
    <>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          mb: 3,
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: "#2d3748"
        }}
      >
        <CheckCircle color="primary" />
        Review Your Quiz
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Quiz Details
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: "#64748b", mb: 0.5 }}>
                Title
              </Typography>
              <Typography sx={{ fontWeight: 500 }}>{quiz.title}</Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: "#64748b", mb: 0.5 }}>
                Subject
              </Typography>
              <Typography sx={{ fontWeight: 500 }}>{quiz.subject}</Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: "#64748b", mb: 0.5 }}>
                Description
              </Typography>
              <Typography sx={{ fontWeight: 500 }}>
                {quiz.description || "No description provided"}
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" sx={{ color: "#64748b", mb: 0.5 }}>
                  Time Limit
                </Typography>
                <Typography sx={{ fontWeight: 500 }}>
                  {quiz.timeLimit} minutes
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" sx={{ color: "#64748b", mb: 0.5 }}>
                  Passing Score
                </Typography>
                <Typography sx={{ fontWeight: 500 }}>
                  {quiz.passingScore}%
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" sx={{ color: "#64748b", mb: 0.5 }}>
                  Start Date
                </Typography>
                <Typography sx={{ fontWeight: 500 }}>
                  {quiz.startDate || "Not specified"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" sx={{ color: "#64748b", mb: 0.5 }}>
                  Deadline
                </Typography>
                <Typography sx={{ fontWeight: 500 }}>
                  {quiz.deadline || "Not specified"}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, borderRadius: 3, height: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Questions Summary
              </Typography>
              <Chip
                label={`${quiz.questions.length} questions`}
                color="primary"
                sx={{ fontWeight: 600 }}
              />
            </Box>
            
            <Box sx={{ maxHeight: 400, overflowY: "auto", pr: 1 }}>
              {quiz.questions.map((q, i) => (
                <Box
                  key={i}
                  sx={{
                    mb: 3,
                    pb: 2,
                    borderBottom: "1px solid #e2e8f0",
                    "&:last-child": { borderBottom: "none" }
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                    Q{i + 1}: {q.text}
                  </Typography>
                  <Box sx={{ ml: 1 }}>
                    {q.options.map((opt, idx) => (
                      <Typography
                        key={idx}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: idx === q.correctAnswer ? "#4f46e5" : "#64748b",
                          fontWeight: idx === q.correctAnswer ? 600 : "normal",
                          mb: 0.5
                        }}
                      >
                        {idx === q.correctAnswer ? (
                          <CheckCircle color="success" sx={{ fontSize: 16 }} />
                        ) : (
                          <Radio color="primary" sx={{ p: 0.5 }} disabled />
                        )}
                        {opt}
                      </Typography>
                    ))}
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                    <Chip
                      label={`${q.points} point${q.points !== 1 ? "s" : ""}`}
                      size="small"
                      sx={{ background: "#e0e7ff", color: "#4f46e5" }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}