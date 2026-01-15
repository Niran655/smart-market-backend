// import QRCode from "qrcode";
// import axios from "axios";
// // resolvers.js
// import BakongPayment from "../models/BakongPayment.js";
// export const bakongResolvers = {
//   Query: {
//     getBakongPayment: async (_, { reference }) => {
//       return await BakongPayment.findOne({ reference });
//     },
//   },
//   Mutation: {
//     createBakongPayment: async (_, { input }, { user }) => {
//       const { amount, billNumber } = input;
//       // 1️⃣ Call Bakong API to generate KHQR string
//       const token = process.env.BAKONG_TOKEN; // your token
//       const bakongid = process.env.BAKONG_MERCHANT_ID;
//       const response = await axios.post(
//         "https://sandbox.bakong.com.kh/api/khqr/create", // example endpoint
//         {
//           amount,
//           currency: "KHR",
//           merchantName: "My Shop",
//           billNumber,
//           bakongid,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       const { khqrString, reference } = response.data;
//       // 2️⃣ Generate QR image from string
//       const qrImage = await QRCode.toDataURL(khqrString);
//       // 3️⃣ Save to DB
//       const payment = await BakongPayment.create({
//         amount,
//         billNumber,
//         khqrString,
//         qrImage,
//         reference,
//         createdBy: user?._id,
//       });
//       return {
//         isSuccess: true,
//         message: "QR Payment created",
//         data: payment,
//       };
//     },
//     checkBakongPayment: async (_, { reference }) => {
//       const token = process.env.BAKONG_TOKEN;
//       // 1️⃣ Call Bakong API to check payment status
//       const response = await axios.get(
//         `https://sandbox.bakong.com.kh/api/khqr/check?reference=${reference}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       const { paid } = response.data;
//       // 2️⃣ Update DB
//       const payment = await BakongPayment.findOne({ reference });
//       if (!payment) throw new Error("Payment not found");
//       if (paid) {
//         payment.status = "paid";
//         payment.paidAt = new Date();
//         await payment.save();
//       }
//       return {
//         isSuccess: paid,
//         message: paid ? "Payment successful" : "Payment pending",
//         data: payment,
//       };
//     },
//   },
// };
// resolvers.js
import QRCode from "qrcode";

import BakongPayment from "../models/BakongPayment.js";

export const bakongResolvers = {
  Query: {
    getBakongPayment: async (_, { reference }) => {
      return await BakongPayment.findOne({ reference });
    },
  },

  Mutation: {
    createBakongPayment: async (_, { input }, { user }) => {
      const { amount, billNumber } = input;

      // Fake QR string for testing
      const fakeQRString = `TESTPAY|${billNumber}|${amount}|KHR`;

      // Generate QR image
      const qrImage = await QRCode.toDataURL(fakeQRString);

      // Save to MongoDB
      const payment = await BakongPayment.create({
        amount,
        billNumber,
        khqrString: fakeQRString,
        qrImage,
        reference: billNumber,
        createdBy: user?._id,
      });

      return {
        isSuccess: true,
        message: "QR Payment created (test mode)",
        data: payment,
      };
    },

    checkBakongPayment: async (_, { reference }) => {
      const payment = await BakongPayment.findOne({ reference });
      if (!payment) throw new Error("Payment not found");

      // Simulate payment success
      const paid = true;

      if (paid) {
        payment.status = "paid";
        payment.paidAt = new Date();
        await payment.save();
      }

      return {
        isSuccess: paid,
        message: paid ? "Payment successful (test mode)" : "Payment pending",
        data: payment,
      };
    },
  },
};

