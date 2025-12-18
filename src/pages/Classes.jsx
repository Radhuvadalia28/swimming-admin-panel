import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Chip,
  Avatar,
  IconButton
} from '@mui/material';
import {
  HiPlus as AddIcon,
  HiPencil as EditIcon,
  HiTrash as DeleteIcon,
  HiUsers as PeopleIcon,
  HiCalendar as ScheduleIcon,
  HiLocationMarker as LocationIcon
} from 'react-icons/hi';

const Classes = () => {
  // Available time slots with themed names
  const timeSlots = [
    { id: 1, label: '5:00 AM - 6:00 AM', value: '5:00 AM - 6:00 AM', period: 'Morning', name: 'Early Bird Batch' },
    { id: 2, label: '6:00 AM - 7:00 AM', value: '6:00 AM - 7:00 AM', period: 'Morning', name: 'Rise and Glide' },
    { id: 3, label: '7:00 AM - 8:00 AM', value: '7:00 AM - 8:00 AM', period: 'Morning', name: 'Morning Masters' },
    { id: 4, label: '8:00 AM - 9:00 AM', value: '8:00 AM - 9:00 AM', period: 'Morning', name: 'Bright Start' },
    { id: 5, label: '4:00 PM - 5:00 PM', value: '4:00 PM - 5:00 PM', period: 'Evening', name: 'Aqua Prep Batch' },
    { id: 6, label: '5:00 PM - 6:00 PM', value: '5:00 PM - 6:00 PM', period: 'Evening', name: 'Twilight Learners' },
    { id: 7, label: '6:00 PM - 7:00 PM', value: '6:00 PM - 7:00 PM', period: 'Evening', name: 'Evening Wave' },
    { id: 8, label: '7:00 PM - 8:00 PM', value: '7:00 PM - 8:00 PM', period: 'Evening', name: 'Night Glide' }
  ];

  // Mock data for demonstration - sorted in chronological order
  const classes = [
    {
      id: 1,
      name: 'Early Bird Batch',
      instructor: 'Coach Sarah',
      level: 'Beginner',
      capacity: 12,
      enrolled: 8,
      time: 'Mon, Wed, Fri 5:00 AM - 6:00 AM',
      timeSlot: '5:00 AM - 6:00 AM',
      days: 'Mon, Wed, Fri',
      location: 'Pool A',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Rise and Glide',
      instructor: 'Coach Alex',
      level: 'Intermediate',
      capacity: 10,
      enrolled: 7,
      time: 'Mon, Wed, Fri 6:00 AM - 7:00 AM',
      timeSlot: '6:00 AM - 7:00 AM',
      days: 'Mon, Wed, Fri',
      location: 'Pool A',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Morning Masters',
      instructor: 'Coach Lisa',
      level: 'Advanced',
      capacity: 8,
      enrolled: 6,
      time: 'Sat 7:00 AM - 8:00 AM',
      timeSlot: '7:00 AM - 8:00 AM',
      days: 'Sat',
      location: 'Pool A',
      status: 'Active'
    },
    {
      id: 4,
      name: 'Bright Start',
      instructor: 'Coach James',
      level: 'Beginner',
      capacity: 10,
      enrolled: 5,
      time: 'Mon, Wed, Fri 8:00 AM - 9:00 AM',
      timeSlot: '8:00 AM - 9:00 AM',
      days: 'Mon, Wed, Fri',
      location: 'Pool A',
      status: 'Active'
    },
    {
      id: 5,
      name: 'Aqua Prep Batch',
      instructor: 'Coach Mike',
      level: 'Intermediate',
      capacity: 10,
      enrolled: 10,
      time: 'Tue, Thu 4:00 PM - 5:00 PM',
      timeSlot: '4:00 PM - 5:00 PM',
      days: 'Tue, Thu',
      location: 'Pool B',
      status: 'Full'
    },
    {
      id: 6,
      name: 'Twilight Learners',
      instructor: 'Coach Emma',
      level: 'Advanced',
      capacity: 12,
      enrolled: 9,
      time: 'Tue, Thu 5:00 PM - 6:00 PM',
      timeSlot: '5:00 PM - 6:00 PM',
      days: 'Tue, Thu',
      location: 'Pool B',
      status: 'Active'
    },
    {
      id: 7,
      name: 'Evening Wave',
      instructor: 'Coach Tom',
      level: 'Beginner',
      capacity: 15,
      enrolled: 12,
      time: 'Mon, Wed 6:00 PM - 7:00 PM',
      timeSlot: '6:00 PM - 7:00 PM',
      days: 'Mon, Wed',
      location: 'Pool C',
      status: 'Active'
    },
    {
      id: 8,
      name: 'Night Glide',
      instructor: 'Coach Maria',
      level: 'Advanced',
      capacity: 8,
      enrolled: 6,
      time: 'Tue, Thu 7:00 PM - 8:00 PM',
      timeSlot: '7:00 PM - 8:00 PM',
      days: 'Tue, Thu',
      location: 'Pool B',
      status: 'Active'
    }
  ];

  const getStatusColor = (status) => {
    return status === 'Active' ? 'success' : 'warning';
  };

  const getLevelColor = (level) => {
    switch(level) {
      case 'Beginner': return 'info';
      case 'Intermediate': return 'warning';
      case 'Advanced': return 'success';
      default: return 'default';
    }
  };

  const getTimeSlotColor = (timeSlot) => {
    if (timeSlot.includes('AM')) {
      return 'info'; // Morning slots in blue
    } else {
      return 'secondary'; // Evening slots in purple
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Classes
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          sx={{ borderRadius: 2 }}
        >
          Create New Class
        </Button>
      </Box>

      <Grid container spacing={3}>
        {classes.map((classItem) => (
          <Grid item xs={12} sm={6} lg={4} key={classItem.id}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                    {classItem.name}
                  </Typography>
                  <Chip 
                    label={classItem.status} 
                    color={getStatusColor(classItem.status)}
                    size="small"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    <Chip 
                      label={classItem.level} 
                      color={getLevelColor(classItem.level)}
                      size="small"
                    />
                    <Chip 
                      label={classItem.timeSlot} 
                      color={getTimeSlotColor(classItem.timeSlot)}
                      size="small"
                    />
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PeopleIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {classItem.instructor}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <ScheduleIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                        {classItem.days}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {classItem.timeSlot}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {classItem.location}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {classItem.enrolled}/{classItem.capacity} students
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small" color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Classes;
