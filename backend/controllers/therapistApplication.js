const db = require("../config/db"); // Adjust based on your actual DB setup
const { sendEmail } = require("../utils/mail");

// Apply to become a therapist
exports.applyTherapist = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      qualifications,
      yearsOfExperience,
      specialization,
      licenseNumber,
      resumeLink, // or file upload reference
      coverLetter,
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !qualifications) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: fullName, email, phone, qualifications",
      });
    }

    // Store application in database
    const application = await db.query(
      `INSERT INTO therapist_applications 
             (full_name, email, phone, qualifications, years_of_experience, 
              specialization, license_number, resume_link, cover_letter, status, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', NOW())
             RETURNING *`,
      [
        fullName,
        email,
        phone,
        qualifications,
        yearsOfExperience,
        specialization,
        licenseNumber,
        resumeLink,
        coverLetter,
      ],
    );

    const applicationId = application.rows[0].id;

    // --- Send email to applicant (Application Received) ---
    const applicantEmailBody = `
            <h2>Thank You for Applying to Join Our Team</h2>
            <p>Dear ${fullName},</p>
            <p>We have received your application to become a therapist at St. Stephen's Family Autism Consultancy.</p>
            <p><strong>Application Details:</strong></p>
            <ul>
                <li>Application ID: ${applicationId}</li>
                <li>Full Name: ${fullName}</li>
                <li>Email: ${email}</li>
                <li>Phone: ${phone}</li>
                <li>Qualifications: ${qualifications}</li>
                <li>Years of Experience: ${yearsOfExperience || "Not specified"}</li>
                <li>Specialization: ${specialization || "Not specified"}</li>
            </ul>
            <p>Our team will review your application and contact you within 5-7 business days.</p>
            <p>Best regards,<br>St. Stephen's Family Team</p>
        `;

    await sendEmail({
      to: email,
      subject: "Application Received - St. Stephen's Family",
      html: applicantEmailBody,
    });

    // --- Send email to admin (New Application) ---
    const adminEmailBody = `
            <h2>New Therapist Application Received</h2>
            <p><strong>Application ID:</strong> ${applicationId}</p>
            <p><strong>Full Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Qualifications:</strong> ${qualifications}</p>
            <p><strong>Years of Experience:</strong> ${yearsOfExperience || "Not specified"}</p>
            <p><strong>Specialization:</strong> ${specialization || "Not specified"}</p>
            <p><strong>License Number:</strong> ${licenseNumber || "Not provided"}</p>
            <p><strong>Resume:</strong> ${resumeLink || "Not provided"}</p>
            <p><strong>Cover Letter:</strong> ${coverLetter || "Not provided"}</p>
            <p><strong>Status:</strong> Pending review</p>
            <p>Please log into the admin dashboard to review this application.</p>
        `;

    await sendEmail({
      to: process.env.ADMIN_EMAIL, // Set this in your .env file
      subject: `New Therapist Application #${applicationId} - ${fullName}`,
      html: adminEmailBody,
    });

    // Return success response
    res.status(201).json({
      success: true,
      message:
        "Application submitted successfully. You will receive a confirmation email shortly.",
      applicationId: applicationId,
    });
  } catch (error) {
    console.error("Error in therapist application:", error);

    res.status(500).json({
      success: false,
      message:
        "An error occurred while processing your application. Please try again later.",
    });
  }
};
