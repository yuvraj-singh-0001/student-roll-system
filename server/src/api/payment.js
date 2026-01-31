const User = require("../models/User");

/**
 * FAKE PAYMENT (LOCAL TESTING)
 */
const fakePayment = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.isPaid = true;
    user.payment = {
      status: "paid",
      paidAt: new Date()
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Payment successful ",
      user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: " payment failed",
      error: error.message
    });
  }
};

module.exports =  fakePayment ;
