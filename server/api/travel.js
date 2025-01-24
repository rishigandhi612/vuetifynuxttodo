import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const apiKey = "AIzaSyB9xCBtNI_OF9Y9pp51oTpeAIvibZkVmA0";
const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};
const schema = {
  "tripName": "Travel itenary",
  "destination":"pune",
  "duration": "5 Days",
"originCity": "Pune (PNQ)",
"themes": [
"Culture",
"History",
"Food",
"City Exploration"
],"budget": "Mid-Range (Customizable)",
"travelDates": "Please Provide Dates for accurate pricing and availability",
"itineraryFocus": "Hanoi & Ha Long Bay",
"itinerary": {
"day": 1,
"title": "Arrival in Hanoi & Old Quarter Exploration",
"morning": {
"activity": "Flight from Pune (PNQ) to Hanoi (HAN) - Noi Bai International Airport. (Likely with a layover, often in Bangkok, Singapore or Kuala Lumpur). Airlines such as Thai Airways, Singapore Airlines, AirAsia, or Vietnam Airlines offer connecting flights.",
"duration": "Approximately 7-12 hours (including layover)",
"notes": "Factor in time zone differences. Vietnam is ahead of India. Check visa requirements."
},
"afternoon": {
"activity": "Arrival at Noi Bai International Airport (HAN). Transfer to your hotel in Hanoi's Old Quarter. Check-in.",
"duration": "1 hour",
"notes": "Pre-booked airport transfer is recommended."
},
"evening": {
"activity": "Explore Hanoi's Old Quarter on foot. Wander through the narrow streets, browse the shops, and soak in the atmosphere. Dinner at a local restaurant in the Old Quarter (try Pho or Bun Cha).",
"duration": "3-4 hours",
"notes": "Be aware of traffic. Enjoy the bustling street life."
}
},
};
const prompt =`create travel plan from pune to singapore for 5 days in json format
example:${schema}`



const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  systemInstruction:
    "you are travel agent. you can give me response related to the travel only.you always give me response be in json format.",
    generationConfig: {
      responseMimeType: "application/json",
      // responseSchema: schema,
    },
});


export default defineEventHandler(async (event) => {
  let res = await model.generateContent(prompt)

  return res.response?.text();
});
