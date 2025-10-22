const cron = require("node-cron");
const Membership = require("../models/Membership");
const Checkin = require("../models/Checkin");
const Archive = require("../models/Archive");
const sendEmail = require("../config/email");
const User = require("../models/User");

// Run at midnight every Jan 1
cron.schedule("0 0 1 1 *", async () => {
  const now = new Date();
  const lastYear = now.getFullYear() - 1;
  console.log(`Archiving data for year ${lastYear}...`);

  // Fetch data from last year
  const oldMemberships = await Membership.find({
    endDate: { $lte: new Date(`${lastYear}-12-31`) },
  });
  const oldCheckins = await Checkin.find({
    date: { $lte: new Date(`${lastYear}-12-31`) },
  });

  // Save to Archive
  if (oldMemberships.length > 0)
    await Archive.create({
      year: lastYear,
      type: "membership",
      data: oldMemberships,
    });

  if (oldCheckins.length > 0)
    await Archive.create({
      year: lastYear,
      type: "checkin",
      data: oldCheckins,
    });

  console.log(
    `Archived ${oldMemberships.length} memberships and ${oldCheckins.length} check-ins.`
  );

  // Email admins
  const admins = await User.find({ role: { $in: ["admin", "receptionist"] } });
  for (const admin of admins) {
    await sendEmail(
      admin.email,
      `InkedInLIFT Data Archived for ${lastYear}`,
      `<p>Data from ${lastYear} has been archived successfully.</p>
       <p>Memberships: ${oldMemberships.length}<br>
       Check-ins: ${oldCheckins.length}</p>`
    );
  }

  // Delete archives older than 2 years
  const twoYearsAgo = now.getFullYear() - 2;
  await Archive.deleteMany({ year: { $lte: twoYearsAgo } });
  console.log(`🧹 Old archives (<=${twoYearsAgo}) deleted.`);
});
