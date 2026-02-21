const bcrypt = require("bcryptjs");
const Student = require("../../models/Student");

const normalizeText = (value) => String(value || "").trim();
const normalizeLower = (value) => normalizeText(value).toLowerCase();

const ensureRequired = (value, label) => {
  if (!value) {
    return `${label} is required.`;
  }
  return null;
};

const registerFormB = async (req, res) => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Login required",
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (!student.isPaid) {
      return res.status(403).json({
        success: false,
        message: "Payment required before Form B submission.",
      });
    }

    const payload = req.body || {};
    const verification = payload.verification || {};
    const account = payload.account || {};
    const contact = payload.contact || {};
    const school = payload.school || {};
    const parents = payload.parents || {};
    const siblings = payload.siblings || {};
    const social = payload.social || {};

    const fullName = normalizeText(verification.fullName);
    const whatsappNumber = normalizeText(verification.whatsappNumber);
    const username = normalizeLower(account.username);
    const password = String(account.password || "");

    let error =
      ensureRequired(fullName, "Full name") ||
      ensureRequired(whatsappNumber, "WhatsApp number") ||
      ensureRequired(username, "Username") ||
      ensureRequired(password, "Password");

    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const expectedName = normalizeLower(student.name);
    const expectedMobile = normalizeText(student.mobile);
    if (
      (expectedName && expectedName !== normalizeLower(fullName)) ||
      (expectedMobile && expectedMobile !== whatsappNumber)
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Name and WhatsApp number must match Form A. Please proceed to payment.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const existingUsername = await Student.findOne({
      "formB.account.username": username,
      _id: { $ne: student._id },
    });
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: "Username already taken. Please choose another.",
      });
    }

    const contactEmail = normalizeLower(contact.email);
    const contactDob = normalizeText(contact.dob);
    const contactCountry = normalizeText(contact.country);
    const contactState = normalizeText(contact.state);
    const contactDistrict = normalizeText(contact.district);
    const contactPin = normalizeText(contact.pinCode);
    const contactGender = normalizeText(contact.gender);
    const contactAddress = normalizeText(contact.address);

    error =
      ensureRequired(contactEmail, "Gmail") ||
      ensureRequired(contactDob, "DOB") ||
      ensureRequired(contactCountry, "Country") ||
      ensureRequired(contactGender, "Gender") ||
      ensureRequired(contactAddress, "Full address");

    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const isIndia = contactCountry.toLowerCase() === "india";
    if (isIndia) {
      error =
        ensureRequired(contactState, "State") ||
        ensureRequired(contactDistrict, "District") ||
        ensureRequired(contactPin, "Pin code");
      if (error) {
        return res.status(400).json({ success: false, message: error });
      }
    }

    const schoolCountry = normalizeText(school.country);
    const schoolName = normalizeText(school.name);
    const schoolState = normalizeText(school.state);
    const schoolDistrict = normalizeText(school.district);
    const schoolPin = normalizeText(school.pinCode);

    error =
      ensureRequired(schoolCountry, "School country") ||
      ensureRequired(schoolName, "School name");

    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const isSchoolIndia = schoolCountry.toLowerCase() === "india";
    if (isSchoolIndia) {
      error =
        ensureRequired(schoolState, "School state") ||
        ensureRequired(schoolDistrict, "School district") ||
        ensureRequired(schoolPin, "School pin code");
      if (error) {
        return res.status(400).json({ success: false, message: error });
      }
    }

    const father = parents.father || {};
    const mother = parents.mother || {};

    error =
      ensureRequired(normalizeText(father.name), "Father name") ||
      ensureRequired(normalizeText(father.phone), "Father phone number") ||
      ensureRequired(normalizeLower(father.email), "Father Gmail") ||
      ensureRequired(normalizeText(father.profession), "Father profession") ||
      ensureRequired(normalizeText(mother.name), "Mother name") ||
      ensureRequired(normalizeText(mother.phone), "Mother phone number") ||
      ensureRequired(normalizeLower(mother.email), "Mother Gmail") ||
      ensureRequired(normalizeText(mother.profession), "Mother profession");

    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const siblingsCount = Number(siblings.count || 0);
    const siblingDetails = Array.isArray(siblings.details)
      ? siblings.details
      : [];

    if (siblingsCount < 0 || !Number.isFinite(siblingsCount)) {
      return res.status(400).json({
        success: false,
        message: "Invalid siblings count.",
      });
    }

    if (siblingsCount > 0 && siblingDetails.length < siblingsCount) {
      return res.status(400).json({
        success: false,
        message: "Please fill all sibling details.",
      });
    }

    const followed = !!social.followed;
    if (!followed) {
      return res.status(400).json({
        success: false,
        message: "Please follow True Topper to continue.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    student.formB = {
      verification: {
        fullName,
        whatsappNumber,
      },
      account: {
        username,
        passwordHash,
      },
      contact: {
        email: contactEmail,
        dob: contactDob ? new Date(contactDob) : null,
        country: contactCountry,
        state: contactState,
        district: contactDistrict,
        pinCode: contactPin,
        gender: contactGender,
        address: contactAddress,
      },
      school: {
        country: schoolCountry,
        name: schoolName,
        state: schoolState,
        district: schoolDistrict,
        pinCode: schoolPin,
      },
      parents: {
        father: {
          name: normalizeText(father.name),
          phone: normalizeText(father.phone),
          email: normalizeLower(father.email),
          profession: normalizeText(father.profession),
        },
        mother: {
          name: normalizeText(mother.name),
          phone: normalizeText(mother.phone),
          email: normalizeLower(mother.email),
          profession: normalizeText(mother.profession),
        },
      },
      siblings: {
        count: siblingsCount,
        details: siblingDetails.slice(0, siblingsCount).map((s) => ({
          name: normalizeText(s?.name),
          age: normalizeText(s?.age),
          class: normalizeText(s?.class),
        })),
      },
      social: {
        followed: true,
        followedAt: new Date(),
      },
    };

    student.formBSubmitted = true;
    student.formBSubmittedAt = new Date();

    if (contactEmail) {
      student.email = contactEmail;
    }

    await student.save();

    return res.status(200).json({
      success: true,
      message: "Form B submitted successfully.",
      data: {
        studentId: student._id,
        formBSubmitted: student.formBSubmitted,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to submit Form B. Please try again.",
      error: error.message,
    });
  }
};

module.exports = registerFormB;
