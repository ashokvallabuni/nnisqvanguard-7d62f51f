import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cbyoozhtubavksiolgxz.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNieW9vemh0dWJhdmtzaW9sZ3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MTI0MDAsImV4cCI6MjEwMDM4ODQwMH0.-6D2ECGXcXmPakY-ATRfKOvr2SKnMgAagu3E9Aft1T0";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNieW9vemh0dWJhdmtzaW9sZ3h6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgxMjQwMCwiZXhwIjoyMTAwMzg4NDAwfQ.GlcmJk1guLMRlumcK28nkIeKS_Vn9eR2Lyud2qswJDg";

const supabaseAnon = createClient(supabaseUrl, anonKey);
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function testBookingAndColleges() {
  console.log("=== Testing College Dropdown & Appointment / Program Booking ===");

  // 1. Test College Dropdown Queries
  console.log("\n[Test 1: College Dropdown Data]");
  const { data: allColleges, error: colErr } = await supabaseAnon
    .from("colleges")
    .select("id, name, city, state, type")
    .order("name")
    .limit(10);

  if (colErr) throw new Error("Colleges query failed: " + colErr.message);
  console.log(`  Fetched ${allColleges.length} colleges successfully. Samples:`);
  allColleges.slice(0, 3).forEach((c) => console.log(`    - ${c.name} (${c.city || c.state || "India"}) [ID: ${c.id}]`));

  // Search filter test (e.g. 'IIT' or 'Institute')
  const searchQuery = "Technology";
  const { data: searchResults } = await supabaseAnon
    .from("colleges")
    .select("id, name")
    .ilike("name", `%${searchQuery}%`)
    .limit(5);

  console.log(`  Search for '${searchQuery}' returned ${searchResults?.length} matches:`, searchResults?.map(c => c.name));

  const targetCollege = allColleges[0];

  // 2. Test Booking Submission
  console.log("\n[Test 2: Submitting Program / Workshop Booking]");
  const bookingPayload = {
    college_id: targetCollege.id,
    contact_person: "Dean of Academic Affairs",
    email: "dean.academics@college.edu.in",
    phone: "+91 9988776655",
    program_type: "Cybersecurity Workshop",
    topic: "Defensive Operations & SOC Architecture Hands-on Workshop",
    preferred_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    status: "pending",
  };

  // Insert booking
  const { data: insertedBooking, error: bErr } = await supabaseAdmin
    .from("bookings")
    .insert(bookingPayload)
    .select("id, contact_person, email, program_type, topic, status, created_at")
    .single();

  if (bErr) {
    console.error("Booking insert failed:", bErr.message);
    throw bErr;
  }
  console.log(`  Booking submitted successfully! Booking ID: ${insertedBooking.id}`);
  console.log(`  Topic: "${insertedBooking.topic}", Status: ${insertedBooking.status}`);

  // 3. Admin Verification
  console.log("\n[Test 3: Admin Bookings Review Query]");
  const { data: adminList } = await supabaseAdmin
    .from("bookings")
    .select("id, contact_person, email, topic, status, college_id, colleges(name)")
    .order("created_at", { ascending: false })
    .limit(3);

  console.log(`  Admin verified ${adminList?.length} recent bookings in Supabase:`);
  adminList?.forEach((b) => console.log(`    - [${b.status.toUpperCase()}] ${b.contact_person} (${b.email}): "${b.topic}" at ${b.colleges?.name || "Independent Organization"}`));

  console.log("\n=== College Dropdown & Appointment Booking Passed Successfully ===");
}

testBookingAndColleges().catch(console.error);
