// import fetch from "node-fetch";

// export const sendPhoneOTP = async (phone, otp, retry = 0) => {
//   const apiKey = process.env.BULKSMS_API_KEY;
//   const sender = process.env.BULKSMS_SENDER_ID;

//   const msg = `Your OTP code is ${otp}. It will expire in 15 minutes.`;

//   try {
//     const res = await fetch(`${process.env.BULKSMS_URL}`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         api_key: apiKey,
//         senderid: sender,
//         number: phone,
//         message: msg,
//       }),
//     });

//     if (!res.ok && retry < 3) {
//       // retry 3 times
//       return sendPhoneOTP(phone, otp, retry + 1);
//     }

//     if (!res.ok) throw new Error("Failed to send SMS");

//   } catch (err) {
//     console.error("sendPhoneOTP error:", err);
//     throw err;
//   }
// };




import fetch from "node-fetch";

export const sendPhoneOTP = async (phone, otp, retry = 0) => {
  const apiKey = process.env.BULKSMS_API_KEY;
  const sender = process.env.BULKSMS_SENDER_ID || ""; // sender ID না থাকলে empty
  const smsUrl = process.env.BULKSMS_URL;

  const msg = `Your OTP code is ${otp}. It will expire in 15 minutes.`;

  const body = {
    api_key: apiKey,
    number: phone,
    message: msg,
  };

  if (sender) body.senderid = sender;

  try {
    const res = await fetch(smsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(`SMS send failed (attempt ${retry + 1}):`, data);

      if (retry < 3) {
        // retry 3 times
        return sendPhoneOTP(phone, otp, retry + 1);
      }

      throw new Error(data.error || "Failed to send SMS after retries");
    }

    console.log("SMS sent successfully:", data);
    return data;
  } catch (err) {
    console.error("sendPhoneOTP error:", err);

    if (retry < 3) {
      return sendPhoneOTP(phone, otp, retry + 1);
    }

    throw err;
  }
};
