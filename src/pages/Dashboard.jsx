import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Paper,
  Avatar
} from '@mui/material';
import {
  HiUsers as PeopleIcon,
  HiAcademicCap as SchoolIcon,
  HiUser as PersonIcon,
  HiCalendar as ScheduleIcon
} from 'react-icons/hi';

const Dashboard = () => {
  const stats = [
    {
      title: 'Total Students',
      value: '156',
      icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary.main'
    },
    {
      title: 'Active Classes',
      value: '12',
      icon: <SchoolIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success.main'
    },
    {
      title: 'Instructors',
      value: '8',
      icon: <PersonIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning.main'
    },
    {
      title: "Today's Sessions",
      value: '24',
      icon: <ScheduleIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      color: 'info.main'
    }
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
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
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  {stat.icon}
                </Box>
                <Typography variant="h3" component="div" sx={{ 
                  fontWeight: 'bold', 
                  color: stat.color,
                  mb: 1
                }}>
                  {stat.value}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No recent activities to display.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quick action buttons will be added here.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
