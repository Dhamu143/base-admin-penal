var htmlTemplateData= `<!DOCTYPE html>
<html>
  <head>
    <style>
      table {
        width: 100%;
        border-collapse: collapse;
      }
      td {
        padding: 6px;
        vertical-align: top;
        font-size: 14px;
      }
      td.label {
        width: 180px;
        font-weight: bold;
        white-space: nowrap;
      }
      td.value {
        width: auto;
      }
      .section-title {
        font-weight: bold;
        font-size: 14px;
        margin-top: 20px;
        border-bottom: 1px solid #aaa;
      }
    </style>
  </head>
  <body style="font-family: Arial, sans-serif; border: 2px solid #333; padding: 20px; max-width: 700px; margin: auto;">
    <div
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
      <img
        style="height: 60px; width: 60px"
        src="{{SANSTHA_LOGO_URL}}"
        alt="Sanstha Logo" />
      <div>
        <strong>{{sanstha_name}}</strong><br />
        {{sanstha_regno}}
      </div>
    </div>

    <div
      style="
        text-align: center;
        font-size: 20px;
        font-weight: bold;
        text-decoration: underline;
        margin-top: 20px;
      ">
      DONATION / CONTRIBUTION RECEIPT
    </div>


    <div class="section-title">Receipt Information</div>
    <table>
      <tr>
        <td class="label">Date of Receipt:</td>
        <td class="value">{{date}}</td>
      </tr>
      <tr>
        <td class="label">Issued Through:</td>
        <td class="value">ApnaMandal Platform</td>
      </tr>
    </table>

    <div class="section-title">Donor Details</div>
    <table>
      <tr>
        <td class="label">Name:</td>
        <td class="value">{{name}}</td>
      </tr>
      <tr>
        <td class="label">Mobile:</td>
        <td class="value">+91 {{mobile}}</td>
      </tr>
      <tr>
        <td class="label">Address:</td>
        <td class="value">{{address}}</td>
      </tr>
      <tr>
        <td class="label">Email:</td>
        <td class="value">{{email}}</td>
      </tr>
    </table>

    <div class="section-title">Payment Details</div>
    <table>
      <tr>
        <td class="label">Amount:</td>
        <td class="value">₹ {{amount}}</td>
      </tr>
      <tr>
        <td class="label">Payment Mode:</td>
        <td class="value">{{mode}}</td>
      </tr>
      <tr>
        <td class="label">Purpose:</td>
        <td class="value">{{purpose}}</td>
      </tr>
      <tr>
        <td class="label">Status:</td>
        <td class="value">Verified by Sanstha Admin</td>
      </tr>
    </table>

    <p style="font-size: 10px; font-style: italic; color: #999">
      This is a system-generated receipt issued through ApnaMandal.<br />
      Not valid for 80G claims unless separately issued and filed by the
      Sanstha.
    </p>

    <div
      style="
        text-align: center;
        font-size: 12px;
        margin-top: 30px;
        color: #666;
      ">
      Powered by ApnaMandal – Transparent. Trusted. Together.<br />
      www.apnamandal.com | contact@apnamandal.com
    </div>
  </body>
</html>`

export default htmlTemplateData;