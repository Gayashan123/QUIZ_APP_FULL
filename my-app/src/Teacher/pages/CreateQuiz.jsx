// src/Teacher/pages/CreateQuiz.jsx
import React, { useState, useEffect, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaEye,
  FaEyeSlash,
  FaSave,
  FaPlusCircle,
  FaTrashAlt,
  FaCheckCircle,
  FaEdit,
  FaImage,
} from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
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
  Avatar,
  Snackbar,
  Alert,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import { apiurl, token as tokenFromLS } from "../../Admin/common/Http";
import { AuthContext } from "../../context/Auth";
import PdfQuestionsUploader from "../components/PdfQuestionsUploader";

const steps = ["Quiz Details", "Add Questions", "Review & Publish"];

/* ------------------------- Date helpers ------------------------- */
function parseLocalDateTime(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}
function pad2(n) {
  return n.toString().padStart(2, "0");
}
function toLocalSqlDateTime(date) {
  const y = date.getFullYear(),
    m = pad2(date.getMonth() + 1),
    d = pad2(date.getDate());
  const h = pad2(date.getHours()),
    min = pad2(date.getMinutes()),
    s = pad2(date.getSeconds());
  return `${y}-${m}-${d} ${h}:${min}:${s}`;
}

/* ------------------------- Teacher id helpers ------------------------- */
function isLikelyJWT(t) {
  return typeof t === "string" && t.split(".").length === 3;
}
function base64UrlToString(b64url) {
  try {
    const base64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    return atob(padded);
  } catch {
    return null;
  }
}
function decodeJwtPayload(jwt) {
  if (!isLikelyJWT(jwt)) return null;
  const parts = jwt.split(".");
  const json = base64UrlToString(parts[1]);
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}
function parseIdCandidate(value) {
  if (value == null) return null;
  const n = Number(value);
  if (Number.isFinite(n) && n > 0) return Math.trunc(n);
  return null;
}
function extractTeacherIdFromObject(obj) {
  if (!obj || typeof obj !== "object") return null;
  const candidates = [
    obj.teacher_id,
    obj.teacherId,
    obj.user_id,
    obj.id,
    obj.user?.teacher_id,
    obj.user?.id,
    obj.teacher?.id,
    obj.data?.teacher_id,
    obj.data?.user?.teacher_id,
  ];
  for (const c of candidates) {
    const id = parseIdCandidate(c);
    if (id) return id;
  }
  return null;
}

/* ------------------------- API error helper ------------------------- */
async function throwApiError(res, fallbackMsg) {
  let msg = fallbackMsg;
  try {
    const data = await res.json();
    msg = data.message || data.error || fallbackMsg;
    if (data.errors && typeof data.errors === "object") {
      const flat = Object.entries(data.errors)
        .flatMap(([field, arr]) =>
          Array.isArray(arr)
            ? arr.map((m) => `${field}: ${m}`)
            : [`${field}: ${arr}`]
        )
        .join("; ");
      if (flat) msg = `${msg} — ${flat}`;
    }
  } catch {
    try {
      const text = await res.text();
      if (text) msg = `${fallbackMsg} — ${text}`;
    } catch {}
  }
  throw new Error(msg);
}

/* --------------------------------- Component --------------------------------- */
export default function CreateQuiz() {
  const navigate = useNavigate();
  const { user, login } = useContext(AuthContext);

  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [quiz, setQuiz] = useState({
    quiz_title: "",
    subject_id: "",
    quiz_password: "",
    time_limit: 30,
    passing_score: 70,
    start_time: "",
    end_time: "",
    questions: [],
  });

  const [subjects, setSubjects] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const authToken = user?.token || tokenFromLS() || "";
  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${authToken}`,
    }),
    [authToken]
  );

  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });
  const handleSnackbarClose = () =>
    setSnackbar({ open: false, message: "", severity: "success" });

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch(`${apiurl}subjects`, {
          method: "GET",
          headers,
        });
        if (!res.ok) await throwApiError(res, "Failed to fetch subjects");
        const data = await res.json();
        setSubjects(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        showSnackbar(`Error: ${err.message}`, "error");
      }
    };
    fetchSubjects();
  }, [headers]);

  // Validation
  const validateQuizDetails = () => {
    const errors = [];
    if (!quiz.quiz_title?.trim()) errors.push("Quiz title is required");
    if (!quiz.subject_id) errors.push("Subject is required");
    const tl = Number(quiz.time_limit);
    if (!Number.isInteger(tl) || tl <= 0)
      errors.push("Time limit must be a positive integer");
    const ps = Number(quiz.passing_score);
    if (!Number.isFinite(ps) || ps < 0 || ps > 100)
      errors.push("Passing score must be between 0 and 100");
    const startDate = parseLocalDateTime(quiz.start_time);
    const endDate = parseLocalDateTime(quiz.end_time);
    if (!startDate) errors.push("Start time is required");
    if (!endDate) errors.push("End time is required");
    if (startDate && endDate && !(startDate.getTime() < endDate.getTime()))
      errors.push("End time must be after start time");
    return errors.length ? errors[0] : null;
  };

  const validateAllQuestions = (qs) => {
    if (!qs || qs.length === 0) return "Please add at least one question";
    for (let i = 0; i < qs.length; i++) {
      const q = qs[i],
        idx = i + 1;
      if (!q.text?.trim()) return `Question ${idx}: text is required`;
      if (!Array.isArray(q.options) || q.options.length < 2)
        return `Question ${idx}: at least 2 options are required`;
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j]?.trim())
          return `Question ${idx}: Option ${String.fromCharCode(
            65 + j
          )} is required`;
      }
      if (
        q.correctAnswer == null ||
        q.correctAnswer < 0 ||
        q.correctAnswer >= q.options.length
      )
        return `Question ${idx}: please select a valid correct answer`;
      const pts = Number(q.points);
      if (!Number.isFinite(pts) || pts < 1)
        return `Question ${idx}: points must be at least 1`;
    }
    return null;
  };

  const handleNext = () => {
    if (activeStep === 0) {
      const err = validateQuizDetails();
      if (err) return showSnackbar(err, "error");
    }
    if (activeStep === 1) {
      const err = validateAllQuestions(quiz.questions);
      if (err) return showSnackbar(err, "error");
    }
    setActiveStep((prev) => prev + 1);
  };
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const resolveTeacherId = async () => {
    if (user?.teacher_id) return user.teacher_id;

    try {
      const raw = localStorage.getItem("userInfo");
      if (raw) {
        const obj = JSON.parse(raw);
        const idFromLS =
          obj?.teacher_id ||
          obj?.user?.teacher_id ||
          obj?.user?.id ||
          obj?.id ||
          null;
        if (parseIdCandidate(idFromLS)) return Number(idFromLS);
      }
    } catch {}

    const payload = decodeJwtPayload(authToken);
    if (payload) {
      const id =
        parseIdCandidate(payload.teacher_id) ||
        parseIdCandidate(payload.teacherId) ||
        parseIdCandidate(payload.user_id) ||
        parseIdCandidate(payload.id) ||
        parseIdCandidate(payload.sub) ||
        parseIdCandidate(payload?.user?.teacher_id) ||
        parseIdCandidate(payload?.user?.id);
      if (id) {
        try {
          const raw = localStorage.getItem("userInfo");
          if (raw) {
            const obj = JSON.parse(raw);
            const nextObj = { ...obj, teacher_id: id };
            localStorage.setItem("userInfo", JSON.stringify(nextObj));
          }
        } catch {}
        if (user) login({ ...user, teacher_id: id });
        return id;
      }
    }

    try {
      const res = await fetch(`${apiurl}checkauth`, { headers });
      if (res.ok) {
        const data = await res.json();
        const id =
          extractTeacherIdFromObject(data) ||
          extractTeacherIdFromObject(data?.data);
        if (id) {
          try {
            const raw = localStorage.getItem("userInfo");
            if (raw) {
              const obj = JSON.parse(raw);
              const nextObj = { ...obj, teacher_id: id };
              localStorage.setItem("userInfo", JSON.stringify(nextObj));
            }
          } catch {}
          if (user) login({ ...user, teacher_id: id });
          return id;
        }
      }
    } catch (e) {
      console.error("checkauth fallback failed:", e);
    }
    return null;
  };

  const pickId = (obj) =>
    obj?.id ||
    obj?.data?.id ||
    obj?.quiz?.id ||
    obj?.question?.id ||
    obj?.option?.id ||
    obj?.result?.id ||
    null;

  const createQuizCascade = async (quizPayload, questions) => {
    const resQuiz = await fetch(`${apiurl}quizzes`, {
      method: "POST",
      headers,
      body: JSON.stringify(quizPayload),
    });
    if (!resQuiz.ok) await throwApiError(resQuiz, "Failed to create quiz");
    const quizJson = await resQuiz.json();
    const quizId = pickId(quizJson);
    if (!quizId) throw new Error("Quiz created but ID not returned by API");

    for (const q of questions) {
      const qPayload = {
        quiz_id: Number(quizId),
        question_text: q.text.trim(),
        points: Number(q.points),
        explanation: q.explanation?.trim() || null,
        image_url: q.imageUrl || null,
      };
      const resQuestion = await fetch(`${apiurl}questions`, {
        method: "POST",
        headers,
        body: JSON.stringify(qPayload),
      });
      if (!resQuestion.ok)
        await throwApiError(
          resQuestion,
          `Failed to create question: "${q.text.slice(0, 40)}..."`
        );
      const qJson = await resQuestion.json();
      const questionId = pickId(qJson);
      if (!questionId)
        throw new Error("Question created but ID not returned by API");

      for (let idx = 0; idx < q.options.length; idx++) {
        const optPayload = {
          question_id: Number(questionId),
          option_text: q.options[idx].trim(),
          is_correct: idx === q.correctAnswer ? 1 : 0,
        };
        const resOpt = await fetch(`${apiurl}options`, {
          method: "POST",
          headers,
          body: JSON.stringify(optPayload),
        });
        if (!resOpt.ok)
          await throwApiError(
            resOpt,
            `Failed to create option "${optPayload.option_text}"`
          );
      }
    }
    return quizId;
  };

  const submitQuiz = async () => {
    const detailsErr = validateQuizDetails();
    if (detailsErr) return showSnackbar(detailsErr, "error");
    const qErr = validateAllQuestions(quiz.questions);
    if (qErr) return showSnackbar(qErr, "error");

    const teacher_id = await resolveTeacherId();
    if (!teacher_id)
      return showSnackbar(
        "Could not determine your teacher ID. Please re-login or contact support.",
        "error"
      );

    const startDate = parseLocalDateTime(quiz.start_time);
    const endDate = parseLocalDateTime(quiz.end_time);
    if (!startDate || !endDate)
      return showSnackbar("Invalid date/time values", "error");

    const startSql = toLocalSqlDateTime(startDate);
    const endSql = toLocalSqlDateTime(endDate);
    const quizPayload = {
      teacher_id: Number(teacher_id),
      title: quiz.quiz_title.trim(),
      quiz_title: quiz.quiz_title.trim(),
      password: quiz.quiz_password?.trim() || null,
      quiz_password: quiz.quiz_password?.trim() || null,
      subject_id: Number(quiz.subject_id),
      time_limit: Number(quiz.time_limit),
      passing_score: Number(quiz.passing_score),
      start_at: startSql,
      end_at: endSql,
      start_time: startSql,
      end_time: endSql,
    };

    try {
      setIsSubmitting(true);
      await createQuizCascade(quizPayload, quiz.questions);
      showSnackbar("Quiz and questions published successfully!", "success");
      setTimeout(() => navigate("/home"), 800);
    } catch (error) {
      console.error(error);
      showSnackbar(
        error.message || "Failed to create quiz/questions. Please try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Steps
  const QuizDetailsStep = ({ quiz, setQuiz, subjects }) => {
    const handleChange = (e) => {
      const { name, value } = e.target;
      setQuiz((prev) => {
        if (name === "time_limit" || name === "passing_score") {
          const num = value === "" ? "" : parseInt(value, 10);
          return { ...prev, [name]: isNaN(num) ? "" : num };
        }
        return { ...prev, [name]: value };
      });
    };

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Typography
          variant="h5"
          fontWeight={600}
          color="text.primary"
          sx={{ mb: 1 }}
        >
          Quiz Information
        </Typography>

        <TextField
          fullWidth
          label="Quiz Title"
          name="quiz_title"
          value={quiz.quiz_title}
          onChange={handleChange}
          required
          variant="outlined"
          sx={{ mb: 2 }}
        />

        <TextField
          select
          fullWidth
          label="Subject"
          name="subject_id"
          value={quiz.subject_id}
          onChange={handleChange}
          required
          variant="outlined"
          sx={{ mb: 2 }}
        >
          <MenuItem value="">Select a subject</MenuItem>
          {subjects.map((subject) => (
            <MenuItem key={subject.id} value={subject.id}>
              {subject.name ?? subject.title ?? `Subject #${subject.id}`}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          label="Quiz Password (Optional)"
          name="quiz_password"
          value={quiz.quiz_password}
          onChange={handleChange}
          type={showPassword ? "text" : "password"}
          variant="outlined"
          sx={{ mb: 2 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Time Limit (minutes)"
              name="time_limit"
              type="number"
              value={quiz.time_limit}
              onChange={handleChange}
              required
              variant="outlined"
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Passing Score (%)"
              name="passing_score"
              type="number"
              value={quiz.passing_score}
              onChange={handleChange}
              required
              variant="outlined"
              inputProps={{ min: 0, max: 100 }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Start Time"
              name="start_time"
              type="datetime-local"
              value={quiz.start_time}
              onChange={handleChange}
              required
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="End Time"
              name="end_time"
              type="datetime-local"
              value={quiz.end_time}
              onChange={handleChange}
              required
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Box>
    );
  };

  const AddQuestionsStep = ({ quiz, setQuiz, showSnackbar }) => {
    const [currentQuestion, setCurrentQuestion] = useState({
      text: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 1,
      explanation: "",
      image: null,
      imageUrl: "",
    });
    const [tabValue, setTabValue] = useState(0);
    const [validationErrors, setValidationErrors] = useState({});
    const [editIndex, setEditIndex] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    useEffect(() => {
      if (tabValue === 1 && editIndex !== null) resetCurrentQuestion();
    }, [tabValue]);

    const handleTabChange = (event, newValue) => setTabValue(newValue);

    const validateQuestion = () => {
      const errors = {};
      if (!currentQuestion.text.trim())
        errors.text = "Question text is required";
      if (
        !Array.isArray(currentQuestion.options) ||
        currentQuestion.options.length < 2
      ) {
        errors.options = "At least 2 options are required";
      } else {
        currentQuestion.options.forEach((opt, idx) => {
          if (!opt.trim())
            errors[`option${idx}`] = `Option ${String.fromCharCode(
              65 + idx
            )} is required`;
        });
      }
      if (
        currentQuestion.correctAnswer == null ||
        currentQuestion.correctAnswer < 0 ||
        currentQuestion.correctAnswer >= currentQuestion.options.length
      ) {
        errors.correctAnswer = "Please select a valid correct answer";
      }
      const pts = Number(currentQuestion.points);
      if (!Number.isFinite(pts) || pts < 1)
        errors.points = "Points must be at least 1";
      setValidationErrors(errors);
      return Object.keys(errors).length === 0;
    };

    const handleQuestionChange = (e) => {
      const { name, value } = e.target;
      setCurrentQuestion((prev) => {
        if (name === "points") {
          const num = value === "" ? "" : parseInt(value, 10);
          return { ...prev, points: isNaN(num) ? "" : Math.max(1, num) };
        }
        return { ...prev, [name]: value };
      });
      if (validationErrors[name])
        setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const handleOptionChange = (i, value) => {
      const newOptions = [...currentQuestion.options];
      newOptions[i] = value;
      setCurrentQuestion((prev) => ({ ...prev, options: newOptions }));
      if (validationErrors[`option${i}`])
        setValidationErrors((prev) => ({ ...prev, [`option${i}`]: undefined }));
    };

    const handleCorrectAnswerChange = (e) => {
      const idx = parseInt(e.target.value, 10);
      setCurrentQuestion((prev) => ({ ...prev, correctAnswer: idx }));
      if (validationErrors.correctAnswer)
        setValidationErrors((prev) => ({ ...prev, correctAnswer: undefined }));
    };

    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (!file.type.match("image.*"))
          return showSnackbar(
            "Please upload an image file (JPEG, PNG)",
            "error"
          );
        if (file.size > 2 * 1024 * 1024)
          return showSnackbar("Image size should be less than 2MB", "error");
        const reader = new FileReader();
        reader.onloadend = () => {
          setCurrentQuestion((prev) => ({
            ...prev,
            image: file,
            imageUrl: reader.result,
          }));
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    };

    const removeImage = () => {
      setCurrentQuestion((prev) => ({ ...prev, image: null, imageUrl: "" }));
      setImagePreview("");
    };

    const addOption = () => {
      if (currentQuestion.options.length < 6)
        setCurrentQuestion((prev) => ({
          ...prev,
          options: [...prev.options, ""],
        }));
    };

    const removeOption = (index) => {
      if (currentQuestion.options.length > 2) {
        const newOptions = currentQuestion.options.filter(
          (_, i) => i !== index
        );
        let newCorrect = currentQuestion.correctAnswer;
        if (index === currentQuestion.correctAnswer) newCorrect = 0;
        else if (index < currentQuestion.correctAnswer)
          newCorrect = currentQuestion.correctAnswer - 1;
        setCurrentQuestion((prev) => ({
          ...prev,
          options: newOptions,
          correctAnswer: newCorrect,
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
        imageUrl: "",
      });
      setImagePreview("");
      setValidationErrors({});
      setEditIndex(null);
    };

    const saveQuestion = () => {
      if (!validateQuestion())
        return showSnackbar("Please fix the errors before saving", "error");
      const toSave = {
        text: currentQuestion.text.trim(),
        options: currentQuestion.options.map((o) => o.trim()),
        correctAnswer: currentQuestion.correctAnswer,
        points: Number(currentQuestion.points),
        explanation: currentQuestion.explanation?.trim() || "",
        imageUrl: currentQuestion.image ? currentQuestion.imageUrl : "",
      };
      setQuiz((prev) => {
        const next = [...prev.questions];
        if (editIndex !== null) next[editIndex] = toSave;
        else next.push(toSave);
        return { ...prev, questions: next };
      });
      showSnackbar(
        editIndex !== null
          ? "Question updated successfully"
          : "Question added successfully",
        "success"
      );
      resetCurrentQuestion();
    };

    const editQuestion = (index) => {
      const q = quiz.questions[index];
      const clone = JSON.parse(JSON.stringify(q));
      setCurrentQuestion({ ...clone, image: null });
      setImagePreview(clone.imageUrl || "");
      setEditIndex(index);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const removeQuestion = (index) => {
      setQuiz((prev) => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index),
      }));
      showSnackbar("Question removed", "info");
      if (editIndex === index) resetCurrentQuestion();
    };

    return (
      <>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="h5"
            fontWeight={600}
            color="text.primary"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <FaPlusCircle color="#6366f1" />
            Quiz Questions
          </Typography>
          <Chip
            label={`${quiz.questions.length} questions added`}
            color="primary"
            variant="outlined"
          />
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ mb: 3 }}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Add Questions Manually" />
          <Tab label="Upload Questions PDF" />
        </Tabs>

        {tabValue === 0 && (
          <>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                mb: 4,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                {editIndex !== null
                  ? `Edit Question ${editIndex + 1}`
                  : "Add New Question"}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                  Question Image (Optional)
                </Typography>
                {imagePreview ? (
                  <Box sx={{ position: "relative", display: "inline-block" }}>
                    <Avatar
                      variant="rounded"
                      src={imagePreview}
                      sx={{
                        width: 150,
                        height: 150,
                        border: "1px solid #e0e0e0",
                      }}
                    />
                    <IconButton
                      onClick={removeImage}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        color: "white",
                        "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
                      }}
                    >
                      <IoMdClose fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<FaImage />}
                  >
                    Upload Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </Button>
                )}
              </Box>

              <TextField
                fullWidth
                label="Question Text"
                name="text"
                value={currentQuestion.text}
                onChange={handleQuestionChange}
                variant="outlined"
                multiline
                rows={3}
                required
                sx={{ mb: 2 }}
                error={!!validationErrors.text}
                helperText={validationErrors.text}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <FormLabel sx={{ mb: 1, fontWeight: 500 }}>
                  Options (Select the correct answer)
                </FormLabel>
                <RadioGroup
                  name="correctAnswer"
                  value={currentQuestion.correctAnswer}
                  onChange={handleCorrectAnswerChange}
                >
                  {currentQuestion.options.map((option, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 1,
                        gap: 1,
                      }}
                    >
                      <Radio value={idx} color="primary" />
                      <TextField
                        fullWidth
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(idx, e.target.value)
                        }
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        variant="outlined"
                        size="small"
                        required
                        error={!!validationErrors[`option${idx}`]}
                        helperText={validationErrors[`option${idx}`]}
                      />
                      {currentQuestion.options.length > 2 && (
                        <IconButton
                          onClick={() => removeOption(idx)}
                          color="error"
                          size="small"
                        >
                          <FaTrashAlt fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                </RadioGroup>
                {validationErrors.correctAnswer && (
                  <Typography variant="caption" color="error">
                    {validationErrors.correctAnswer}
                  </Typography>
                )}
                {currentQuestion.options.length < 6 && (
                  <Button
                    onClick={addOption}
                    startIcon={<FaPlusCircle />}
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Add Option
                  </Button>
                )}
              </FormControl>

              <TextField
                label="Points"
                name="points"
                type="number"
                value={currentQuestion.points}
                onChange={handleQuestionChange}
                sx={{ width: 120, mb: 2 }}
                inputProps={{ min: 1 }}
                required
                error={!!validationErrors.points}
                helperText={validationErrors.points}
              />

              <TextField
                fullWidth
                label="Explanation (Optional)"
                name="explanation"
                value={currentQuestion.explanation}
                onChange={handleQuestionChange}
                variant="outlined"
                multiline
                rows={2}
                sx={{ mb: 3 }}
              />

              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={
                    editIndex !== null ? <FaCheckCircle /> : <FaPlusCircle />
                  }
                  onClick={saveQuestion}
                  fullWidth
                  size="large"
                  sx={{
                    py: 1.5,
                    fontWeight: 600,
                    background:
                      "linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)",
                    "&:hover": {
                      background:
                        "linear-gradient(90deg, #4338ca 0%, #6d28d9 100%)",
                    },
                  }}
                >
                  {editIndex !== null ? "Update Question" : "Add Question"}
                </Button>
                {editIndex !== null && (
                  <Button
                    variant="outlined"
                    onClick={resetCurrentQuestion}
                    fullWidth
                    size="large"
                    sx={{ py: 1.5 }}
                  >
                    Cancel
                  </Button>
                )}
              </Box>
            </Paper>

            {quiz.questions.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                  Your Questions
                </Typography>
                <Grid container spacing={2}>
                  {quiz.questions.map((q, i) => (
                    <Grid item xs={12} sm={6} key={i}>
                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          borderLeft: "4px solid #4f46e5",
                          position: "relative",
                          "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Box>
                            {q.imageUrl && (
                              <Box sx={{ mb: 2 }}>
                                <Avatar
                                  variant="rounded"
                                  src={q.imageUrl}
                                  sx={{
                                    width: "100%",
                                    height: 150,
                                    border: "1px solid #e0e0e0",
                                  }}
                                />
                              </Box>
                            )}
                            <Typography fontWeight={600} sx={{ mb: 1 }}>
                              Q{i + 1}: {q.text}
                            </Typography>
                            <Box sx={{ ml: 1 }}>
                              {q.options.map((opt, idx) => (
                                <Typography
                                  key={idx}
                                  variant="body2"
                                  sx={{
                                    color:
                                      idx === q.correctAnswer
                                        ? "#4f46e5"
                                        : "#64748b",
                                    fontWeight:
                                      idx === q.correctAnswer ? 600 : "normal",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mb: 0.5,
                                  }}
                                >
                                  {String.fromCharCode(65 + idx)}. {opt}
                                </Typography>
                              ))}
                            </Box>
                            {q.explanation && (
                              <Typography
                                variant="body2"
                                sx={{
                                  mt: 1,
                                  color: "#64748b",
                                  fontStyle: "italic",
                                }}
                              >
                                <strong>Explanation:</strong> {q.explanation}
                              </Typography>
                            )}
                            <Chip
                              label={`${q.points} point${
                                q.points !== 1 ? "s" : ""
                              }`}
                              size="small"
                              sx={{
                                mt: 1,
                                background: "#e0e7ff",
                                color: "#4f46e5",
                              }}
                            />
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 1,
                            }}
                          >
                            <IconButton
                              onClick={() => editQuestion(i)}
                              color="primary"
                              size="small"
                            >
                              <FaEdit fontSize="small" />
                            </IconButton>
                            <IconButton
                              onClick={() => removeQuestion(i)}
                              color="error"
                              size="small"
                            >
                              <FaTrashAlt fontSize="small" />
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

        {tabValue === 1 && (
          <PdfQuestionsUploader
            onExtract={(qs) => {
              if (!qs?.length)
                return showSnackbar(
                  "No questions detected in the PDF",
                  "warning"
                );
              setQuiz((prev) => ({
                ...prev,
                questions: [...prev.questions, ...qs],
              }));
              showSnackbar(
                `Your PDF was parsed — ${qs.length} question(s) added`,
                "success"
              );
            }}
            maxSizeMB={10}
          />
        )}
      </>
    );
  };

  const ReviewStep = ({ quiz, subjects }) => {
    const subjectName =
      subjects.find((s) => `${s.id}` === `${quiz.subject_id}`)?.name ||
      quiz.subject_id;
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Typography variant="h5" fontWeight={600} color="text.primary">
          Review Quiz Details
        </Typography>

        <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{ mb: 3, color: "#4f46e5" }}
          >
            Quiz Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                Title:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {quiz.quiz_title}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                Subject:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {subjectName}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                Time Limit:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {quiz.time_limit} minutes
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                Passing Score:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {quiz.passing_score}%
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                Start Time:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {quiz.start_time}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                End Time:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {quiz.end_time}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{ mb: 3, color: "#4f46e5" }}
          >
            Questions ({quiz.questions.length})
          </Typography>
          {quiz.questions.map((q, i) => (
            <Box
              key={i}
              sx={{
                mb: 4,
                p: 3,
                borderRadius: 2,
                borderLeft: "4px solid #6366f1",
                background: "#f8fafc",
              }}
            >
              <Typography variant="body1" fontWeight={600} sx={{ mb: 2 }}>
                Q{i + 1}: {q.text}
              </Typography>
              <Box sx={{ ml: 2 }}>
                {q.options.map((opt, idx) => (
                  <Typography
                    key={idx}
                    variant="body2"
                    sx={{
                      color:
                        idx === q.correctAnswer ? "#4f46e5" : "text.secondary",
                      fontWeight: idx === q.correctAnswer ? 600 : 400,
                      mb: 1,
                    }}
                  >
                    {String.fromCharCode(65 + idx)}. {opt}
                  </Typography>
                ))}
              </Box>
              <Chip
                label={`${q.points} point${q.points !== 1 ? "s" : ""}`}
                size="small"
                sx={{
                  mt: 2,
                  background:
                    "linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)",
                  color: "#fff",
                }}
              />
              {q.explanation && (
                <Typography
                  variant="body2"
                  sx={{ mt: 2, color: "#64748b", fontStyle: "italic" }}
                >
                  <strong>Explanation:</strong> {q.explanation}
                </Typography>
              )}
              {q.imageUrl && (
                <Box sx={{ mt: 2 }}>
                  <Avatar
                    variant="rounded"
                    src={q.imageUrl}
                    sx={{
                      width: 120,
                      height: 120,
                      border: "1px solid #e0e0e0",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  />
                </Box>
              )}
            </Box>
          ))}
        </Paper>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
        display: "flex",
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={5000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        <Box
          sx={{ maxWidth: "1000px", mx: "auto", px: { xs: 2, sm: 3 }, py: 6 }}
        >
          <Box
            sx={{
              background: "#fff",
              borderRadius: 4,
              boxShadow:
                "0 10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
              p: { xs: 3, md: 6 },
              mt: 4,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "end", mb: 4 }}>
              <Button
                onClick={() => navigate("/home")}
                variant="outlined"
                sx={{
                  fontWeight: 600,
                  borderRadius: 2,
                  borderWidth: 2,
                  "&:hover": { borderWidth: 2 },
                }}
              >
                <FaHome />
                &nbsp; Home
              </Button>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 8,
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: -16,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background:
                    "linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%)",
                },
              }}
            >
              {steps.map((label, index) => (
                <Box
                  key={label}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 1,
                      background:
                        index <= activeStep
                          ? "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)"
                          : "#cbd5e1",
                      color: index <= activeStep ? "white" : "text.secondary",
                      fontWeight: 600,
                      boxShadow:
                        index <= activeStep
                          ? "0 4px 6px rgba(79, 70, 229, 0.3)"
                          : "none",
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      textAlign: "center",
                      color:
                        index === activeStep
                          ? "primary.main"
                          : "text.secondary",
                    }}
                  >
                    {label}
                  </Typography>
                </Box>
              ))}
            </Box>

            {activeStep === 0 && (
              <QuizDetailsStep
                quiz={quiz}
                setQuiz={setQuiz}
                subjects={subjects}
              />
            )}
            {activeStep === 1 && (
              <AddQuestionsStep
                quiz={quiz}
                setQuiz={setQuiz}
                showSnackbar={showSnackbar}
              />
            )}
            {activeStep === 2 && <ReviewStep quiz={quiz} subjects={subjects} />}

            <Box
              sx={{
                mt: 8,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                gap: 2,
                pt: 3,
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <Button
                onClick={handleBack}
                disabled={activeStep === 0 || isSubmitting}
                variant="outlined"
                sx={{
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  borderWidth: 2,
                  "&:hover": { borderWidth: 2 },
                }}
              >
                Back
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  onClick={submitQuiz}
                  disabled={isSubmitting}
                  variant="contained"
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <FaSave />
                    )
                  }
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    borderRadius: 2,
                    background:
                      "linear-gradient(90deg, #10b981 0%, #22d3ee 100%)",
                    "&:hover": {
                      background:
                        "linear-gradient(90deg, #059669 0%, #0ea5e9 100%)",
                      boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                    },
                  }}
                >
                  {isSubmitting ? "Publishing..." : "Publish Quiz"}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  variant="contained"
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    borderRadius: 2,
                    background:
                      "linear-gradient(90deg, #6366f1 0%, #a78bfa 100%)",
                    "&:hover": {
                      background:
                        "linear-gradient(90deg, #4338ca 0%, #6d28d9 100%)",
                      boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
                    },
                  }}
                >
                  Continue
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
