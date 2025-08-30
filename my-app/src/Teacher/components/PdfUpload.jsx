import React from "react";
import {
  Card,
  Button,
  Typography,
  CircularProgress,
  Box
} from "@mui/material";
import { UploadFile, CheckCircle } from "@mui/icons-material";

export default function PdfUpload({ 
  file, 
  onUpload, 
  onRemove, 
  isUploading 
}) {
  const fileInputRef = React.useRef(null);

  return (
    <Card
      variant="outlined"
      sx={{
        p: 3,
        borderRadius: 3,
        border: "2px dashed #e2e8f0",
        textAlign: "center",
        backgroundColor: "#f8fafc",
        "&:hover": {
          borderColor: "#94a3b8",
          backgroundColor: "#f1f5f9"
        }
      }}
      onClick={() => fileInputRef.current.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={onUpload}
        accept="application/pdf"
        hidden
      />
      {isUploading ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <CircularProgress size={40} thickness={4} sx={{ mb: 2 }} />
          <Typography>Processing PDF...</Typography>
        </Box>
      ) : file ? (
        <Box>
          <CheckCircle color="success" sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h6" gutterBottom>
            PDF Uploaded
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {file.name}
          </Typography>
          <Button
            variant="outlined"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            Remove PDF
          </Button>
        </Box>
      ) : (
        <Box>
          <UploadFile color="primary" sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h6" gutterBottom>
            Upload Question PDF (Optional)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Drag & drop a PDF file here, or click to browse
          </Typography>
          <Button variant="contained">
            Select PDF File
          </Button>
        </Box>
      )}
    </Card>
  );
}