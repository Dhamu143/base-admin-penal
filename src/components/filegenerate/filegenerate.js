import React, { useEffect, useState } from "react";
// import html2pdf from "html2pdf.js";
import axios from "axios";
import htmlTemplateData from "./receipt.js";
// import html2canvas from "html2canvas";
function fillTemplate(template, data) {
  return template.replace(/{{(.*?)}}/g, (_, key) => data[key.trim()] || "");
}
// async function captureImageFromComponent(index) {
//   console.log(index)
//   if(index){
//  const element = document.getElementById(index); // e.g. "#logo-container"
//   console.log(element)
//   const canvas = await html2canvas(element, {
//     useCORS: true, // tries to keep image data
//     allowTaint: true // allow tainted images if CORS headers missing
//   });
//   var imgg= canvas.toDataURL("image/png"); // base64
//   console.log(imgg)
//   return  imgg;
//   }

// }

// async function captureImageFromComponent(index) {
//   const element = document.getElementById(index);
//   if (!element) {
//     console.error(`Element ${index} not found`);
//     return null;
//   }

//   // Wait for all images inside element to load
//   await Promise.all(
//     Array.from(element.querySelectorAll("img")).map(
//       img => img.complete ? Promise.resolve() : new Promise(res => img.onload = res)
//     )
//   );
// console.log(element)
//   const canvas = await html2canvas(element, {
//     useCORS: true,
//     allowTaint: false,
//     scale: 2,
//     backgroundColor: null
//   });

//   var imgg= canvas.toDataURL("image/png");
//    console.log(imgg)
//    return imgg;
//}

export default function ReceiptPDF({ data }) {
  // console.log(data)
  // const [htmlTemplate, setHtmlTemplate] = useState(htmlTemplateData);
  const [apidata, setApidata] = useState({});
  const token = localStorage.getItem("token");

  // useEffect(() => {
  //   setHtmlTemplate(htmlTemplateData);
  // }, []);

  const generatePdf = async () => {
    try {
      const res = await axios.post(
        "https://testapi.apnamandal.com/api/admin/receipt/create",
        { id: data },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let apiData = res.data;
      // console.log(apiData)
      let filledHtml = fillTemplate(htmlTemplateData, apiData);
      // console.log(filledHtml)
      const printWindow = window.open("", "_blank");
      printWindow.document.open();
      printWindow.document.write(filledHtml);
      printWindow.document.close();

      // 3. Wait until content is loaded before printing
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };
      // setApidata(apiData);
      // setTimeout(async ()=>{
      //   console.log("sdfsdf")
      //    apiData["imagedata"]=await captureImageFromComponent(res.data.SANSTHA_LOGO_URL)
      // //apiData.SANSTHA_LOGO_URL = await imageUrlToBase64Raw(apiData.SANSTHA_LOGO_URL);
      // console.log(apiData)
      // let filledHtml = fillTemplate(htmlTemplate, apiData);
      // console.log(filledHtml)
      // const element = document.createElement("div");
      // element.innerHTML = filledHtml;
      // document.body.appendChild(element); // optional for debug

      // html2pdf()
      //   .from(element)
      //   .set({
      //     margin: 10,
      //     filename: `receipt_${apiData?.receiptNo || "file"}.pdf`,
      //     image: { type: "jpeg", quality: 0.98 },
      //     html2canvas: { scale: 2 },
      //     jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      //   })
      //   .save();
      // },5000)
      // const imgElement = document.getElementById("image0");
      //   console.log(imgElement)
    } catch (err) {
      console.error("PDF Generation Error:", err);
    }
  };

  return (
    <>
      <button
        className="btn btn-sm btn-primary "
        title=" Download Receipt"
        onClick={generatePdf}
      >
        {" "}
        <i className="fa fa-download"></i>
      </button>

      {/* <img id={apidata.SANSTHA_LOGO_URL} 
                            src={apidata.SANSTHA_LOGO_URL}
                            // src="/img/images.png"
                            alt="user"
                            style={{
                              width: "50px",
                              height: "50px",
                              borderRadius: "50%",
                              
                            }}
                          /> */}
    </>
  );
}
