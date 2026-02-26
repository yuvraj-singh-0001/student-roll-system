const bcrypt = require("bcryptjs");
const Student = require("../../models/Student");
const Teacher = require("../../models/Teacher");
const Parent = require("../../models/Parent");

const normalizeText = (value) => String(value || "").trim();
const normalizeLower = (value) => normalizeText(value).toLowerCase();
const normalizeDigits = (value) => String(value || "").replace(/\D/g, "");

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
    const whatsappNumber = normalizeDigits(verification.whatsappNumber);
    const rawUsername = normalizeLower(account.username);
    const password = String(account.password || "");

    const rawRole = normalizeLower(payload.role || "student");
    const role = ["student", "teacher", "parent"].includes(rawRole)
      ? rawRole
      : "student";

    let error =
      ensureRequired(fullName, "Full name") ||
      ensureRequired(whatsappNumber, "WhatsApp number") ||
      ensureRequired(rawUsername, "Username") ||
      ensureRequired(password, "Password");

    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    if (whatsappNumber.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "WhatsApp number must be exactly 10 digits.",
      });
    }

    const expectedName = normalizeLower(student.name);
    const expectedMobile = normalizeDigits(student.mobile);
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

    let ROLE_PREFIX = "@S-";
    if (role === "teacher") ROLE_PREFIX = "@T-";
    else if (role === "parent") ROLE_PREFIX = "@P-";

    const username = `${ROLE_PREFIX}${rawUsername}`;

    let existingUsername = null;

    if (role === "teacher") {
      existingUsername = await Teacher.findOne({
        "formB.account.username": username,
      });
    } else if (role === "parent") {
      existingUsername = await Parent.findOne({
        "formB.account.username": username,
      });
    } else {
      existingUsername = await Student.findOne({
        "formB.account.username": username,
        _id: { $ne: student._id },
      });
    }
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
    const contactGender = normalizeText(contact.gender);

    error =
      ensureRequired(contactEmail, "Gmail") ||
      ensureRequired(contactDob, "DOB") ||
      ensureRequired(contactCountry, "Country") ||
      ensureRequired(contactGender, "Gender");

    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const isIndia = contactCountry.toLowerCase() === "india";
    if (isIndia) {
      error =
        ensureRequired(contactState, "State") ||
        ensureRequired(contactDistrict, "District");
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
      error = ensureRequired(schoolState, "School state");
      if (error) {
        return res.status(400).json({ success: false, message: error });
      }
    }

    const father = parents.father || {};
    const mother = parents.mother || {};

    error =
      ensureRequired(normalizeText(father.name), "Father name") ||
      ensureRequired(normalizeText(father.phone), "Father phone number") ||
      ensureRequired(normalizeText(mother.name), "Mother name") ||
      ensureRequired(normalizeText(mother.phone), "Mother phone number");

    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const siblingsCount = Number(siblings.count || 0);
    const siblingDetails = Array.isArray(siblings.details)
      ? siblings.details
      : [];

    if (siblingsCount < 1 || !Number.isFinite(siblingsCount)) {
      return res.status(400).json({
        success: false,
        message: "Number of siblings is required.",
      });
    }

    if (siblingDetails.length < siblingsCount) {
      return res.status(400).json({
        success: false,
        message: "Please fill all sibling details.",
      });
    }

    for (let i = 0; i < siblingsCount; i += 1) {
      const sibling = siblingDetails[i] || {};
      if (!normalizeText(sibling.name)) {
        return res.status(400).json({
          success: false,
          message: `Sibling ${i + 1} name is required.`,
        });
      }
      if (!normalizeText(sibling.age)) {
        return res.status(400).json({
          success: false,
          message: `Sibling ${i + 1} age is required.`,
        });
      }
      if (!normalizeText(sibling.class)) {
        return res.status(400).json({
          success: false,
          message: `Sibling ${i + 1} class is required.`,
        });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const formBData = {
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
        pinCode: normalizeText(contact.pinCode),
        gender: contactGender,
        address: normalizeText(contact.address),
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
        followed: !!social.followed,
        followedAt: social.followed ? new Date() : null,
      },
    };

    student.formB = formBData;

    student.formBSubmitted = true;
    student.formBSubmittedAt = new Date();

    if (contactEmail) {
      student.email = contactEmail;
    }

    await student.save();

    // Mirror Form B data into Teacher/Parent collections based on selected role
    if (role === "teacher") {
      await Teacher.findOneAndUpdate(
        {
          name: fullName,
          mobile: whatsappNumber,
        },
        {
          name: fullName,
          mobile: whatsappNumber,
          class: student.class,
          isPaid: student.isPaid,
          payment: student.payment,
          formASubmitted: true,
          formBSubmitted: true,
          formBSubmittedAt: new Date(),
          formB: formBData,
          email: contactEmail || student.email,
        },
        { upsert: true, new: true }
      );
    } else if (role === "parent") {
      await Parent.findOneAndUpdate(
        {
          name: fullName,
          mobile: whatsappNumber,
        },
        {
          name: fullName,
          mobile: whatsappNumber,
          class: student.class,
          isPaid: student.isPaid,
          payment: student.payment,
          formASubmitted: true,
          formBSubmitted: true,
          formBSubmittedAt: new Date(),
          formB: formBData,
          email: contactEmail || student.email,
        },
        { upsert: true, new: true }
      );
    }

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
