import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  Grid,
  TextField,
  Typography,
  Divider,
  InputAdornment,
  Box
} from "@mui/material";
import {
  Description,
  Schedule,
  School,
  Event,
  Lock,
  Visibility,
  VisibilityOff
} from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";

// Wrap the component with forwardRef to expose internal functions to parent
const QuizDetailsStep = forwardRef(({ quiz, setQuiz, showSnackbar }, ref) => {
  const fileInputRef = useRef(null); // This ref is still unused in the current logic, kept for context
  const [isUploading, setIsUploading] = useState(false); // This state is for PDF upload in *this* step, but PDF upload logic is removed from render
  const [showPassword, setShowPassword] = useState(false);

  // State to hold validation errors for each field in this step
  const [errors, setErrors] = useState({});

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Generic handler for all quiz detail fields
  const handleQuizChange = (e) => {
    const { name, value } = e.target;

    setQuiz((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error if value becomes valid
    if (errors[name]) {
      // Basic validation for common required fields
      if (value.trim() !== "") {
        setErrors((prev) => ({ ...prev, [name]: null }));
      }
    }
  };

  // Specific validation for the password field
  const validatePasswordField = (passwordValue) => {
    if (!passwordValue || passwordValue.trim() === "") {
      return "Quiz password is required.";
    }
    // Add more password rules here if needed, e.g., min length
    // if (passwordValue.length < 6) {
    //   return "Password must be at least 6 characters.";
    // }
    return null; // No error
  };

  // Full validation for all required fields in this step
  const validateAllFields = () => {
    const newErrors = {};

    // Validate Quiz Title
    if (!quiz.title || quiz.title.trim() === "") {
      newErrors.title = "Quiz title is required.";
    }

    // Validate Subject
    if (!quiz.subject || quiz.subject.trim() === "") {
      newErrors.subject = "Subject is required.";
    }

    // Validate Quiz Password
    const passwordError = validatePasswordField(quiz.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    // Validate Time Limit
    if (!quiz.timeLimit || quiz.timeLimit <= 0) {
      newErrors.timeLimit = "Time limit must be a positive number.";
    }

    // Validate Passing Score
    if (!quiz.passingScore || quiz.passingScore < 0 || quiz.passingScore > 100) {
      newErrors.passingScore = "Passing score must be between 0 and 100.";
    }

    // Validate Start Date & Time
    if (!quiz.startDate) { // Could add more complex date validation
      newErrors.startDate = "Start date and time are required.";
    }

    // Validate Deadline
    if (!quiz.deadline) { // Could add more complex date validation
      newErrors.deadline = "Deadline is required.";
    } else if (quiz.startDate && new Date(quiz.deadline) < new Date(quiz.startDate)) {
      newErrors.deadline = "Deadline cannot be before the start date.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // Expose validateAllFields to the parent component using useImperativeHandle
  useImperativeHandle(ref, () => ({
    validate: validateAllFields,
  }));

  // PDF Upload logic (kept as is, but removed from render for brevity as per your earlier request)
  // This part can be integrated back into the JSX if you want PDF upload in this step.
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setIsUploading(true);
      setTimeout(() => {
        setQuiz(prev => ({ ...prev, pdfFile: file }));
        setIsUploading(false);
        showSnackbar("PDF uploaded successfully! You can now add questions manually or import from PDF.", "success");
      }, 1500);
    } else {
      showSnackbar("Please upload a valid PDF file", "error");
    }
  };

  const handleRemovePdf = () => {
    setQuiz(prev => ({ ...prev, pdfFile: null }));
  };

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
        <Description color="primary" />
        Quiz Information
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Quiz Title"
            name="title"
            value={quiz.title}
            onChange={handleQuizChange}
            required
            variant="outlined"
            error={Boolean(errors.title)}
            helperText={errors.title}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Description color={errors.title ? "error" : "action"} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Subject"
            name="subject"
            value={quiz.subject}
            onChange={handleQuizChange}
            required
            variant="outlined"
            error={Boolean(errors.subject)}
            helperText={errors.subject}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <School color={errors.subject ? "error" : "action"} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Password Field - REQUIRED with visibility toggle */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Quiz Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={quiz.password || ""}
            onChange={handleQuizChange}
            onBlur={(e) => { // Validate on blur
              const error = validatePasswordField(e.target.value);
              setErrors((prev) => ({ ...prev, password: error }));
            }}
            variant="outlined"
            required
            error={Boolean(errors.password)}
            helperText={errors.password || "Set a password to restrict quiz access"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color={errors.password ? "error" : "action"} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={quiz.description}
            onChange={handleQuizChange}
            variant="outlined"
            multiline
            rows={3}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Time Limit (minutes)"
            name="timeLimit"
            type="number"
            value={quiz.timeLimit}
            onChange={handleQuizChange}
            required
            variant="outlined"
            error={Boolean(errors.timeLimit)}
            helperText={errors.timeLimit}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Schedule color={errors.timeLimit ? "error" : "action"} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Passing Score (%)"
            name="passingScore"
            type="number"
            value={quiz.passingScore}
            onChange={handleQuizChange}
            required
            variant="outlined"
            inputProps={{ min: 0, max: 100 }} // Changed min to 0
            error={Boolean(errors.passingScore)}
            helperText={errors.passingScore}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Start Date & Time"
            name="startDate"
            type="datetime-local"
            value={quiz.startDate}
            onChange={handleQuizChange}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            required
            error={Boolean(errors.startDate)}
            helperText={errors.startDate}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Event color={errors.startDate ? "error" : "action"} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Deadline"
            name="deadline"
            type="datetime-local"
            value={quiz.deadline}
            onChange={handleQuizChange}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            required
            error={Boolean(errors.deadline)}
            helperText={errors.deadline}
          />
        </Grid>
      </Grid>
    </>
  );
});

export default QuizDetailsStep;
