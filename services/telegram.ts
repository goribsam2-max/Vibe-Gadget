
const BOT_TOKEN = "8236254617:AAFFTI9j4pl6U-8-pdJgZigWb2M75oBmyzg";
const CHAT_ID = "5494141897";

export const sendOrderToTelegram = async (orderData: any) => {
  try {
    const itemsList = orderData.items
      .map((item: any) => `• ${item.name}\n  [Qty: ${item.quantity} | Price: ৳${item.priceAtPurchase}]`)
      .join("\n\n");

    const paymentDetails = `
<b>💳 PAYMENT DETAILS</b>
<b>Method:</b> ${orderData.paymentMethod}
<b>Option:</b> ${orderData.paymentOption || 'N/A'}
<b>TrxID:</b> <code>${orderData.transactionId || 'None'}</code>
`;

    const message = `
<b>🛍️ NEW ORDER CONFIRMED</b>
━━━━━━━━━━━━━━━━━━
<b>👤 CUSTOMER PROFILE</b>
<b>Name:</b> ${orderData.customerName}
<b>Phone:</b> <code>${orderData.contactNumber}</code>
<b>Address:</b> <i>${orderData.shippingAddress}</i>
<b>Customer IP:</b> <code>${orderData.ipAddress || 'Not Captured'}</code>

<b>📦 ORDERED ITEMS</b>
${itemsList}

━━━━━━━━━━━━━━━━━━
${paymentDetails}
<b>💰 BILLING SUMMARY</b>
<b>Total Amount:</b> ৳${orderData.total}

<b>📅 LOGISTICS INFO</b>
<b>Courier Service:</b> Steadfast Courier
<b>Order Status:</b> ${orderData.status}
<b>Order Date:</b> ${new Date(orderData.createdAt).toLocaleString('en-BD')}
━━━━━━━━━━━━━━━━━━
<b>🆔 INVOICE ID:</b>
<code>${orderData.id ? orderData.id.toUpperCase() : 'NEW_ENTRY'}</code>
`;

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    });

    return await response.json();
  } catch (error) {
    console.error("Telegram Notification Gateway Error:", error);
    return null;
  }
};
