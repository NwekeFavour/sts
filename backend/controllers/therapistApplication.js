const { supabaseAdmin } = require("../config/db");
const {
  sendTherapistInviteEmail,
  sendPasswordResetEmail,
} = require("../utils/mail");

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
      resumeLink,
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

    // Store application in Supabase
    const { data, error } = await supabaseAdmin
      .from("therapist_applications")
      .insert([
        {
          full_name: fullName,
          email: email,
          phone: phone,
          qualifications: qualifications,
          years_of_experience: yearsOfExperience || null,
          specialization: specialization || null,
          license_number: licenseNumber || null,
          resume_link: resumeLink || null,
          cover_letter: coverLetter || null,
          status: "pending",
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Database error: " + error.message,
      });
    }

    const applicationId = data[0].id;

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

    await sendTherapistInviteEmail({
      to: email,
      name: fullName,
      subject: "Application Received - St. Stephen's Family",
      htmlContent: applicantEmailBody,
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

    await sendTherapistInviteEmail({
      to: process.env.EMAIL_FROM,
      name: "Admin",
      subject: `New Therapist Application #${applicationId} - ${fullName}`,
      htmlContent: adminEmailBody,
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
    console.error("Full error details:", JSON.stringify(error, null, 2));
    res.status(500).json({
      success: false,
      message:
        "An error occurred while processing your application. Please try again later.",
      error: error.message,
    });
  }
};

// Get all applications (admin only)
exports.getAllApplications = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("therapist_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update application status (admin only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const { data, error } = await supabaseAdmin
      .from("therapist_applications")
      .update({ status })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    if (data.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    res.status(200).json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
