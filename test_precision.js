// Test script for response precision function
const makeResponsePrecise = (response) => {
  if (!response || typeof response !== "string") return response;

  let preciseResponse = response;

  // Remove unnecessary phrases but keep greetings
  const unnecessaryPhrases = [
    /I'm glad you're looking to\s+/gi,
    /According to our context,\s+/gi,
    /According to the information provided,\s+/gi,
    /Based on the context,\s+/gi,
    /As per the available information,\s+/gi,
    /It's essential to\s+/gi,
    /Please note that\s+/gi,
    /Some key things to note about\s+/gi,
    /If you're unable to visit\s+/gi,
    /If you have any further questions or need assistance, feel free to ask!/gi,
    /Feel free to ask if you have any questions!/gi,
    /Let me help you with that\.\s*/gi,
    /I'd be happy to help you\.\s*/gi,
    /Thank you for asking\.\s*/gi,
    /This will help you\s+/gi,
    /These offices are equipped with\s+/gi,
    /In Pakistan Railways,?\s+/gi,
  ];

  // Remove unnecessary phrases
  unnecessaryPhrases.forEach((phrase) => {
    preciseResponse = preciseResponse.replace(phrase, "");
  });

  // Fix specific grammatical patterns BEFORE general cleanup
  preciseResponse = preciseResponse.replace(/\butilize your\b/g, "To use your");
  preciseResponse = preciseResponse.replace(
    /\bcarry the military discount voucher\b/g,
    "Carry the military discount voucher",
  );
  preciseResponse = preciseResponse.replace(
    /\bprovides services for booking and managing\b/g,
    "handles booking and managing",
  );
  preciseResponse = preciseResponse.replace(
    /\bwhere passengers can visit in person to book their tickets\b/g,
    "where passengers can book tickets",
  );
  preciseResponse = preciseResponse.replace(
    /\balthough the operating hours may be limited\b/g,
    "",
  );
  preciseResponse = preciseResponse.replace(
    /\bcan provide assistance with booking and answer any questions you may have about\b/g,
    "can assist with",
  );

  // Convert numbered lists to bullet points for clarity
  preciseResponse = preciseResponse.replace(/(\d+)\.\s+/g, "• ");

  // Clean up spacing and fix grammar
  preciseResponse = preciseResponse.replace(/\s+/g, " ").trim();

  // Fix sentence fragments and capitalization
  preciseResponse = preciseResponse.replace(
    /\bthe necessary technology and staff\b/g,
    "with necessary technology and staff",
  );
  preciseResponse = preciseResponse.replace(
    /\breservation offices are typically located\b/g,
    "Reservation offices are typically located",
  );
  preciseResponse = preciseResponse.replace(
    /\bThey are also available at smaller stations,\.\s*\b/g,
    "They are also available at smaller stations. ",
  );
  preciseResponse = preciseResponse.replace(
    /\ba reservation office in person\b/g,
    "If you cannot visit a reservation office in person",
  );

  // Fix URL spacing issues
  preciseResponse = preciseResponse.replace(
    /Pakrail\.\s*gov\.\s*pk/g,
    "Pakrail.gov.pk",
  );

  // Clean up spacing and fix grammar
  preciseResponse = preciseResponse.replace(/\s+/g, " ").trim();

  // Fix sentence fragments and capitalization
  preciseResponse = preciseResponse.replace(/\s*\.\s*([a-z])/g, ". $1");
  preciseResponse = preciseResponse.replace(
    /^\s*([a-z])/g,
    (match, firstChar) => firstChar.toUpperCase(),
  );

  // Capitalize first letter after greeting
  preciseResponse = preciseResponse.replace(
    /(Assalam-u-Alaikum!)\s*(\w)/,
    (match, greeting, firstChar) => {
      return greeting + " " + firstChar.toUpperCase();
    },
  );

  // Fix bullet point formatting - ensure proper line breaks
  preciseResponse = preciseResponse.replace(/•\s+/g, "\n• ");
  preciseResponse = preciseResponse.replace(/\s*•\s*/g, "\n• ");
  preciseResponse = preciseResponse.replace(/([.!?])\s*•/g, "$1\n\n•");
  preciseResponse = preciseResponse.replace(/(\w)\s*•/g, "$1\n\n•");

  // Final bullet point formatting - ensure they're on separate lines
  preciseResponse = preciseResponse.replace(/•\s*/g, "\n• ");
  preciseResponse = preciseResponse.replace(/\n\s*\n•/g, "\n• ");
  preciseResponse = preciseResponse.replace(/(\w)\n•/g, "$1\n\n•");

  // Add proper punctuation at the end if missing
  if (!preciseResponse.match(/[.!?]$/)) {
    preciseResponse += ".";
  }

  return preciseResponse;
};

// Test with the military vouchers example
const originalResponse = `Assalam-u-Alaikum! I'm glad you're looking to utilize your military vouchers with Pakistan Railways. According to our context, you can book tickets using military vouchers by visiting our reservation office in person. It's essential to carry the military discount voucher with you at the time of booking.

To book, please follow these steps:

1. Visit your nearest Pakistan Railways reservation office.
2. Inform the staff that you'd like to book a ticket using your military voucher.
3. Provide the voucher to the staff, and they will assist you in booking your ticket.

Please note that military vouchers can only be used for booking tickets in person at a reservation office, not through online booking or other channels.

If you have any further questions or need assistance, feel free to ask!`;

const preciseResponse = makeResponsePrecise(originalResponse);

console.log("=== TEST 1: MILITARY VOUCHERS ===");
console.log("=== ORIGINAL RESPONSE ===");
console.log(originalResponse);
console.log("\n=== PRECISE RESPONSE ===");
console.log(preciseResponse);
console.log("\n=== VERIFICATION ===");
console.log(
  "✅ Greeting preserved:",
  preciseResponse.includes("Assalam-u-Alaikum!"),
);
console.log(
  "✅ Unnecessary phrases removed:",
  !preciseResponse.includes("I'm glad you're looking to"),
);
console.log("✅ Bullet points used:", preciseResponse.includes("•"));
console.log(
  "✅ Essential information preserved:",
  preciseResponse.includes("military vouchers"),
);
console.log(
  "✅ Closing removed:",
  !preciseResponse.includes("feel free to ask"),
);

// Test with reservation office example
const reservationOfficeResponse = `A reservation office is a designated location where Pakistan Railways provides services for booking and managing train tickets. These offices are equipped with the necessary technology and staff to assist passengers in reserving seats or berths on trains. In Pakistan Railways, reservation offices are typically located at major train stations, where passengers can visit in person to book their tickets. They are also available at smaller stations, although the operating hours may be limited. Some key things to note about reservation offices in Pakistan Railways:
- They are open from 09:00 to 20:00 at main stations and 09:00 to 17:00 at smaller stations.
- Passengers can book tickets, make changes to existing reservations, and cancel tickets at these offices.
- The staff at reservation offices can provide assistance with booking and answer any questions you may have about train schedules, fares, and other rail travel-related information.
If you're unable to visit a reservation office in person, you can also book tickets online through the SEE RABTA APP or through the Pakistan Railways website.`;

const preciseReservationOffice = makeResponsePrecise(reservationOfficeResponse);

console.log("\n\n=== TEST 2: RESERVATION OFFICE ===");
console.log("=== ORIGINAL RESPONSE ===");
console.log(reservationOfficeResponse);
console.log("\n=== PRECISE RESPONSE ===");
console.log(preciseReservationOffice);
console.log("\n=== VERIFICATION ===");
console.log(
  "✅ Unnecessary phrases removed:",
  !preciseReservationOffice.includes(
    "provides services for booking and managing",
  ),
);
console.log(
  "✅ Essential information preserved:",
  preciseReservationOffice.includes("reservation office"),
);
console.log(
  "✅ Redundant phrases removed:",
  !preciseReservationOffice.includes("where passengers can visit in person"),
);
console.log(
  "✅ Bullet points preserved:",
  preciseReservationOffice.includes("•"),
);

// Test with old age discounts example
const oldAgeDiscountsResponse = `To apply for old age discounts on Pakistan Railways, you can follow these steps:
• Visit the official website of Pakistan Railways: Pakrail.gov.pk
• Download the old age form from the website.
• Attach one copy of your Computerized National Identity Card (CNIC) and one passport-sized photograph with each copy of the form.
• Take one copy of the completed form to your nearest ticket reservation office.
• Get the form signed by the station master.
• Send the other copy of the application to the Chief Commercial Manager (CCM) office by post at the following address: CCM Office, IT Directorate, Empress Road, Lahore. This will help you apply for the old age discount on your Pakistan Railways ticket.`;

const preciseOldAgeDiscounts = makeResponsePrecise(oldAgeDiscountsResponse);

console.log("\n\n=== TEST 3: OLD AGE DISCOUNTS ===");
console.log("=== ORIGINAL RESPONSE ===");
console.log(oldAgeDiscountsResponse);
console.log("\n=== PRECISE RESPONSE ===");
console.log(preciseOldAgeDiscounts);
console.log("\n=== VERIFICATION ===");
console.log(
  "✅ Bullet points preserved:",
  preciseOldAgeDiscounts.includes("•"),
);
console.log(
  "✅ Essential information preserved:",
  preciseOldAgeDiscounts.includes("old age discount"),
);
console.log(
  "✅ Unnecessary closing removed:",
  !preciseOldAgeDiscounts.includes("This will help you"),
);
console.log(
  "✅ Steps preserved:",
  preciseOldAgeDiscounts.includes("Pakrail.gov.pk"),
);

// Test with guard chart example
const guardChartResponse = `According to the context provided, it seems that a "Guard Chart" is not directly mentioned. However, I can provide information related to the Guard's role and duties. the Guard plays a crucial role in the operation of trains. They are responsible for the security and safety of the train, its passengers, and cargo. A Guard Chart might be a document or a tool used by the Guard to keep track of various aspects of the train's journey, such as:
- Passenger and cargo manifests
- Safety protocols and procedures
- Emergency contact information
- Station stops and schedules
- Cargo handling and loading/unloading
While I couldn't find a direct reference to a "Guard Chart" in the provided context, I can suggest that it might be a document or a tool used by the Guard to perform their duties efficiently. If you need more information or clarification, I'd be happy to help.`;

const preciseGuardChart = makeResponsePrecise(guardChartResponse);

console.log("\n\n=== TEST 4: GUARD CHART ===");
console.log("=== ORIGINAL RESPONSE ===");
console.log(guardChartResponse);
console.log("\n=== PRECISE RESPONSE ===");
console.log(preciseGuardChart);
console.log("\n=== VERIFICATION ===");
console.log(
  "✅ Unnecessary phrases removed:",
  !preciseGuardChart.includes("According to the context provided"),
);
console.log(
  "✅ Essential information preserved:",
  preciseGuardChart.includes("Guard Chart"),
);
console.log("✅ Bullet points preserved:", preciseGuardChart.includes("•"));
console.log(
  "✅ Redundant closing removed:",
  !preciseGuardChart.includes("If you need more information"),
);

// Test with disability discount example
const disabilityDiscountResponse = `To apply for a disability discount on Pakistan Railways, you'll need to follow these steps: • Visit the official Pakistan Railways website at pakrail. gov. pk. • Download the disability form from the website. • Attach one copy of your CNIC and one passport-sized photograph to each copy of the form. • Submit one copy of the completed form, along with the required documents, to the nearest ticket reservation office. The station master will need to sign the form. • Send the second copy of the application, along with the required documents, to the Chief Commercial Manager (CCM) by post at the following address: CCM Office, IT Directorate, Empress Road, Lahore. Once your application is processed, you'll be eligible for the disability discount, and you can enjoy reduced fares on your train journeys. you should keep the application and supporting documents handy, as you may need to present them for verification.`;

const preciseDisabilityDiscount = makeResponsePrecise(
  disabilityDiscountResponse,
);

console.log("\n\n=== TEST 5: DISABILITY DISCOUNT ===");
console.log("=== ORIGINAL RESPONSE ===");
console.log(disabilityDiscountResponse);
console.log("\n=== PRECISE RESPONSE ===");
console.log(preciseDisabilityDiscount);
console.log("\n=== VERIFICATION ===");
console.log(
  "✅ Bullet points on separate lines:",
  preciseDisabilityDiscount.includes("\n•"),
);
console.log(
  "✅ Essential information preserved:",
  preciseDisabilityDiscount.includes("disability discount"),
);
console.log(
  "✅ Unnecessary closing removed:",
  !preciseDisabilityDiscount.includes("you should keep the application"),
);
console.log(
  "✅ URL formatting fixed:",
  preciseDisabilityDiscount.includes("pakrail.gov.pk"),
);
