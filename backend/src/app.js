const express = require("express");
const cors = require("cors");
const path = require("path");

const prayerRoutes = require("./routes/prayerRoutes");
const testimonyRoutes = require("./routes/testimonyRoutes");
const adminRoutes = require("./routes/adminRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const livestreamRoutes = require("./routes/livestreamRoutes");
const contactRoutes = require("./routes/contactRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const managementRoutes = require("./routes/managementRoutes");
const massBookingRoutes = require("./routes/massBookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const fathersRoutes = require("./routes/fathersRoutes");
const donationRoutes = require("./routes/donationRoutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


const initializeAdmin = async () => {
  try {
  
    const AdminModel = require("./models/adminModel");
    await AdminModel.createTable();
    await AdminModel.createDefaultAdmin();
    console.log('Admin system initialized successfully');
  } catch (error) {
    console.error('Error initializing admin system:', error.message);
    console.log('Admin system will be disabled. Install bcryptjs and jsonwebtoken to enable admin features.');
  }
};


const initializeGallery = async () => {
  try {
    const GalleryModel = require("./models/galleryModel");
    await GalleryModel.createTable();
    console.log('Gallery system initialized successfully');
  } catch (error) {
    console.error('Error initializing gallery system:', error.message);
  }
};


const initializeContact = async () => {
  try {
    const ContactModel = require("./models/contactModel");
    await ContactModel.createTable();
    await ContactModel.initializeDefaultContact();
    console.log('Contact system initialized successfully');
  } catch (error) {
    console.error('Error initializing contact system:', error.message);
  }
};

// Initialize testimonies table
const initializeTestimonies = async () => {
  try {
    const TestimonyModel = require("./models/testimonyModel");
    await TestimonyModel.createTable();
    console.log('Testimonies system initialized successfully');
  } catch (error) {
    console.error('Error initializing testimonies system:', error.message);
  }
};

const initializeLivestream = async () => {
  try {
    const LivestreamModel = require("./models/livestreamModel");
    await LivestreamModel.createTable();
    console.log('Livestream system initialized successfully');
  } catch (error) {
    console.error('Error initializing livestream system:', error.message);
  }
};

// Initialize announcements table
const initializeAnnouncements = async () => {
  try {
    const AnnouncementModel = require("./models/announcementModel");
    await AnnouncementModel.createTable();
    console.log('Announcements system initialized successfully');
  } catch (error) {
    console.error('Error initializing announcements system:', error.message);
  }
};

// Initialize management team table
const initializeManagement = async () => {
  try {
    const ManagementModel = require("./models/managementModel");
    await ManagementModel.createTable();
    console.log('Management team system initialized successfully');
  } catch (error) {
    console.error('Error initializing management team system:', error.message);
  }
};

// Initialize mass bookings table
const initializeMassBookings = async () => {
  try {
    const MassBookingModel = require("./models/massBookingModel");
    await MassBookingModel.createTable();
    console.log('Mass bookings system initialized successfully');
  } catch (error) {
    console.error('Error initializing mass bookings system:', error.message);
  }
};

// Initialize payments table
const initializePayments = async () => {
  try {
    const PaymentModel = require("./models/paymentModel");
    await PaymentModel.createTable();
    console.log('Payments system initialized successfully');
  } catch (error) {
    console.error('Error initializing payments system:', error.message);
  }
};

// Initialize donations table
const initializeDonations = async () => {
  try {
    const DonationModel = require("./models/donationModel");
    await DonationModel.createTable();
    console.log('Donations system initialized successfully');
  } catch (error) {
    console.error('Error initializing donations system:', error.message);
  }
};

// Initialize fathers table
const initializeFathers = async () => {
  try {
    const FathersModel = require("./models/fathersModel");
    await FathersModel.createTable();
    await FathersModel.initializeDefaultData();
    console.log('Fathers system initialized successfully');
  } catch (error) {
    console.error('Error initializing fathers system:', error.message);
  }
};

setTimeout(() => {
  initializeAdmin();
  initializeGallery();
  initializeTestimonies();
  initializeLivestream();
  initializeContact();
  initializeAnnouncements();
  initializeManagement();
  initializeMassBookings();
  initializePayments();
  initializeDonations();
  initializeFathers();
}, 1000);

app.use("/api/prayers", prayerRoutes);
app.use("/api/testimonies", testimonyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/livestream", livestreamRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/management", managementRoutes);
app.use("/api/mass-bookings", massBookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/fathers", fathersRoutes);

app.get("/", (req, res) => {
  res.send("Prayer API is running with Gallery, Livestream, Contact, Announcements, Management, Mass Bookings, and Payments support");
});

module.exports = app;
