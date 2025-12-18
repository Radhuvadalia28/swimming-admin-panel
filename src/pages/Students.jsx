import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";
import { db } from "../firebase";
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import {
  HiPlus as AddIcon,
  HiPencil as EditIcon,
  HiTrash as DeleteIcon,
  HiEye as ViewIcon
} from 'react-icons/hi';

const Students = () => {
  // Mock data for demonstration - now managed by state
  const [students, setStudents] = useState([]);

  // State for delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    studentId: null,
    studentName: ''
  });

  // State for add/edit student dialog
  const [studentDialog, setStudentDialog] = useState({
    open: false,
    mode: 'add', // 'add' or 'edit'
    student: {
      id: null,
      name: '',
      age: '',
      coaching: 'Coach',
      status: 'Active',
      email: ''
    }
  });
  // Function to fetch students from Firestore
  const fetchStudents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "students"));
      const studentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || "",
        age: doc.data().age || "",
        email: doc.data().email || "",
        coaching: doc.data().coaching || "",
        status: doc.data().status || "Inactive",
      }));
      
      // const studentsData = querySnapshot.docs.map(doc => ({
      //   id: doc.id,
      //   ...doc.data(),
      // }));
      setStudents(studentsData);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);
  // Function to handle delete confirmation
  const handleDeleteClick = (studentId, studentName) => {
    setDeleteDialog({
      open: true,
      studentId,
      studentName
    });
  };

  // Function to confirm delete
  const handleDeleteConfirm = async () => {
    try {
      await deleteDoc(doc(db, "students", deleteDialog.studentId));
      await fetchStudents(); // Refresh the list from Firestore
      setDeleteDialog({
        open: false,
        studentId: null,
        studentName: ''
      });
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  // Function to cancel delete
  const handleDeleteCancel = () => {
    setDeleteDialog({
      open: false,
      studentId: null,
      studentName: ''
    });
  };

  // Function to handle add new student
  const handleAddStudent = () => {
    setStudentDialog({
      open: true,
      mode: 'add',
      student: {
        id: null,
        name: '',
        age: '',
        coaching: 'Coach',
        status: 'Active',
        email: ''
      }
    });
  };

  // Function to handle edit student
  const handleEditStudent = (student) => {
    setStudentDialog({
      open: true,
      mode: 'edit',
      student: { ...student }
    });
  };

  // Function to handle form input changes
  const handleInputChange = (field, value) => {
    setStudentDialog(prev => ({
      ...prev,
      student: {
        ...prev.student,
        [field]: value
      }
    }));
  };

  const handleSaveStudent = async () => {
    const { mode, student } = studentDialog;
  
    // Validation: Check if required fields are filled
    //if (!student.name.trim() || !student.age || !student.email.trim()) {
      if (
        !student.name ||
        !student.name.trim() ||
        !student.age ||
        !student.email ||
        !student.email.trim()
      ) {   
    alert("Please fill in all required fields (Name, Age, and Email)");
      return;
    }

    // Validation: Check if age is a valid number
    const ageNumber = parseInt(student.age);
    if (isNaN(ageNumber) || ageNumber < 1 || ageNumber > 100) {
      alert("Please enter a valid age between 1 and 100");
      return;
    }

    // Validation: Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(student.email.trim())) {
      alert("Please enter a valid email address");
      return;
    }
  
    try {
      if (mode === "add") {
        await addDoc(collection(db, "students"), {
          name: student.name.trim(),
          age: ageNumber,
          coaching: student.coaching,
          status: student.status,
          email: student.email.trim(),
          createdAt: new Date()
        });
      }
  
      if (mode === "edit") {
        await updateDoc(doc(db, "students", student.id), {
          name: student.name.trim(),
          age: ageNumber,
          coaching: student.coaching,
          status: student.status,
          email: student.email.trim(),
          updatedAt: new Date()
        });
      }
      
      // Reload data from Firestore
      await fetchStudents();
  
      // Close & reset dialog
      setStudentDialog({
        open: false,
        mode: "add",
        student: {
          id: null,
          name: "",
          age: "",
          coaching: "Coach",
          status: "Active",
          email: ""
        }
      });
  
    } catch (error) {
      console.error("Error saving student:", error);
      alert("Failed to save student. Please try again.");
    }
  };
  // Function to save student (add or edit)
//  // const handleSaveStudent = () => {
//     const { mode, student } = studentDialog;
    
//     if (mode === 'add') {
//       // Add new student with unique ID
//       const newStudent = {
//         ...student,
//         id: Math.max(...students.map(s => s.id)) + 1,
//         age: parseInt(student.age)
//       };
//       setStudents([...students, newStudent]);
//     } else {
//       // Edit existing student
//       const updatedStudents = students.map(s => 
//         s.id === student.id ? { ...student, age: parseInt(student.age) } : s
//       );
//       setStudents(updatedStudents);
//     }

//     // Close dialog and reset form
//     setStudentDialog({
//       open: false,
//       mode: 'add',
//       student: {
//         id: null,
//         name: '',
//         age: '',
//         coaching: 'Coach',
//         status: 'Active',
//         email: ''
//       }
//     });
//   };

  // Function to cancel student dialog
  const handleCancelStudentDialog = () => {
    setStudentDialog({
      open: false,
      mode: 'add',
      student: {
        id: null,
        name: '',
        age: '',
        coaching: 'Coach',
        status: 'Active',
        email: ''
      }
    });
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? 'success' : 'default';
  };

  const getCoachingColor = (coaching) => {
    switch(coaching) {
      case 'Coach': return 'primary';
      case 'Self': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Students
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          sx={{ borderRadius: 2 }}
          onClick={handleAddStudent}
        >
          Add New Student
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell>Student</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Coaching</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                       {student.name?.charAt(0) || '?'}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {student.name || ''}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{student.age}</TableCell>
                  <TableCell>
                    <Chip 
                      label={student.coaching} 
                      color={getCoachingColor(student.coaching)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={student.status} 
                      color={getStatusColor(student.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {student.email}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <IconButton size="small" color="primary">
                        <ViewIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="warning"
                        onClick={() => handleEditStudent(student)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteClick(student.id, student.name)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the student "{deleteDialog.studentName}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Student Dialog */}
      <Dialog
        open={studentDialog.open}
        onClose={handleCancelStudentDialog}
        maxWidth="sm"
        fullWidth
        aria-labelledby="student-dialog-title"
      >
        <DialogTitle id="student-dialog-title">
          {studentDialog.mode === 'add' ? 'Add New Student' : 'Edit Student'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Student Name"
                  value={studentDialog.student.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Age"
                  type="number"
                  value={studentDialog.student.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  required
                  inputProps={{ min: 1, max: 100 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={studentDialog.student.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Coaching</InputLabel>
                  <Select
                    value={studentDialog.student.coaching}
                    label="Coaching"
                    onChange={(e) => handleInputChange('coaching', e.target.value)}
                  >
                    <MenuItem value="Coach">Coach</MenuItem>
                    <MenuItem value="Self">Self</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={studentDialog.student.status}
                    label="Status"
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelStudentDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveStudent} 
            variant="contained"
            disabled={!studentDialog.student.name?.trim() || !studentDialog.student.age || !studentDialog.student.email?.trim()}
          >
            {studentDialog.mode === 'add' ? 'Add Student' : 'Update Student'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Students;
