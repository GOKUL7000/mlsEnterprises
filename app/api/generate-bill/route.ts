import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { supabase } from "@/lib/supabase";



export async function POST(req: Request) {

  const body = await req.json();

  const tripID = body.tripID;

  const { data: trip } =
  await supabase
    .from("tripsTable")
    .select("*")
    .eq("tripID", tripID)
    .single();

if (!trip) {
  return NextResponse.json(
    { error: "Trip not found" },
    { status: 404 }
  );
}

const { data: party } =
  await supabase
    .from("partiesTable")
    .select("*")
    .eq(
      "partiesID",
      trip.partiesID
    )
    .single();

const { data: truck } =
  await supabase
    .from("trucksTable")
    .select("*")
    .eq(
      "truckID",
      trip.truckID
    )
    .single();

const { data: driver } =
  await supabase
    .from("driversTable")
    .select("*")
    .eq(
      "driverID",
      truck?.driverID
    )
    .single();

const { data: expenses } =
  await supabase
    .from("trip_expenses")
    .select("*")
    .eq(
      "trip_id",
      trip.tripID
    );
const totalExpense =
  expenses?.reduce(
    (sum, item) =>
      sum +
      Number(
        item.expense_amount || 0
      ),
    0
  ) || 0;

const profit =
  Number(
    trip.freightAmount || 0
  ) - totalExpense;

const expenseRows =
  expenses?.map(
    (expense) => `
      <tr>
        <td>${expense.expense_type}</td>
        <td>${expense.expense_date}</td>
        <td>${expense.payment_mode}</td>
        <td>
          Rs. ${Number(
            expense.expense_amount
          ).toLocaleString()}
        </td>
      </tr>
    `
  ).join("")
  || "";

  const logoUrl =
  process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/mlsLogo.png`
    : "http://localhost:3000/mlsLogo.png";

const html = `

<!DOCTYPE html>

<html>
<head>
<style>

body{
font-family: Arial, sans-serif;
padding:40px;
max-width:1100px;
margin:auto;
}

.header{
display:flex;
justify-content:space-between;
border-bottom:3px solid #2563eb;
padding-bottom:20px;
}

.logo{
width:100px;
height:100px;
border:1px solid #ddd;
display:flex;
align-items:center;
justify-content:center;
font-weight:bold;
}

.company{
text-align:right;
padding-right:30px;
max-width:350px;
line-height:1.6;
}

.company h1{
margin:0;
color:#2563eb;
font-size:32px;
font-weight:700;
}

.company p{
margin:4px 0;
}
.section{
margin-top:30px;
}

.section-title{
background:#1e40af;
color:white;
padding:12px 15px;
font-weight:600;
font-size:15px;
border-radius:6px 6px 0 0;
}

table{
width:100%;
border-collapse:collapse;
}

td,th{
border:1px solid #d1d5db;
padding:12px;
font-size:14px;
}

th{
background:#f5f5f5;
}

</style>
</head>

<body>

<div class="header">

<div class="logo">
<img
src="${logoUrl}"
style="
width:90px;
height:90px;
object-fit:contain;
"
/>
</div>

<div class="company">

<h1>MLS TRANSPORTS</h1>

<p>+91 9600647417</p>

<p>
15/301 MD 644 Natham Main Road<br/>
Sendurai, Tamil Nadu - 624403
</p>

<p>
GSTN : 33BOMPG9617Q1Z8<br/>
PAN : BOMPG9617Q
</p>

</div>

</div>

<div style="
margin-top:20px;
text-align:right;
font-size:14px;
color:#666;
">
Generated On:
${new Date().toLocaleDateString("en-IN")}
</div>

<div class="section">

<div class="section-title">
BILL TO
</div>

<table>

<tr>
<td>Party Name</td>
<td>${party?.partyName || "-"}</td>
</tr>

<tr>
<td>Address</td>
<td>${party?.partyAddress || "-"}</td>
</tr>

<tr>
<td>GST</td>
<td>${party?.partyGST || "-"}</td>
</tr>

<tr>
<td>PAN</td>
<td>${party?.partyPan || "-"}</td>
</tr>

</table>

</div>

<div class="section">

<div class="section-title">
TRIP DETAILS
</div>

<table>

<tr>
<td>LR Number</td>
<td>${trip.lrNumber || "-"}</td>
</tr>

<tr>
<td>Origin</td>
<td>${trip.origin || "-"}</td>
</tr>

<tr>
<td>Destination</td>
<td>${trip.destination || "-"}</td>
</tr>

</table>

<div class="section">

<div class="section-title">
TRUCK & DRIVER DETAILS
</div>

<table>

<tr>
<td>Truck Number</td>
<td>${truck?.truckNumber || "-"}</td>
</tr>

<tr>
<td>Truck Type</td>
<td>${truck?.truckType || "-"}</td>
</tr>

<tr>
<td>Truck Capacity</td>
<td>${truck?.truckCapacity || "-"}</td>
</tr>

<tr>
<td>Body Length</td>
<td>${truck?.truckBodyLength || "-"}</td>
</tr>

<tr>
<td>Driver Name</td>
<td>${driver?.driverName || "-"}</td>
</tr>

<tr>
<td>Driver Mobile</td>
<td>${driver?.driverMobileNumber || "-"}</td>
</tr>

</table>

</div>

<div class="section">

<div class="section-title">
EXPENSE BREAKDOWN
</div>

<table>

<thead>

<tr>
<th>Expense Type</th>
<th>Date</th>
<th>Payment Mode</th>
<th>Amount</th>
</tr>

</thead>

<tbody>

${expenseRows}

</tbody>

</table>

</div>

<div class="section">

<div class="section-title">
FINANCIAL SUMMARY
</div>

<table>

<tr>
<td>Freight Amount</td>
<td>
Rs. ${Number(
trip.freightAmount || 0
).toLocaleString()}
</td>
</tr>

<tr>
<td>Total Expense</td>
<td>
Rs. ${totalExpense.toLocaleString()}
</td>
</tr>
<tr>
<td>Settlement Type</td>
<td>
${trip.settlement_type || "-"}
</td>
</tr>

<tr style="
background:#dcfce7;
font-weight:bold;
font-size:16px;
color:#166534;
">
<td>Net Profit</td>
<td>
Rs. ${profit.toLocaleString()}
</td>
</tr>

</table>

</div>

</div>
<div
style="
margin-top:50px;
border-top:1px solid #ddd;
padding-top:15px;
text-align:center;
color:#777;
font-size:12px;
"
>
Generated By 
MLS TRANSPORTS |
${new Date().toLocaleDateString("en-IN")}
</div>
</body>
</html>
`;

const browser =
  await puppeteer.launch({
    headless: true,
  });

const page =
  await browser.newPage();

await page.setContent(
  html,
  {
    waitUntil: "load",
  }
);

const pdf =
  await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "20px",
      right: "20px",
      bottom: "20px",
      left: "20px",
    },
  });

await browser.close();

const fileName =
  `${trip.tripID}-${Date.now()}.pdf`;

const { error: uploadError } =
  await supabase.storage
    .from("trip-bills")
    .upload(
      fileName,
      pdf,
      {
        contentType:
          "application/pdf",
        upsert: true,
      }
    );

if (uploadError) {
  console.error(uploadError);

  return NextResponse.json(
    {
      error:
        uploadError.message,
    },
    {
      status: 500,
    }
  );
}

const {
  data: signedUrlData,
  error: signedUrlError,
} =
  await supabase.storage
    .from("trip-bills")
    .createSignedUrl(
      fileName,
      60 * 60 * 24 * 365 // 1 year
    );

if (signedUrlError) {
  return NextResponse.json(
    {
      error:
        signedUrlError.message,
    },
    {
      status: 500,
    }
  );
}

const pdfUrl =
  signedUrlData.signedUrl;

await supabase
  .from("tripsTable")
  .update({
    bill_pdf_url: pdfUrl,
    bill_generated_at:
      new Date().toISOString(),
  })
  .eq(
    "tripID",
    trip.tripID
  );


return NextResponse.json({
  success: true,
  pdfUrl,
});
}