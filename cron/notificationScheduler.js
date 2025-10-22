const cron = require("node-cron");
const Membership = require("../models/Membership");
const User = require("../models/User");
const sendEmail = require("../config/email");

// Run every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Running daily notification checks...");

  const today = new Date();
  const oneMonthFromNow = new Date(today);
  oneMonthFromNow.setMonth(today.getMonth() + 1);

  try {
    // Membership Expiry Notifications
    const expiringMemberships = await Membership.find({
      endDate: { $lte: oneMonthFromNow, $gte: today },
      status: "active",
    }).populate("user", "email firstName");

    for (const m of expiringMemberships) {
      const { user } = m;
      const message = `
        <p>Hi ${user.firstName || ""},</p>
        <p>Your gym membership is expiring soon on <b>${m.endDate.toDateString()}</b>.</p>
        <p>Please renew your membership to continue your training.</p>
      `;
      await sendEmail(user.email, "Membership Expiry Reminder", message);
    }

    // Account Deletion/Archival Notifications
    const toBeArchived = await User.find({
      verified: false,
      createdAt: { $lte: new Date(today.setMonth(today.getMonth() - 11)) },
    });

    for (const u of toBeArchived) {
      const msg = `
        <p>Hi ${u.firstName || ""},</p>
        <p>Your account will be archived soon due to inactivity.</p>
        <p>Please log in or verify your email to keep it active.</p>
      `;
      await sendEmail(u.email, "Account Archival Reminder", msg);
    }

    console.log(`Sent ${expiringMemberships.length + toBeArchived.length} notifications`);
  } catch (error) {
    console.error("Cron job error:", error);
  }
});
