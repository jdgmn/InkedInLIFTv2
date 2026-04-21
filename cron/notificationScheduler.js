const cron = require("node-cron");
const Membership = require("../models/Membership");
const User = require("../models/User");
const sendEmail = require("../config/email");

// Run every day at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Running daily notification checks...");

    const today = new Date();
    // Set time to start of day to match exact date comparison
    today.setHours(0, 0, 0, 0);
    
    const exactly30DaysFromNow = new Date(today);
    exactly30DaysFromNow.setDate(today.getDate() + 30);
    exactly30DaysFromNow.setHours(23, 59, 59, 999);

    // Only notify users when membership expires EXACTLY in 30 days (one single notification)
    const soon = await Membership.find({
      endDate: { $gte: today, $lte: exactly30DaysFromNow },
      expiryNotificationSent: { $ne: true }
    }).populate("user", "email firstName lastName");

    for (const m of soon) {
      if (!m.user || !m.user.email) continue;
      const name = `${m.user.firstName || ""} ${m.user.lastName || ""}`.trim();
      try {
        await sendEmail(
          m.user.email,
          "Membership expiring soon - InkedInLIFTv2",
          `<p>Hi ${name || "member"},</p>
           <p>Your ${m.membershipType} membership will expire on ${m.endDate.toDateString()}. Please renew to avoid interruption.</p>`
        );
        
        // Mark notification as sent so we don't send it again
        m.expiryNotificationSent = true;
        await m.save();
        
      } catch (err) {
        console.error("Notification send failed for", m.user.email, err);
      }
    }

  } catch (error) {
    console.error("Notification scheduler error:", error);
  }
});
