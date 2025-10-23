const cron = require("node-cron");
const Membership = require("../models/Membership");
const Checkin = require("../models/Checkin");
const Archive = require("../models/Archive");
const sendEmail = require("../config/email");
const User = require("../models/User");

// Run at midnight every Jan 1
cron.schedule("0 0 1 1 *", async () => {
  try {
    const now = new Date();
    const yearToArchive = now.getFullYear() - 1;

    // Archive memberships that ended in previous year
    const membershipsToArchive = await Membership.find({
      endDate: {
        $gte: new Date(`${yearToArchive}-01-01`),
        $lte: new Date(`${yearToArchive}-12-31T23:59:59.999Z`),
      },
    }).lean();

    if (membershipsToArchive.length) {
      await Archive.create({
        year: yearToArchive,
        type: "membership",
        data: membershipsToArchive,
      });
      // optional: remove archived items or mark them archived
      console.log(`Archived ${membershipsToArchive.length} memberships for ${yearToArchive}`);
    }

    // Archive checkins for previous year
    const checkinsToArchive = await Checkin.find({
      checkinTime: {
        $gte: new Date(`${yearToArchive}-01-01`),
        $lte: new Date(`${yearToArchive}-12-31T23:59:59.999Z`),
      },
    }).lean();

    if (checkinsToArchive.length) {
      await Archive.create({
        year: yearToArchive,
        type: "checkin",
        data: checkinsToArchive,
      });
      console.log(`Archived ${checkinsToArchive.length} checkins for ${yearToArchive}`);
    }

    // notify admins (first admin found) - non-blocking
    const admin = await User.findOne({ role: "admin" });
    if (admin && admin.email) {
      try {
        await sendEmail(
          admin.email,
          `Archive completed for ${yearToArchive}`,
          `<p>Archived memberships: ${membershipsToArchive.length}<br/>Archived checkins: ${checkinsToArchive.length}</p>`
        );
      } catch (e) {
        console.error("Failed sending archive notification:", e);
      }
    }
  } catch (error) {
    console.error("Archiver job error:", error);
  }
});
