import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  query,
  orderBy,
  limit,
  startAfter,
  getCountFromServer
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
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  useTheme,
  Divider
} from '@mui/material';
import {
  HiPlus as AddIcon,
  HiPencil as EditIcon,
  HiTrash as DeleteIcon,
  HiEye as ViewIcon
} from 'react-icons/hi';

const PAGE_SIZE = 10;

const Students = () => {
  // Mock data for demonstration - now managed by state
  const [students, setStudents] = useState([]);

  // State for expiry filter (all, 1day, 3days, 7days)
  const [expiryFilter, setExpiryFilter] = useState('all');

  // Pagination state
  const [lastDoc, setLastDoc] = useState(null); // Last document for next page
  const [firstDocStack, setFirstDocStack] = useState([]); // Stack of first docs for going back
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

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
      email: '',
      membershipType: 'Monthly'
    }
  });

  // State for view student details dialog (mobile)
  const [viewDialog, setViewDialog] = useState({
    open: false,
    student: null
  });

  // Theme and media query for responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Function to calculate membership end date based on membership type
  const calculateMembershipEndDate = (startDate, membershipType) => {
    const endDate = new Date(startDate);
    switch (membershipType) {
      case 'Monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'Quarterly':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case 'Half-Yearly':
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      case 'Annual':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      default:
        endDate.setMonth(endDate.getMonth() + 1);
    }
    return endDate;
  };
  // Function to get total count of students
  const fetchTotalCount = async () => {
    try {
      const coll = collection(db, "students");
      const snapshot = await getCountFromServer(coll);
      setTotalStudents(snapshot.data().count);
    } catch (error) {
      console.error("Error fetching total count:", error);
    }
  };

  // One-time migration: Add createdAt to students that don't have it
  const migrateStudentsCreatedAt = async () => {
    try {
      const studentsRef = collection(db, "students");
      const querySnapshot = await getDocs(studentsRef);
      
      const updatePromises = [];
      querySnapshot.docs.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        // If createdAt is missing, add it
        if (!data.createdAt) {
          console.log(`Migrating student ${docSnapshot.id}: adding createdAt`);
          updatePromises.push(
            updateDoc(doc(db, "students", docSnapshot.id), {
              createdAt: Timestamp.now()
            })
          );
        }
      });

      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
        console.log(`Migration complete: Updated ${updatePromises.length} student(s) with createdAt`);
      }
    } catch (error) {
      console.error("Error during migration:", error);
    }
  };

  // Function to fetch students from Firestore with pagination
  const fetchStudents = async (startAfterDoc = null) => {
    setIsLoading(true);
    try {
      let q;
      const studentsRef = collection(db, "students");
      
      // Fetch PAGE_SIZE + 1 to check if there's a next page
      if (startAfterDoc) {
        // Fetch next page
        q = query(
          studentsRef,
          orderBy("createdAt", "desc"),
          startAfter(startAfterDoc),
          limit(PAGE_SIZE + 1)
        );
      } else {
        // Fetch first page
        q = query(
          studentsRef,
          orderBy("createdAt", "desc"),
          limit(PAGE_SIZE + 1)
        );
      }

      const querySnapshot = await getDocs(q);
      const allDocs = querySnapshot.docs;
      
      // Check if there's a next page (we fetched PAGE_SIZE + 1)
      const hasMore = allDocs.length > PAGE_SIZE;
      setHasNextPage(hasMore);
      
      // Only use PAGE_SIZE documents for display
      const docsToShow = hasMore ? allDocs.slice(0, PAGE_SIZE) : allDocs;
      
      const studentsData = docsToShow.map(doc => ({
        id: doc.id,
        name: doc.data().name || "",
        age: doc.data().age || "",
        email: doc.data().email || "",
        coaching: doc.data().coaching || "",
        status: doc.data().status || "Inactive",
        membershipType: doc.data().membershipType || "Monthly",
        membershipStartDate: doc.data().membershipStartDate || null,
        membershipEndDate: doc.data().membershipEndDate || null,
        createdAt: doc.data().createdAt || null,
      }));
      
      setStudents(studentsData);

      // Update last doc cursor for next page
      if (docsToShow.length > 0) {
        setLastDoc(docsToShow[docsToShow.length - 1]);
      } else {
        setLastDoc(null);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to go to next page
  const handleNextPage = async () => {
    if (!lastDoc || !hasNextPage) return;
    
    // Save current lastDoc to stack for going back
    setFirstDocStack(prev => [...prev, lastDoc]);
    setCurrentPage(prev => prev + 1);
    await fetchStudents(lastDoc);
  };

  // Function to go to previous page
  const handlePreviousPage = async () => {
    if (currentPage <= 1) return;
    
    const newStack = [...firstDocStack];
    newStack.pop(); // Remove the current page's starting cursor
    setFirstDocStack(newStack);
    setCurrentPage(prev => prev - 1);
    
    if (newStack.length === 0) {
      // Go back to first page
      await fetchStudents(null);
    } else {
      // Go back to previous page using the last cursor in stack
      const prevCursor = newStack[newStack.length - 1];
      await fetchStudents(prevCursor);
    }
  };

  // Reset to first page
  const resetToFirstPage = async () => {
    setFirstDocStack([]);
    setCurrentPage(1);
    await fetchStudents(null);
  };

  useEffect(() => {
    const initializeData = async () => {
      // Run migration first to ensure all students have createdAt
      await migrateStudentsCreatedAt();
      // Then fetch students and total count
      await fetchStudents();
      await fetchTotalCount();
    };
    initializeData();
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
      await resetToFirstPage(); // Refresh and go to first page
      await fetchTotalCount(); // Update total count
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
        email: '',
        membershipType: 'Monthly'
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

  // Function to handle view student details (mobile)
  const handleViewStudent = (student) => {
    setViewDialog({
      open: true,
      student: { ...student }
    });
  };

  // Function to close view dialog
  const handleCloseViewDialog = () => {
    setViewDialog({
      open: false,
      student: null
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
        // Calculate membership dates
        const membershipStartDate = new Date();
        const membershipEndDate = calculateMembershipEndDate(membershipStartDate, student.membershipType);

        await addDoc(collection(db, "students"), {
          name: student.name.trim(),
          age: ageNumber,
          coaching: student.coaching,
          status: student.status,
          email: student.email.trim(),
          membershipType: student.membershipType,
          membershipStartDate: Timestamp.fromDate(membershipStartDate),
          membershipEndDate: Timestamp.fromDate(membershipEndDate),
          createdAt: Timestamp.now()
        });
      }
  
      if (mode === "edit") {
        // Recalculate membership dates on edit
        const membershipStartDate = new Date();
        const membershipEndDate = calculateMembershipEndDate(membershipStartDate, student.membershipType);

        await updateDoc(doc(db, "students", student.id), {
          name: student.name.trim(),
          age: ageNumber,
          coaching: student.coaching,
          status: student.status,
          email: student.email.trim(),
          membershipType: student.membershipType,
          membershipStartDate: Timestamp.fromDate(membershipStartDate),
          membershipEndDate: Timestamp.fromDate(membershipEndDate),
          updatedAt: new Date()
        });
      }
      
      // Reload data from Firestore and reset to first page
      await resetToFirstPage();
      await fetchTotalCount(); // Update total count
  
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
          email: "",
          membershipType: "Monthly"
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
        email: '',
        membershipType: 'Monthly'
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

  // Helper function to format Firestore Timestamp to DD-MM-YYYY format
  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    // Handle Firestore Timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Helper function to shorten membership type labels
  const getMembershipLabel = (type) => {
    switch(type) {
      case 'Monthly': return '1m';
      case 'Quarterly': return '4m';
      case 'Half-Yearly': return '6m';
      case 'Annual': return '1Y';
      default: return '-';
    }
  };

  // Common styles for text ellipsis
  const ellipsisStyle = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  // Handle expiry filter change
  const handleExpiryFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setExpiryFilter(newFilter);
    }
  };

  // Filter students based on expiry filter
  const getFilteredStudents = () => {
    if (expiryFilter === 'all') {
      return students;
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today

    let daysToAdd;
    switch (expiryFilter) {
      case '1day':
        daysToAdd = 1;
        break;
      case '3days':
        daysToAdd = 3;
        break;
      case '7days':
        daysToAdd = 7;
        break;
      case '1month':
        daysToAdd = 30;
        break;
      default:
        return students;
    }

    const filterEndDate = new Date(now);
    filterEndDate.setDate(filterEndDate.getDate() + daysToAdd);
    filterEndDate.setHours(23, 59, 59, 999); // End of the target day

    return students.filter(student => {
      if (!student.membershipEndDate) return false;
      
      // Convert Firestore Timestamp to Date
      const endDate = student.membershipEndDate.toDate 
        ? student.membershipEndDate.toDate() 
        : new Date(student.membershipEndDate);
      
      // Check if membership expires within the selected timeframe (from today up to X days)
      return endDate >= now && endDate <= filterEndDate;
    });
  };

  const filteredStudents = getFilteredStudents();

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

      {/* Expiry Filter Section */}
      <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
          Filter by Membership Expiry:
        </Typography>
        <ToggleButtonGroup
          value={expiryFilter}
          exclusive
          onChange={handleExpiryFilterChange}
          aria-label="expiry filter"
          size="small"
        >
          <ToggleButton value="all" aria-label="all students">
            All
          </ToggleButton>
          <ToggleButton 
            value="1day" 
            aria-label="expiring in 1 day"
            sx={{ 
              '&.Mui-selected': { 
                backgroundColor: 'error.light', 
                color: 'error.contrastText',
                '&:hover': { backgroundColor: 'error.main' }
              } 
            }}
          >
            Within 1 Day
          </ToggleButton>
          <ToggleButton 
            value="3days" 
            aria-label="expiring in 3 days"
            sx={{ 
              '&.Mui-selected': { 
                backgroundColor: 'warning.light', 
                color: 'warning.contrastText',
                '&:hover': { backgroundColor: 'warning.main' }
              } 
            }}
          >
            Within 3 Days
          </ToggleButton>
          <ToggleButton 
            value="7days" 
            aria-label="expiring in 7 days"
            sx={{ 
              '&.Mui-selected': { 
                backgroundColor: 'info.light', 
                color: 'info.contrastText',
                '&:hover': { backgroundColor: 'info.main' }
              } 
            }}
          >
            Within 7 Days
          </ToggleButton>
          <ToggleButton 
            value="1month" 
            aria-label="expiring in 1 month"
            sx={{ 
              '&.Mui-selected': { 
                backgroundColor: 'success.light', 
                color: 'success.contrastText',
                '&:hover': { backgroundColor: 'success.main' }
              } 
            }}
          >
            Within 1 Month
          </ToggleButton>
        </ToggleButtonGroup>
        {expiryFilter !== 'all' && (
          <Chip 
            label={`${filteredStudents.length} student${filteredStudents.length !== 1 ? 's' : ''} found`}
            color={expiryFilter === '1day' ? 'error' : expiryFilter === '3days' ? 'warning' : expiryFilter === '1month' ? 'success' : 'info'}
            size="small"
          />
        )}
      </Paper>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell sx={{ width: isMobile ? '30%' : '18%' }}>Student</TableCell>
                {!isMobile && <TableCell sx={{ width: '6%' }}>Age</TableCell>}
                {!isMobile && <TableCell sx={{ width: '10%' }}>Type</TableCell>}
                <TableCell sx={{ width: isMobile ? '20%' : '10%' }}>Status</TableCell>
                {!isMobile && <TableCell sx={{ width: '18%' }}>Email</TableCell>}
                {!isMobile && <TableCell sx={{ width: '8%' }}>Plan</TableCell>}
                <TableCell sx={{ width: isMobile ? '25%' : '10%' }}>Start</TableCell>
                <TableCell sx={{ width: isMobile ? '25%' : '10%' }}>End</TableCell>
                <TableCell sx={{ width: isMobile ? '20%' : '10%' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={isMobile ? 5 : 9} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Loading...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isMobile ? 5 : 9} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No students found</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredStudents.map((student) => (
                <TableRow key={student.id} hover>
                  <TableCell sx={{ ...ellipsisStyle, py: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: '0.875rem', flexShrink: 0 }}>
                       {student.name?.charAt(0) || '?'}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 'medium', ...ellipsisStyle }} title={student.name || ''}>
                        {student.name || ''}
                      </Typography>
                    </Box>
                  </TableCell>
                  {!isMobile && <TableCell sx={{ py: 1 }}>{student.age}</TableCell>}
                  {!isMobile && (
                    <TableCell sx={{ py: 1 }}>
                      <Chip 
                        label={student.coaching} 
                        color={getCoachingColor(student.coaching)}
                        size="small"
                        sx={{ height: 24, '& .MuiChip-label': { px: 1 } }}
                      />
                    </TableCell>
                  )}
                  <TableCell sx={{ py: 1 }}>
                    <Chip 
                      label={student.status} 
                      color={getStatusColor(student.status)}
                      size="small"
                      sx={{ height: 24, '& .MuiChip-label': { px: 1 } }}
                    />
                  </TableCell>
                  {!isMobile && (
                    <TableCell sx={{ ...ellipsisStyle, py: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={ellipsisStyle} title={student.email}>
                        {student.email}
                      </Typography>
                    </TableCell>
                  )}
                  {!isMobile && (
                    <TableCell sx={{ py: 1 }}>
                      <Chip 
                        label={getMembershipLabel(student.membershipType)} 
                        color="info"
                        size="small"
                        sx={{ height: 24, '& .MuiChip-label': { px: 1, fontSize: '0.75rem' } }}
                        title={student.membershipType || '-'}
                      />
                    </TableCell>
                  )}
                  <TableCell sx={{ py: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      {formatDate(student.membershipStartDate)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      {formatDate(student.membershipEndDate)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <IconButton 
                        size="small" 
                        color="primary" 
                        sx={{ p: 0.5 }}
                        onClick={() => isMobile ? handleViewStudent(student) : null}
                      >
                        <ViewIcon size={16} />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="warning"
                        onClick={() => handleEditStudent(student)}
                        sx={{ p: 0.5 }}
                      >
                        <EditIcon size={16} />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteClick(student.id, student.name)}
                        sx={{ p: 0.5 }}
                      >
                        <DeleteIcon size={16} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination Controls */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          p: 2, 
          borderTop: 1, 
          borderColor: 'divider' 
        }}>
          <Typography variant="body2" color="text.secondary">
            Page {currentPage} {totalStudents > 0 && `• Total: ${totalStudents} students`}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || isLoading}
            >
              Previous
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleNextPage}
              disabled={!hasNextPage || isLoading}
            >
              Next
            </Button>
          </Box>
        </Box>
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

      {/* View Student Details Dialog (Mobile) */}
      <Dialog
        open={viewDialog.open}
        onClose={handleCloseViewDialog}
        maxWidth="sm"
        fullWidth
        aria-labelledby="view-dialog-title"
      >
        <DialogTitle id="view-dialog-title">
          Student Details
        </DialogTitle>
        <DialogContent>
          {viewDialog.student && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, fontSize: '1.5rem' }}>
                  {viewDialog.student.name?.charAt(0) || '?'}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                    {viewDialog.student.name || '-'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {viewDialog.student.email || '-'}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Age
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {viewDialog.student.age || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Coaching Type
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip 
                      label={viewDialog.student.coaching || '-'} 
                      color={getCoachingColor(viewDialog.student.coaching)}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip 
                      label={viewDialog.student.status || '-'} 
                      color={getStatusColor(viewDialog.student.status)}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Membership Plan
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip 
                      label={viewDialog.student.membershipType || '-'} 
                      color="info"
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Start Date
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {formatDate(viewDialog.student.membershipStartDate)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    End Date
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {formatDate(viewDialog.student.membershipEndDate)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog} color="primary">
            Close
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
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Membership Type</InputLabel>
                  <Select
                    value={studentDialog.student.membershipType}
                    label="Membership Type"
                    onChange={(e) => handleInputChange('membershipType', e.target.value)}
                  >
                    <MenuItem value="Monthly">Monthly</MenuItem>
                    <MenuItem value="Quarterly">Quarterly</MenuItem>
                    <MenuItem value="Half-Yearly">Half-Yearly</MenuItem>
                    <MenuItem value="Annual">Annual</MenuItem>
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
