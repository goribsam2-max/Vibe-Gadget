
const BOT_TOKEN = "8236254617:AAFFTI9j4pl6U-8-pdJgZigWb2M75oBmyzg";
const CHAT_ID = "5494141897";

export const sendOrderToTelegram = async (orderData: any) => {
  try {
    const itemsList = orderData.items
      .map((item: any) => `• ${item.name} (x${item.quantity}) - ৳${item.priceAtPurchase}`)
      .join("\n");

    const message = `
<b>🚀 NEW ORDER RECEIVED!</b>
━━━━━━━━━━━━━━━━━━
<b>👤 CUSTOMER DETAILS</b>
<b>Name:</b> ${orderData.customerName}
<b>Phone:</b> <code>${orderData.contactNumber}</code>
<b>Address:</b> <i>${orderData.shippingAddress}</i>

<b>📦 INVENTORY MANIFEST</b>
${itemsList}

<b>💰 PAYMENT INFO</b>
<b>Total Amount:</b> ৳${orderData.total}
<b>Paid Now:</b> ৳${orderData.paidAmount}
<b>Method:</b> ${orderData.paymentMethod}
<b>Option:</b> ${orderData.paymentOption}

<b>🚚 LOGISTICS</b>
<b>Provider:</b> Steadfast Courier
<b>Status:</b> ${orderData.status}
<b>Timestamp:</b> ${new Date(orderData.createdAt).toLocaleString()}
━━━━━━━━━━━━━━━━━━
<code>REF: ${orderData.id ? orderData.id.toUpperCase() : 'NEW_ORDER'}</code>
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
    console.error("Telegram Notification Error:", error);
    return null;
  }
};
