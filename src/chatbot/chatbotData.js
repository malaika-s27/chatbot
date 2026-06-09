// ─────────────────────────────────────────────
//  MAIN MENU ITEMS
// ─────────────────────────────────────────────
export const MAIN_MENU = [
  { id: "tickets", icon: "🎫", label: "Tickets & Booking" },
  { id: "refunds", icon: "💰", label: "Refunds & Cancellations" },
  { id: "services", icon: "🎯", label: "Services & Information" },
  { id: "discounts", icon: "🎫", label: "Discounts & Concessions" },
  { id: "account", icon: "👤", label: "My Account" },
  { id: "helpline", icon: "📞", label: "Contact & Helpline" },
];

// ─────────────────────────────────────────────
//  SUBMENUS  (null = handled directly, no submenu)
// ─────────────────────────────────────────────
export const SUBMENU = {
  tickets: [
    { id: "book_online", label: "How to book online?" },
    { id: "half_fare", label: "Half fare eligibility" },
    { id: "cnic_req", label: "CNIC requirement" },
    { id: "economy_ac", label: "Economy vs AC seats" },
  ],
  refunds: [
    { id: "eticket_refund", label: "E-Ticket refund policy" },
    { id: "paper_refund", label: "Paper ticket refund" },
    { id: "train_cancelled", label: "Train cancelled / 6hr delay" },
    { id: "easypaisa_refund", label: "Easypaisa / Rabta refund" },
    { id: "guard_chart", label: "What is Guard Chart?" },
  ],
  services: [
    { id: "mis_transaction", label: "Mis-transaction refund" },
    { id: "attock_safari", label: "Attock Safari Train" },
    { id: "train_status", label: "Train Status & Delays" },
    { id: "schedule_info", label: "Schedule Information" },
  ],
  discounts: [
    { id: "old_age", label: "Old Age Discount" },
    { id: "disability", label: "Disability Discount" },
    { id: "student", label: "Student Concession" },
    { id: "tourist", label: "International Tourist Discount" },
    { id: "military_voucher", label: "Military Voucher Booking" },
  ],
  account: [
    { id: "create_account", label: "Create new account" },
    { id: "verify_account", label: "Verification issues" },
    { id: "change_contact", label: "Change mobile / email" },
  ],
  helpline: null,
};

// ─────────────────────────────────────────────
//  BOT RESPONSES  (keyed by submenu item id)
//  Each entry: { text: string, helpline?: bool }
// ─────────────────────────────────────────────
export const RESPONSES = {
  eticket_refund: {
    text: `Here's e-ticket refund policy:\n\n• Before 48 hrs of departure → 10% deducted\n• 24–48 hrs before → 20% deducted\n• Within 24 hrs → 30% deducted\n• Less than 2 hrs or after guard chart → No cancellation possible\n\nRefund goes back via the same payment method used (e.g. Easypaisa → Easypaisa).`,
  },
  mis_transaction: {
    text: `For mis-transaction refund issues:\n\n🔍 If your transaction failed but amount was deducted:\n• Refund is processed within 7 working days\n• Refund goes back to the original payment method used\n• If paid via Easypaisa → refund goes to your Easypaisa account\n• If paid via JazzCash → refund goes to your JazzCash account\n\n⚠️ If you don't receive refund within 7 days:\n• Contact: info@pakrail.gov.pk with transaction details\n• Call our helpline: 117 for immediate assistance\n\nPlease provide:\n• Transaction ID\n• Date and time of transaction\n• Amount deducted\n• Payment method used`,
    helpline: false,
  },
  old_age: {
    text: `Old Age Discount Application:\n\n👴 Eligibility:\n• Citizens aged 65 years and above\n• Available on selected trains only\n• Not applicable on Economy class (varies by train)\n\n📄 Application Process:\n1. Download Old Age concession form from pakrail.gov.pk\n2. Fill out the form completely\n3. Attach 1 copy of CNIC\n4. Attach 1 passport-size photograph\n5. Submit to the nearest reservation office\n6. Get signature from Station Master\n7. Send one copy to CCM Office, Lahore by post\n\n📧 Mailing Address:\nCCM Office\nIT Directorate\nEmpress Road\nLahore\n\n⏰ Processing Time:\n• Application approval may take 2-3 weeks\n• Approved discount will be added to your profile\n• You can verify status by calling helpline at 117\n\nFor faster processing, ensure all documents are complete and photographs are clear.`,
    helpline: false,
  },
  disability: {
    text: `Disability Discount Application:\n\n♿ Eligibility:\n• Persons with verified disabilities\n• Requires medical certificate from recognized hospital\n• Available on all train classes\n\n📄 Application Process:\n1. Download Disability concession form from pakrail.gov.pk\n2. Fill out the form completely\n3. Attach medical certificate\n4. Attach 1 copy of CNIC\n5. Attach 1 passport-size photograph\n6. Submit to the nearest reservation office\n7. Get signature from Station Master\n8. Send one copy to CCM Office, Lahore by post\n\n📧 Mailing Address:\nCCM Office\nIT Directorate\nEmpress Road\nLahore\n\n⚕ Required Documents:\n• Medical certificate (must be recent)\n• CNIC copy\n• Passport-size photograph\n• Disability card (if available)\n\n📞 For Assistance:\nCall our helpline at 117 for application status or any queries about disability concessions.`,
    helpline: false,
  },
  student: {
    text: `Student Concession Application:\n\n🎓 Eligibility:\n• Local students with valid student ID\n• 50% concession on fare\n• Available on all train classes\n\n📄 Application Process:\n1. Download Student concession form from pakrail.gov.pk\n2. Get form attested from educational institution\n3. Attach student ID card copy\n4. Attach 1 copy of CNIC\n5. Attach 1 passport-size photograph\n6. Submit to the nearest reservation office\n7. Get signature from Station Master\n8. Send one copy to CCM Office, Lahore by post\n\n📧 Mailing Address:\nCCM Office\nIT Directorate\nEmpress Road\nLahore\n\n⚠️ Important Notes:\n• Concession is for local students only\n• Foreign students get 25% discount\n• Student ID must be valid during travel\n• Re-apply annually for concession renewal\n\nFor student concession queries, contact our helpline at 117.`,
    helpline: false,
  },
  tourist: {
    text: `International Tourist Discount:\n\n🌍 Eligibility:\n• Foreign tourists with valid passport\n• 25% concession on rail fares\n• Available on all train classes\n\n📄 Booking Process:\n1. Visit any reservation office\n2. Present valid passport and visa\n3. Pay applicable fare after 25% discount\n4. Collect ticket and travel\n\n⚠️ Important Notes:\n• Discount applies to foreign tourists only\n• Valid passport must be presented during travel\n• Not available for online booking\n• Cannot be combined with other discounts\n\nFor tourist information and booking assistance, contact our helpline at 117.`,
    helpline: false,
  },
  military_voucher: {
    text: `Military Voucher Booking Procedure:\n\n📋 Requirements:\n• Valid military discount voucher must be presented\n• Person carrying voucher must travel (non-transferable)\n• Booking must be made at reservation counter (not online)\n\n🎫 Booking Steps:\n1. Visit any reservation office\n2. Present military discount voucher\n3. Provide CNIC and travel details\n4. Pay remaining fare (if any) after discount\n\n⚠️ Important Notes:\n• Military vouchers cannot be used for online booking\n• Voucher must be valid and not expired\n• Carry original voucher during journey\n• For group bookings, each person needs separate voucher\n\nFor assistance with military bookings, contact our helpline at 117.`,
    helpline: false,
  },
  paper_refund: {
    text: `Paper ticket refund rules:\n\n• Before 48 hrs → 10% deducted\n• 24–48 hrs before → 20% deducted\n• Within 24 hrs → 30% deducted\n• After guard chart production → 30% refund given\n• Within 3 hrs after departure → 50% refund\n• Train cancelled → Full refund\n\nVisit any nearest reservation center with your CNIC photocopy.`,
  },
  train_cancelled: {
    text: `If your train is cancelled or delayed by more than 6 hours:\n\n✅ No deductions apply\n\nYou need to:\n1. Get the Station Master's signature on a written application\n2. Send it to the CCM Office for approval\n3. Refund will be processed via original payment method\n\nFor coach damage/unavailability, get a certificate from Station Master and send a written request to CCM Office Lahore.`,
  },
  easypaisa_refund: {
    text: `For Easypaisa / Rabta refund issues:\n\n• Refunds are processed via the same payment method used at booking\n• If paid via Easypaisa → refund goes back to your Easypaisa account\n• For pending refunds, contact: info@pakrail.gov.pk\n\nIf no response within 48 hrs, please call our helpline at 117 for escalation.`,
    helpline: false,
  },
  guard_chart: {
    text: `A Guard Chart is a printed list of all reserved passengers, produced before train departure.\n\n• Usually produced 2 hours before departure\n• At remote stations, it may be produced the previous night\n\nExample: Shalimar Express departs at 6:00 AM → Guard chart produced at 8:00 PM the night before. After this time, online cancellation is not possible.`,
  },
  half_fare: {
    text: `Half fare applies to:\n\n👶 Children aged 3 to 10 years\n👴 Senior citizens aged 65 and above (in selected trains only)\n\nNote: Economy class does NOT have a senior citizen concession on all trains. Always verify at booking.`,
  },
  create_account: {
    text: `To create a Pakistan Railways account:\n\n1. Provide your real CNIC number\n2. Enter your mobile number and email\n3. Verify via SMS and email link (both required)\n4. Verification link/SMS can be resent up to 3 times\n\n⚠️ After 3 failed attempts, your phone and email are permanently blocked for registration.`,
  },
  verify_account: {
    text: `If you did not receive the verification SMS or email:\n\n• You can request resend up to 3 times\n• Check your spam/junk folder for the email\n• Make sure your mobile number is active\n\n⚠️ After 3 failed attempts, the phone number and email are permanently blocked. Contact helpline at 117 for unblocking.`,
    helpline: false,
  },
  change_contact: {
    text: `You can change your mobile number or email only BEFORE verification is complete.\n\nOnce both email and mobile are verified, you cannot change them.\n\nIf you need help, contact our support helpline at 117.`,
    helpline: false,
  },
  economy_ac: {
    text: `Seat reservation rules:\n\n🪑 Economy class: Seats reserved from originating quota station to passenger's ending station\n\n❄️ AC class (except Green Line): Reserved from passenger's boarding station to destination\n\n🟢 Green Line: Quota-based fare — see "Green Line fare rules" for details.`,
  },
  attock_safari: {
    text: `Attock Safari Train details are not available in our current knowledge base.\n\nFor the latest schedule, route, and facilities of Attock Safari Train, please contact our helpline at 117 or visit the official Pakistan Railways website.`,
    helpline: false,
  },
  cnic_req: {
    text: `CNIC is required at multiple points:\n\n• During registration: provide your real CNIC number\n• During refund: show original CNIC (e-ticket) or photocopy (paper ticket)\n• The ticket is personal and non-transferable — only the person named on the ticket may travel.`,
  },
  book_online: {
    text: `You can book tickets online via:\n\n Pakistan Railways official website: https://www.pakrailways.gov.pk/buy\n Rabta app\n Easypaisa (for payment)\n\nCreate a personal account first. Commercial use of personal accounts is strictly prohibited and will result in permanent blocking.`,
  },
  train_status: {
    text: `For live train tracking and status updates:\n\nDownload official Pakistan Railways Tracking mobile app "Track My Train" App\nHelpline: 117 (available 24/7)`,
    helpline: false,
  },
  schedule_info: {
    text: `For detailed train schedules and timetables:\n\n Pakistan Railways Website: https://www.pakrailways.gov.pk/train\n Mobile App: "RABTA"\n Helpline: 117 (available 24/7)\n\nYou can check specific train schedules, departure times, and route information on the official website and RABTA app.`,
    helpline: false,
  },
  refund_combined: {
    text:
      `I can help with refunds. Which type of ticket do you have?\n\n` +
      `E-Ticket (booked online via Rabta / Easypaisa / website)\n` +
      `Paper Ticket (booked at a reservation counter)\n\n` +
      `Reply with "eticket refund" or "paper ticket refund"`,
    // buttons to show
  },
};

// ─────────────────────────────────────────────
//  SPECIAL MESSAGES  (not in submenu flow)
// ─────────────────────────────────────────────
export const REAL_TIME_MSG = {
  text: `For real-time train tracking and live updates:\n\n🌐 **Pakistan Railways Website**: https://www.pakrailways.gov.pk/train\n📱 **Mobile App**: Download official Pakistan Railways app\n📞 **Helpline**: 117 (available 24/7)\n\nFor specific train status and live tracking, please use the official website or mobile app.`,
};

export const HELPLINE_FULL = {
  text: `Pakistan Railways Helpline:\n📧 info@pakrail.gov.pk\n🌐 www.pakrail.gov.pk\n\nFor complaints about staff or reservation offices, please visit your nearest Divisional Commercial Officer.`,
};

export const FALLBACK_MSG = {
  text: `I'm not sure about that. Please use the menu below or contact our helpline for assistance.`,
  helpline: true,
};

// ─────────────────────────────────────────────
//  KEYWORD → RESPONSE MAP  (for free-text input)
// ─────────────────────────────────────────────
// export const KEYWORD_RULES = [
//   { keywords: ["easypaisa", "rabta"], responseId: "easypaisa_refund" },
//   { keywords: ["guard chart", "guard"], responseId: "guard_chart" },
//   { keywords: ["delay", "late", "location", "live"], special: "realtime" },
//   {
//     keywords: ["refund", "cancel"],
//     responseId: "eticket_refund",
//   },
//   {
//     keywords: ["half fare", "senior", "kid", "child"],
//     responseId: "half_fare",
//   },
//   { keywords: ["account", "register"], responseId: "create_account" },
//   { keywords: ["cnic"], responseId: "cnic_req" },
//   { keywords: ["green line"], responseId: "green_line" },
//   { keywords: ["paper ticket", "refund"], responseId: "paper_refund" },
//   { keywords: ["shalimar"], responseId: "shalimar" },
//   { keywords: ["attock", "safari"], responseId: "attock_safari" },
// ];
export const KEYWORD_RULES = [
  // HIGH priority — specific enough to answer directly
  {
    keywords: ["easypaisa", "rabta"],
    responseId: "easypaisa_refund",
    priority: "high",
  },
  {
    keywords: ["guard chart", "guard"],
    responseId: "guard_chart",
    priority: "high",
  },
  {
    keywords: ["e-ticket", "eticket", "online ticket"],
    responseId: "eticket_refund",
    priority: "high",
  },
  {
    keywords: ["paper ticket", "counter ticket", "reservation center"],
    responseId: "paper_refund",
    priority: "high",
  },
  {
    keywords: ["half fare", "senior", "kid", "child"],
    responseId: "half_fare",
    priority: "high",
  },
  {
    keywords: ["account", "register"],
    responseId: "create_account",
    priority: "high",
  },
  { keywords: ["cnic"], responseId: "cnic_req", priority: "high" },
  {
    keywords: ["attock", "safari"],
    responseId: "attock_safari",
    priority: "high",
  },
  {
    keywords: ["delay", "late", "location", "live"],
    special: "realtime",
    priority: "high",
  },
  {
    keywords: [
      "mis transaction",
      "failed transaction",
      "deducted",
      "refund issue",
    ],
    responseId: "mis_transaction",
    priority: "high",
  },
  {
    keywords: [
      "discount",
      "concession",
      "old age",
      "senior citizen",
      "disability",
      "student",
      "tourist",
    ],
    responseId: "discounts",
    priority: "high",
  },
  {
    keywords: ["military", "army", "forces", "voucher"],
    responseId: "military_voucher",
    priority: "high",
  },

  // LOW priority — generic, only used if nothing high-priority matched
  {
    keywords: ["refund", "cancel"],
    responseId: "refund_combined",
    priority: "low",
  },
];
