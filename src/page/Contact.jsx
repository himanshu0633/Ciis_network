import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  LocationOn,
  Phone,
  Email,
  Chat,
  Send,
  Business,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  WhatsApp,
  PrivacyTip
} from '@mui/icons-material';
import Footer from '../components/Footer';
import ciisHeader from '../components/CiisHeader';

function Contact() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Form submitted:', formData);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: ''
    });
    setIsSubmitting(false);
    
    // Show success message
    alert('Thank you for your message! We will get back to you soon.');
  };

  const contactInfo = [
    {
      icon: <Business sx={{ fontSize: 32 }} />,
      title: "Rutakshi Technologies Private Limited",
      description: "SCO 58, Top Floor, Sector 53,\nMogali, Chandigarh,\nPhase 8B, 160053, INDIA.",
      color: "#2196f3"
    },
    {
      icon: <Phone sx={{ fontSize: 32 }} />,
      title: "Phone",
      description: "+91 8179880074",
      color: "#4caf50"
    },
    {
      icon: <Email sx={{ fontSize: 32 }} />,
      title: "Email",
      description: "care@CiisNetwork.ai",
      color: "#ff9800"
    }
  ];

  const socialLinks = [
    { icon: <Facebook />, color: "#1877f2", name: "Facebook" },
    { icon: <Twitter />, color: "#1da1f2", name: "Twitter" },
    { icon: <Instagram />, color: "#e4405f", name: "Instagram" },
    { icon: <LinkedIn />, color: "#0a66c2", name: "LinkedIn" },
    { icon: <WhatsApp />, color: "#25d366", name: "WhatsApp" }
  ];

  return (
    <>
      <ciisHeader />
      
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Fade in timeout={1000}>
            <Box
              sx={{
                textAlign: 'center',
                maxWidth: '800px',
                mx: 'auto'
              }}
            >
              <Chip
                label="CONTACT US"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.3)',
                  px: 2,
                  py: 1,
                  mb: 4,
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              />
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.2
                }}
              >
                We're Here to Help — Let's Connect
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  opacity: 0.9,
                  lineHeight: 1.6,
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                  maxWidth: '600px',
                  mx: 'auto'
                }}
              >
                Whether you have questions, need support, or want to explore a partnership, 
                the CiisNetwork team is ready to assist you. Reach out and let's start the conversation.
              </Typography>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Contact Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={6} alignItems="flex-start">
          {/* Left Side - Contact Info */}
          <Grid item xs={12} md={6}>
            <Slide in timeout={800} direction="right">
              <Box>
                <Typography
                  variant="h3"
                  component="h2"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: 'text.primary',
                    fontSize: { xs: '2rem', md: '2.5rem' }
                  }}
                >
                  We'd Always Love to Hear From You
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ mb: 4, lineHeight: 1.6 }}
                >
                  Have any questions about CiisNetwork, product demo or support? 
                  Shoot them away here.
                </Typography>

                {/* Contact Information Cards */}
                <Box sx={{ mb: 6 }}>
                  {contactInfo.map((item, index) => (
                    <Fade in timeout={1000 + index * 200} key={index}>
                      <Card
                        sx={{
                          mb: 3,
                          border: `2px solid ${item.color}20`,
                          bgcolor: `${item.color}08`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: `0 8px 25px ${item.color}20`
                          }
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <Avatar
                              sx={{
                                bgcolor: item.color,
                                width: 56,
                                height: 56
                              }}
                            >
                              {item.icon}
                            </Avatar>
                            <Box>
                              <Typography variant="h6" component="h3" gutterBottom>
                                {item.title}
                              </Typography>
                              <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{ whiteSpace: 'pre-line' }}
                              >
                                {item.description}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Fade>
                  ))}
                </Box>

                {/* Social Media Links */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Follow Us
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {socialLinks.map((social, index) => (
                      <Zoom in timeout={1200 + index * 100} key={index}>
                        <IconButton
                          sx={{
                            bgcolor: social.color,
                            color: 'white',
                            width: 48,
                            height: 48,
                            '&:hover': {
                              bgcolor: social.color,
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {social.icon}
                        </IconButton>
                      </Zoom>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Slide>
          </Grid>

          {/* Right Side - Contact Form */}
          <Grid item xs={12} md={6}>
            <Slide in timeout={800} direction="left">
              <Paper
                elevation={8}
                sx={{
                  p: { xs: 3, md: 5 },
                  borderRadius: 4,
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Your Name *"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'white'
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Your Email *"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'white'
                          }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Your Phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                              <Typography variant="body2" sx={{ mr: 0.5 }}>🇮🇳</Typography>
                              <Typography variant="body2" color="text.secondary">
                                +91
                              </Typography>
                            </Box>
                          )
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'white'
                          }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Message *"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        multiline
                        rows={4}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'white'
                          }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          justifyContent: 'space-between',
                          alignItems: { xs: 'stretch', sm: 'center' },
                          gap: 2
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                        >
                          <PrivacyTip fontSize="small" />
                          By submitting this form, I agree to the{' '}
                          <Button variant="text" size="small" sx={{ minWidth: 'auto' }}>
                            privacy policy
                          </Button>
                        </Typography>
                        
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          disabled={isSubmitting}
                          startIcon={isSubmitting ? null : <Send />}
                          sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: 2,
                            px: 4,
                            py: 1.5,
                            fontWeight: 600,
                            minWidth: '140px',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {isSubmitting ? 'Sending...' : 'Contact Us'}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              </Paper>
            </Slide>
          </Grid>
        </Grid>
      </Container>

      {/* Map Section */}
      <Box sx={{ bgcolor: 'grey.50', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Fade in timeout={1000}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h3"
                component="h2"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  color: 'text.primary'
                }}
              >
                Find Us Here
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ mb: 4 }}
              >
                Visit our office in the heart of Chandigarh
              </Typography>
              
              <Paper
                elevation={4}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  minHeight: '300px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <LocationOn sx={{ fontSize: 64, color: 'primary.main' }} />
                <Typography variant="h5" fontWeight={600}>
                  📍 Our Chandigarh Office
                </Typography>
                <Typography variant="h6" color="text.secondary" align="center">
              
                  Mohali, Chandigarh, Phase 8B<br />
                  160053, INDIA
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<LocationOn />}
                  sx={{ mt: 2, borderRadius: 2 }}
                >
                  View on Google Maps
                </Button>
              </Paper>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Floating Chat Button */}
      <Zoom in timeout={1000}>
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000
          }}
        >
          <IconButton
            onClick={() => setChatOpen(true)}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              width: 64,
              height: 64,
              '&:hover': {
                bgcolor: 'primary.dark',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
            }}
          >
            <Chat sx={{ fontSize: 32 }} />
          </IconButton>
        </Box>
      </Zoom>

      {/* Chat Dialog */}
      <Dialog
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            height: '400px'
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Chat with Us
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Chat sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Hello! How can we help you?
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Our team is here to answer your questions about CiisNetwork
            </Typography>
            <Button
              variant="contained"
              startIcon={<WhatsApp />}
              sx={{
                bgcolor: '#25d366',
                '&:hover': { bgcolor: '#128C7E' },
                borderRadius: 2
              }}
            >
              Start WhatsApp Chat
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button onClick={() => setChatOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </>
  );
}

export default Contact;