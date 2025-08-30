import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Paper,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Button,
  IconButton,
  Chip,
  Box,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Avatar
} from "@mui/material";
import {
  AddCircleOutline,
  DeleteOutline,
  UploadFile,
  CheckCircle,
  Image as ImageIcon,
  Close
} from "@mui/icons-material";

export default function AddQuestionsStep({ quiz, setQuiz, showSnackbar }) {
  const [currentQuestion, setCurrentQuestion] = useState({
    text: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    points: 1,
    explanation: "",
    image: null,
    imageUrl: ""
  });
  const [isUploading, setIsUploading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  const [editIndex, setEditIndex] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Reset edit mode when switching tabs
  useEffect(() => {
    if (tabValue === 1 && editIndex !== null) {
      setEditIndex(null);
      resetCurrentQuestion();
    }
  }, [tabValue]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const validateQuestion = () => {
    const errors = {};
    if (!currentQuestion.text.trim()) {
      errors.text = "Question text is required";
    }
    currentQuestion.options.forEach((opt, idx) => {
      if (!opt.trim()) {
        errors[`option${idx}`] = `Option ${String.fromCharCode(65 + idx)} is required`;
      }
    });
    if (currentQuestion.points < 1) {
      errors.points = "Points must be at least 1";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleOptionChange = (i, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[i] = value;
    setCurrentQuestion((prev) => ({
      ...prev,
      options: newOptions,
    }));
    if (validationErrors[`option${i}`]) {
      setValidationErrors(prev => ({ ...prev, [`option${i}`]: undefined }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        showSnackbar("Please upload an image file (JPEG, PNG)", "error");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        showSnackbar("Image size should be less than 2MB", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentQuestion(prev => ({
          ...prev,
          image: file,
          imageUrl: reader.result
        }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      image: null,
      imageUrl: ""
    }));
    setImagePreview("");
  };

  const addOption = () => {
    if (currentQuestion.options.length < 6) {
      setCurrentQuestion(prev => ({
        ...prev,
        options: [...prev.options, ""]
      }));
    }
  };

  const removeOption = (index) => {
    if (currentQuestion.options.length > 2) {
      const newOptions = currentQuestion.options.filter((_, i) => i !== index);
      let newCorrectAnswer = currentQuestion.correctAnswer;
      if (index === currentQuestion.correctAnswer) {
        newCorrectAnswer = 0;
      } else if (index < currentQuestion.correctAnswer) {
        newCorrectAnswer = currentQuestion.correctAnswer - 1;
      }
      setCurrentQuestion(prev => ({
        ...prev,
        options: newOptions,
        correctAnswer: newCorrectAnswer
      }));
    }
  };

  const resetCurrentQuestion = () => {
    setCurrentQuestion({
      text: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 1,
      explanation: "",
      image: null,
      imageUrl: ""
    });
    setImagePreview("");
    setValidationErrors({});
    setEditIndex(null);
  };

  const saveQuestion = () => {
    if (!validateQuestion()) {
      showSnackbar("Please fix the errors before saving", "error");
      return;
    }
    const questionToSave = {
      ...currentQuestion,
      imageUrl: currentQuestion.image ? currentQuestion.imageUrl : ""
    };
    if (editIndex !== null) {
      setQuiz(prev => {
        const updatedQuestions = [...prev.questions];
        updatedQuestions[editIndex] = questionToSave;
        return { ...prev, questions: updatedQuestions };
      });
      showSnackbar("Question updated successfully", "success");
    } else {
      setQuiz(prev => ({
        ...prev,
        questions: [...prev.questions, questionToSave],
      }));
      showSnackbar("Question added successfully", "success");
    }
    resetCurrentQuestion();
  };

  const editQuestion = (index) => {
    const question = quiz.questions[index];
    setCurrentQuestion(question);
    if (question.imageUrl) {
      setImagePreview(question.imageUrl);
    } else {
      setImagePreview("");
    }
    setEditIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeQuestion = (index) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
    showSnackbar("Question removed", "info");
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setIsUploading(true);
      setTimeout(() => {
        // Replace with actual PDF extraction logic if available
        const mockExtractedQuestions = [
          {
            text: "What is the capital of France?",
            options: ["London", "Berlin", "Paris", "Madrid"],
            correctAnswer: 2,
            points: 1,
            explanation: "Paris is the capital and most populous city of France.",
            imageUrl: ""
          },
          {
            text: "Which planet is known as the Red Planet?",
            options: ["Venus", "Mars", "Jupiter", "Saturn"],
            correctAnswer: 1,
            points: 1,
            explanation: "Mars appears reddish due to iron oxide on its surface.",
            imageUrl: ""
          }
        ];
        // Directly add extracted questions to the quiz
        setQuiz(prev => ({
          ...prev,
          questions: [...prev.questions, ...mockExtractedQuestions]
        }));
        setIsUploading(false);
        showSnackbar(`${mockExtractedQuestions.length} questions added from PDF`, "success");
      }, 2000);
    } else {
      showSnackbar("Please upload a valid PDF file", "error");
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 1, color: "#2d3748" }}>
          <AddCircleOutline color="primary" />
          Quiz Questions
        </Typography>
        <Chip label={`${quiz.questions.length} questions added`} color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
      </Box>
      <Divider sx={{ mb: 3 }} />

      {/* Tab selection for input method */}
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }} indicatorColor="primary">
        <Tab label="Add Questions Manually" />
        <Tab label="Upload Questions PDF" />
      </Tabs>

      {/* Manual Question Input */}
      {tabValue === 0 && (
        <>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8f0", background: "#f8fafc", mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              {editIndex !== null ? `Edit Question ${editIndex + 1}` : "Add New Question"}
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                Question Image (Optional)
              </Typography>
              {imagePreview ? (
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar variant="rounded" src={imagePreview} sx={{ width: 150, height: 150, border: '1px solid #e0e0e0' }} />
                  <IconButton onClick={removeImage} size="small" sx={{
                    position: 'absolute', top: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                  }}>
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Button component="label" variant="outlined" startIcon={<ImageIcon />}>
                  Upload Image
                  <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                </Button>
              )}
            </Box>

            <TextField fullWidth label="Question Text" name="text" value={currentQuestion.text} onChange={handleQuestionChange} variant="outlined" multiline rows={3} required sx={{ mb: 2 }} error={!!validationErrors.text} helperText={validationErrors.text} />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <FormLabel sx={{ mb: 1, fontWeight: 500, color: "#1e293b" }}>Options (Select the correct answer)</FormLabel>
              <RadioGroup value={currentQuestion.correctAnswer} onChange={e =>
                setCurrentQuestion(prev => ({
                  ...prev,
                  correctAnswer: parseInt(e.target.value),
                }))
              }>
                {currentQuestion.options.map((option, idx) => (
                  <Box key={idx} sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
                    <Radio value={idx} color="primary" />
                    <TextField fullWidth value={option} onChange={e => handleOptionChange(idx, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + idx)}`} variant="outlined" size="small" required error={!!validationErrors[`option${idx}`]} helperText={validationErrors[`option${idx}`]} />
                    {currentQuestion.options.length > 2 && (
                      <IconButton onClick={() => removeOption(idx)} color="error" size="small">
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </RadioGroup>
              {currentQuestion.options.length < 6 && (
                <Button onClick={addOption} startIcon={<AddCircleOutline />} size="small" sx={{ mt: 1, alignSelf: 'flex-start' }}>
                  Add Option
                </Button>
              )}
            </FormControl>

            <TextField label="Points" name="points" type="number" value={currentQuestion.points} onChange={handleQuestionChange} sx={{ width: 120, mb: 2 }} inputProps={{ min: 1 }} required error={!!validationErrors.points} helperText={validationErrors.points} />

            <TextField fullWidth label="Explanation (Optional)" name="explanation" value={currentQuestion.explanation} onChange={handleQuestionChange} variant="outlined" multiline rows={2} sx={{ mb: 3 }} />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" startIcon={editIndex !== null ? <CheckCircle /> : <AddCircleOutline />} onClick={saveQuestion} fullWidth size="large" sx={{
                py: 1.5,
                fontWeight: 600,
                background: "linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)",
                "&:hover": {
                  background: "linear-gradient(90deg, #4338ca 0%, #6d28d9 100%)"
                }
              }}>
                {editIndex !== null ? "Update Question" : "Add Question"}
              </Button>
              {editIndex !== null && (
                <Button variant="outlined" onClick={resetCurrentQuestion} fullWidth size="large" sx={{ py: 1.5 }}>
                  Cancel
                </Button>
              )}
            </Box>
          </Paper>

          {/* Existing Questions */}
          {quiz.questions.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                Your Questions
              </Typography>
              <Grid container spacing={2}>
                {quiz.questions.map((q, i) => (
                  <Grid item xs={12} sm={6} key={i}>
                    <Paper elevation={1} sx={{ p: 2, borderRadius: 2, borderLeft: "4px solid #4f46e5", position: "relative", "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.1)" } }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Box>
                          {q.imageUrl && (
                            <Box sx={{ mb: 2 }}>
                              <Avatar variant="rounded" src={q.imageUrl} sx={{ width: '100%', height: 150, border: '1px solid #e0e0e0' }} />
                            </Box>
                          )}
                          <Typography fontWeight={600} sx={{ mb: 1 }}>
                            Q{i + 1}: {q.text}
                          </Typography>
                          <Box sx={{ ml: 1 }}>
                            {q.options.map((opt, idx) => (
                              <Typography key={idx} variant="body2" sx={{ color: idx === q.correctAnswer ? "#4f46e5" : "#64748b", fontWeight: idx === q.correctAnswer ? 600 : "normal", display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                {String.fromCharCode(65 + idx)}. {opt}
                              </Typography>
                            ))}
                          </Box>
                          {q.explanation && (
                            <Typography variant="body2" sx={{ mt: 1, color: "#64748b", fontStyle: 'italic' }}>
                              <strong>Explanation:</strong> {q.explanation}
                            </Typography>
                          )}
                          <Chip label={`${q.points} point${q.points !== 1 ? "s" : ""}`} size="small" sx={{ mt: 1, background: "#e0e7ff", color: "#4f46e5" }} />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <IconButton onClick={() => editQuestion(i)} color="primary" size="small">
                            <UploadFile fontSize="small" />
                          </IconButton>
                          <IconButton onClick={() => removeQuestion(i)} color="error" size="small">
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </>
      )}

      {/* PDF Upload and Processing */}
      {tabValue === 1 && (
        <>
          {isUploading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
              <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>Processing PDF</Typography>
              <Typography variant="body2" color="text.secondary">Extracting questions from your document...</Typography>
            </Box>
          ) : (
            <Paper elevation={2} sx={{
              p: 4,
              borderRadius: 3,
              border: "2px dashed #e2e8f0",
              textAlign: "center",
              background: "#f8fafc",
              "&:hover": {
                borderColor: "#4f46e5",
                background: "#f0f5ff"
              }
            }}>
              <UploadFile color="primary" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>Upload Questions PDF</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Drag and drop your PDF file here, or click to browse
              </Typography>
              <Button variant="contained" component="label" startIcon={<UploadFile />} sx={{
                background: "linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)",
                "&:hover": {
                  background: "linear-gradient(90deg, #4338ca 0%, #6d28d9 100%)"
                }
              }}>
                Select PDF File
                <input type="file" hidden accept="application/pdf" onChange={handleFileUpload} />
              </Button>
              <Typography variant="caption" display="block" sx={{ mt: 2, color: "text.secondary" }}>
                Supported format: PDF (max 10MB)
              </Typography>
            </Paper>
          )}
        </>
      )}
    </>
  );
}
