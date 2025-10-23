const cron = require("node-cron");
const Membership = require("../models/Membership");
const User = require("../models/User");
const sendEmail = require("../config/email");

// Run every day at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Running daily notification checks...");

    const today = new Date();
    const oneMonthFromNow = new Date(today);
    oneMonthFromNow.setDate(today.getDate() + 30);

    // notify users with memberships expiring in ~30 days
    const soon = await Membership.find({
      endDate: { $gte: today, $lte: oneMonthFromNow },
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
      } catch (err) {
        console.error("Notification send failed for", m.user.email, err);
      }
    }

  } catch (error) {
    console.error("Notification scheduler error:", error);
  }
});
