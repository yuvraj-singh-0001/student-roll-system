const Student = require("../models/Student");
const { sendMail } = require("../../utils/email");
const { v4: uuidv4 } = require("uuid");
const serverBaseUrl = (process.env.SERVER_BASE_URL || `http://localhost:${process.env.PORT || 5000}`)
  .replace(/\/+$/, "");

// Function to generate roll number
function generateRollNumber(course, index) {
  const coursePrefix = course ? course.substring(0, 3).toUpperCase() : "STU";
  return `${coursePrefix}${1000 + index}`;
}
// Main function to send notifications
const sendNotification = async (req, res) => {
  try {
    console.log("ðŸ“§ Starting notification send...");
    
    let students = await Student.find();
    console.log(`Found ${students.length} students`);

    if (!students.length) {
      return res.status(404).json({ 
        success: false,
        message: "No students found" 
      });
    }

    let rollNumberCounter = 1;
    let emailsSent = 0;

    for (const student of students) {
      try {
        // Auto-generate roll number if missing
        if (!student.rollNumber) {
          student.rollNumber = generateRollNumber(student.course || "General", rollNumberCounter);
          await student.save();
          console.log(`âœ… Generated roll number for ${student.name}: ${student.rollNumber}`);
          rollNumberCounter++;
        }

        // Generate unique tracking ID
        const trackingId = uuidv4();
        student.trackingId = trackingId;
        student.emailStatus = "sent";
        student.emailSentAt = new Date();

        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 500px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
              .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 5px; margin-bottom: 20px; }
              .content { padding: 20px; }
              .roll-box { background: #f0f4ff; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center; }
              .roll-number { font-size: 36px; font-weight: bold; color: #667eea; margin: 10px 0; }
              .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 15px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>Your Roll Number</h2>
              </div>
              
              <div class="content">
                <p>Hi <strong>${student.name}</strong>,</p>
                
                <p>Your roll number has been generated. Please keep it safe for future use.</p>
                
                <div class="roll-box">
                  <div style="color: #666; font-size: 14px; margin-bottom: 10px;">Roll Number</div>
                  <div class="roll-number">${student.rollNumber}</div>
                  ${student.course ? `<div style="color: #666; margin-top: 10px;">Course: ${student.course}</div>` : ''}
                </div>
                
                <p>Use this roll number for:</p>
                <ul>
                  <li>Exam registration</li>
                  <li>Official communication with the institution</li>
                  <li>Accessing student portal</li>
                </ul>
                
                <p>Thank you.</p>
              </div>
              
              <div class="footer">
                <p>SP Coaching Classes</p>
                <img src="${serverBaseUrl}/api/student/track/${trackingId}" alt="" width="1" height="1" style="display:none;" />
              </div>
            </div>
          </body>
          </html>
        `;

        await sendMail(
          student.email,
          "ðŸŽ“ Your Roll Number - Important Information",
          html
        );
        
        await student.save();
        emailsSent++;
        console.log(`âœ… Email sent to ${student.email} (Roll: ${student.rollNumber}, Tracking ID: ${trackingId})`);
      } catch (emailError) {
        console.error(`âŒ Failed to send to ${student.email}:`, emailError.message);
        student.emailStatus = "bounced";
        await student.save();
      }
    }
// Final response
    console.log(`ðŸ“Š Total emails sent: ${emailsSent}/${students.length}`);
    res.json({
      success: true,
      message: `âœ… Notifications sent successfully to ${emailsSent} students`,
    });

  } catch (error) {
    console.error("âŒ NOTIFICATION ERROR:", error.message);
    res.status(500).json({ 
      success: false,
      message: "Server error: " + error.message 
    });
  }
};

module.exports = sendNotification;


