// यह API email open tracking update करता है
const Student = require("../../models/Student");

// Track Email Open API
const trackEmailOpen = async (req, res) => {
  try {
    const { trackingId } = req.params; 

    console.log(` Tracking request received for ID: ${trackingId}`);

    // Update only once - if already opened, don't update again
    const student = await Student.findOne({ trackingId });

    if (!student) {
      console.log(` Tracking ID not found: ${trackingId}`);
      // Return a 1x1 transparent pixel even if tracking ID not found
      res.setHeader("Content-Type", "image/gif");
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      res.setHeader("Pragma", "no-cache");
      return res.send(Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64"));
    }

    // Only update if not already opened
    if (student.emailStatus !== "opened") {
      student.emailStatus = "opened";
      student.emailOpenedAt = new Date();

      // Add to notification history
      if (!student.notificationHistory) {
        student.notificationHistory = [];
      }

      student.notificationHistory.push({
        sentAt: student.emailSentAt,
        status: "opened",
        openedAt: new Date(),
      });

      await student.save();
      console.log(` Email marked as OPENED: ${student.name} (${student.email}) at ${student.emailOpenedAt.toISOString()}`);
    } else {
      console.log(`Email already opened: ${student.name} (${student.email})`);
    }

    // Return a 1x1 transparent pixel
    res.setHeader("Content-Type", "image/gif");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Content-Length", 43);
    res.send(Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64"));
  } catch (error) {
    console.error("âŒ Tracking error:", error.message);
    console.error(error);
    // Still return pixel to avoid breaking emails
    res.setHeader("Content-Type", "image/gif");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    res.setHeader("Content-Length", 43);
    res.send(Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64"));
  }
};

module.exports = trackEmailOpen;
