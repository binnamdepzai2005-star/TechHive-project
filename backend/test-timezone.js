const db = require("./config/database");

async function testTimezone() {
  console.log("\n" + "=".repeat(60));
  console.log("🌏 TIMEZONE TEST - Múi Giờ Việt Nam (GMT+7)");
  console.log("=".repeat(60) + "\n");

  try {
    // Test 1: Check MySQL timezone settings
    console.log("📍 Test 1: MySQL Timezone Settings");
    const [timezone] = await db.query(
      "SELECT @@session.time_zone as session_tz, @@global.time_zone as global_tz"
    );
    console.log("   Session Timezone:", timezone[0].session_tz);
    console.log("   Global Timezone:", timezone[0].global_tz);

    // Test 2: Compare times
    console.log("\n⏰ Test 2: Current Time Comparison");
    const [mysqlTime] = await db.query("SELECT NOW() as current_time");
    const nodeTime = new Date();

    console.log("   MySQL NOW():", mysqlTime[0].current_time);
    console.log("   Node.js Date:", nodeTime.toISOString());
    console.log(
      "   Vietnam Time:",
      nodeTime.toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );

    // Test 3: Insert and retrieve with timezone
    console.log("\n💾 Test 3: Insert & Retrieve Test");
    await db.query(
      "CREATE TEMPORARY TABLE test_timezone (id INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
    );
    await db.query("INSERT INTO test_timezone (id) VALUES (1)");
    const [result] = await db.query("SELECT * FROM test_timezone");

    console.log("   Saved Time (Raw):", result[0].created_at);
    console.log(
      "   Saved Time (Vietnam):",
      new Date(result[0].created_at).toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
      })
    );

    // Test 4: Check existing reviews
    console.log("\n📝 Test 4: Check Existing Reviews");
    const [reviews] = await db.query(
      "SELECT id, user_name, created_at FROM reviews ORDER BY id DESC LIMIT 3"
    );

    if (reviews.length > 0) {
      reviews.forEach((review) => {
        console.log(`   Review #${review.id} by ${review.user_name}:`);
        console.log(`      Raw: ${review.created_at}`);
        console.log(
          `      Vietnam: ${new Date(review.created_at).toLocaleString(
            "vi-VN",
            { timeZone: "Asia/Ho_Chi_Minh" }
          )}`
        );
      });
    } else {
      console.log("   No reviews found. Run schema.sql to insert sample data.");
    }

    // Final verdict
    console.log("\n" + "=".repeat(60));
    const mysqlTz = timezone[0].session_tz;
    if (mysqlTz === "+07:00" || mysqlTz === "Asia/Ho_Chi_Minh") {
      console.log("✅ TIMEZONE CONFIGURED CORRECTLY!");
      console.log("   All timestamps will use Vietnam timezone (GMT+7)");
    } else {
      console.log("⚠️  WARNING: Timezone may not be set correctly!");
      console.log(
        "   Expected: +07:00 or Asia/Ho_Chi_Minh, Got:",
        mysqlTz || "SYSTEM"
      );
      console.log(
        "\n   📖 Please read TIMEZONE_CONFIGURATION.md for setup instructions."
      );
    }
    console.log("=".repeat(60) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Test Error:", error.message);
    console.log(
      "\n💡 Tip: Make sure MySQL is running and database is set up correctly."
    );
    console.log("   Run: mysql -u root -p < database/schema.sql\n");
    process.exit(1);
  }
}

// Run test
testTimezone();
