import pool from "./db.js";

async function fetchUsers() {
  try {
    const res = await pool.query("SELECT * FROM bruker;");
    console.log("Users:", res.rows);
  } catch (err) {
    console.error("Error querying users:", err);
  }
}

async function fetchGroups() {
  try {
    const res = await pool.query("SELECT * FROM gruppe;");
    console.log("Groups:", res.rows);
  } catch (err) {
    console.error("Error querying groups:", err);
  }
}

async function fetchEvents() {
  try {
    const res = await pool.query("SELECT * FROM arrangement;");
    console.log("Events:", res.rows);
  } catch (err) {
    console.error("Error querying events:", err);
  }
}

async function fetchAttendance() {
  try {
    const res = await pool.query("SELECT * FROM deltakelse;");
    console.log("Attendance:", res.rows);
  } catch (err) {
    console.error("Error querying attendance:", err);
  }
}

async function main() {
  await fetchUsers();
  // await fetchGroups();
  // await fetchEvents();
  // await fetchAttendance();
  pool.end(); // Close the connection pool
}

main();
