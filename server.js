
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

const bookingsFilePath = path.join(__dirname, "data", "bookings.json");

// Middleware
app.use(cors()); // Enable CORS
// app.use(cors({ origin: "https://restaurant-booking-6sdr.vercel.app/" })); // replace with your frontend URL

app.use(express.json()); // Parse JSON request bodies

// Utility function: Read bookings from file
const readBookings = () => {
  try {
    const data = fs.readFileSync(bookingsFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading bookings file:", error.message);
    return [];
  }
};

// Utility function: Write bookings to file
const writeBookings = (bookings) => {
  try {
    fs.writeFileSync(bookingsFilePath, JSON.stringify(bookings, null, 2));
  } catch (error) {
    console.error("Error writing bookings file:", error.message);
  }
};

// Route: Get all bookings
app.get("/api/bookings", (req, res) => {
  try {
    const bookings = readBookings();
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error.message);
    res.status(500).json({ message: "Failed to fetch bookings." });
  }
});

// Route: Create a new booking
app.post("/api/bookings", (req, res) => {
  const { date, time, guests, name, contact } = req.body;

  if (!date || !time || !guests || !name || !contact) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Read existing bookings
  const bookings = readBookings();

  // Check for existing booking with same date and time
  const isSlotTaken = bookings.some(
    (booking) => booking.date === date && booking.time === time
  );

  if (isSlotTaken) {
    return res.status(400).json({ message: "Slot is not available." });
  }

  // Add new booking
  const newBooking = { id: Date.now().toString(), date, time, guests, name, contact };
  bookings.push(newBooking);
  writeBookings(bookings);

  res.status(201).json({ message: "Booking successful!", booking: newBooking });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
