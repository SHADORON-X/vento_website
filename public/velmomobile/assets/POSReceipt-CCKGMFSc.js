import{j as t}from"./index-dQ5VC1kk.js";import{r as h}from"./vendor-react-YqOm9Ia5.js";const d={cash:"ESPECES",credit:"A CREDIT",mobile_money:"MOBILE MONEY"},f=h.forwardRef(({data:e},o)=>{const s=n=>n.toLocaleString("fr-FR"),l=n=>{const i=String(n.getDate()).padStart(2,"0"),a=String(n.getMonth()+1).padStart(2,"0"),r=n.getFullYear(),p=String(n.getHours()).padStart(2,"0"),m=String(n.getMinutes()).padStart(2,"0");return`${i}/${a}/${r} ${p}:${m}`};return t.jsxs("div",{ref:o,id:"pos-receipt",style:{width:"100%",maxWidth:"72mm",margin:"0 auto",padding:"4mm 0",fontFamily:"'Courier New', 'Consolas', monospace",fontSize:"11px",lineHeight:"1.4",color:"#000",backgroundColor:"#fff"},children:[t.jsxs("div",{style:{textAlign:"center",marginBottom:"4mm",borderBottom:"2px dashed #000",paddingBottom:"3mm"},children:[t.jsx("div",{style:{fontSize:"16px",fontWeight:"bold",marginBottom:"2mm",letterSpacing:"0.5px"},children:e.shopName.toUpperCase()}),e.shopPhone&&t.jsxs("div",{style:{fontSize:"10px",marginTop:"1mm"},children:["Tel: ",e.shopPhone]}),e.shopAddress&&t.jsx("div",{style:{fontSize:"10px",marginTop:"1mm"},children:e.shopAddress})]}),t.jsxs("div",{style:{fontSize:"10px",marginBottom:"3mm",lineHeight:"1.5"},children:[t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:"1mm"},children:[t.jsx("span",{style:{fontWeight:"bold"},children:"Reçu N°:"}),t.jsx("span",{children:e.receiptNumber})]}),t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:"1mm"},children:[t.jsx("span",{style:{fontWeight:"bold"},children:"Date:"}),t.jsx("span",{children:l(e.date)})]}),t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:"1mm"},children:[t.jsx("span",{style:{fontWeight:"bold"},children:"Caissier:"}),t.jsx("span",{children:e.cashierName})]}),e.customerName&&t.jsxs("div",{style:{display:"flex",justifyContent:"space-between"},children:[t.jsx("span",{style:{fontWeight:"bold"},children:"Client:"}),t.jsx("span",{children:e.customerName})]})]}),t.jsx("div",{style:{borderTop:"1px dashed #000",borderBottom:"2px solid #000",paddingTop:"3mm",paddingBottom:"3mm",marginBottom:"3mm"},children:e.items.map((n,i)=>t.jsxs("div",{style:{marginBottom:"3mm"},children:[t.jsx("div",{style:{fontSize:"11px",fontWeight:"bold",marginBottom:"1mm",wordWrap:"break-word"},children:n.name}),t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:"10px",alignItems:"center"},children:[t.jsxs("span",{children:[n.quantity," x ",s(n.unitPrice)," F"]}),t.jsxs("span",{style:{fontWeight:"bold",fontSize:"12px"},children:[s(n.total)," F"]})]})]},i))}),t.jsxs("div",{style:{fontSize:"11px",marginBottom:"3mm"},children:[t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:"1mm"},children:[t.jsx("span",{style:{fontWeight:"bold"},children:"SOUS-TOTAL:"}),t.jsxs("span",{style:{fontWeight:"bold"},children:[s(e.subtotal)," F"]})]}),e.discount&&e.discount>0?t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:"2mm",color:"#000"},children:[t.jsx("span",{style:{fontWeight:"bold"},children:"REMISE:"}),t.jsxs("span",{style:{fontWeight:"bold"},children:["-",s(e.discount)," F"]})]}):null,t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:"14px",fontWeight:"bold",borderTop:"2px solid #000",paddingTop:"2mm",marginTop:"2mm"},children:[t.jsx("span",{children:"TOTAL A PAYER:"}),t.jsxs("span",{style:{fontSize:"16px"},children:[s(e.total)," F"]})]})]}),t.jsxs("div",{style:{borderTop:"1px dashed #000",paddingTop:"3mm",marginBottom:"3mm",fontSize:"11px"},children:[t.jsx("div",{style:{fontWeight:"bold",fontSize:"12px",textAlign:"center",padding:"2mm",background:"#000",color:"#fff",marginBottom:"2mm"},children:d[e.paymentMethod]}),t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontWeight:"bold"},children:[t.jsx("span",{children:"Montant payé:"}),t.jsxs("span",{children:[s(e.amountPaid||e.total)," F"]})]}),e.change!==void 0&&e.change>0&&t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginTop:"2mm"},children:[t.jsx("span",{style:{fontWeight:"bold"},children:"RENDU:"}),t.jsxs("span",{style:{fontWeight:"bold",fontSize:"14px"},children:[s(e.change)," F"]})]})]}),t.jsxs("div",{style:{textAlign:"center",fontSize:"9px",marginTop:"4mm",borderTop:"1px dashed #000",paddingTop:"3mm",lineHeight:"1.6"},children:[t.jsx("div",{style:{fontWeight:"bold",fontSize:"11px",marginBottom:"2mm"},children:"★ MERCI DE VOTRE VISITE! ★"}),t.jsxs("div",{children:["A bientôt chez ",e.shopName]}),t.jsx("div",{style:{fontStyle:"italic",marginTop:"2mm"},children:"Article vendu non repris"})]})]})});f.displayName="POSReceipt";const y=e=>{const o=i=>i.toLocaleString("fr-FR"),s=i=>{const a=String(i.getDate()).padStart(2,"0"),r=String(i.getMonth()+1).padStart(2,"0"),p=i.getFullYear(),m=String(i.getHours()).padStart(2,"0"),c=String(i.getMinutes()).padStart(2,"0");return`${a}/${r}/${p} ${m}:${c}`},l=`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reçu ${e.receiptNumber}</title>
                <style>
                @page {
                    margin: 0;
                    size: auto;
                }
                
                body {
                    margin: 0;
                    padding: 0; 
                    font-family: 'Arial', 'Helvetica', sans-serif;
                    font-size: 12px;
                    line-height: 1.2;
                    color: #000;
                    background: #fff;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                }
                
                .receipt {
                    width: 100%;
                    max-width: 72mm; 
                    margin: 0;
                    padding: 2mm 0;
                    text-align: center;
                }
                
                /* HEADER */
                .header {
                    text-align: center;
                    margin-bottom: 5mm;
                    padding-bottom: 3mm;
                    border-bottom: 2px dashed #000;
                }
                
                .shop-name {
                    font-size: 20px;
                    font-weight: 900;
                    margin-bottom: 2mm;
                    text-transform: uppercase;
                    display: block;
                }
                
                .shop-contact {
                    font-size: 11px;
                    font-weight: bold;
                    margin-top: 2px;
                }
                
                /* INFO SECTION */
                .info {
                    font-size: 11px;
                    margin-bottom: 4mm;
                    text-align: left; /* Infos alignées à gauche */
                }
                
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 2px;
                }

                .info-label {
                    font-weight: bold;
                }
                
                /* ITEMS SECTION */
                .items {
                    border-top: 1px dashed #000;
                    border-bottom: 2px solid #000;
                    padding: 3mm 0;
                    margin-bottom: 3mm;
                    width: 100%;
                    text-align: left; /* Articles alignés à gauche */
                }
                
                .item {
                    margin-bottom: 3mm;
                    page-break-inside: avoid;
                }
                
                .item-name {
                    font-size: 13px;
                    font-weight: 900;
                    margin-bottom: 2px;
                    text-transform: uppercase;
                    display: block;
                }
                
                .item-details {
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    font-weight: bold;
                }
                
                /* TOTALS SECTION */
                .totals {
                    font-size: 12px;
                    margin-bottom: 4mm;
                    font-weight: bold;
                    text-align: left;
                }
                
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 2px;
                }
                
                .total-final {
                    font-size: 16px;
                    font-weight: 900;
                    border-top: 3px solid #000;
                    padding-top: 3mm;
                    margin-top: 3mm;
                    align-items: center;
                }
                
                .total-final .total-value {
                    font-size: 24px;
                }
                
                /* PAYMENT SECTION */
                .payment {
                    border-top: 1px dashed #000;
                    padding-top: 3mm;
                    margin-bottom: 4mm;
                    font-size: 12px;
                    text-align: left;
                }

                .payment-method {
                    font-weight: 900;
                    font-size: 14px;
                    text-align: center;
                    padding: 2mm;
                    border: 2px solid #000;
                    margin-bottom: 3mm;
                    text-transform: uppercase;
                    background: #eee;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                
                /* FOOTER */
                .footer {
                    text-align: center;
                    font-size: 11px;
                    margin-top: 5mm;
                    border-top: 1px dashed #000;
                    padding-top: 4mm;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="receipt">
                <!-- HEADER -->
                <div class="header">
                    <div class="shop-name">${e.shopName}</div>
                    ${e.shopPhone?`<div class="shop-contact">Tel: ${e.shopPhone}</div>`:""}
                    ${e.shopAddress?`<div class="shop-contact">${e.shopAddress}</div>`:""}
                </div>
                
                <!-- INFO -->
                <div class="info">
                    <div class="info-row">
                        <span class="info-label">Reçu N°:</span>
                        <span style="font-weight:900">${e.receiptNumber}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Date:</span>
                        <span>${s(e.date)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Caissier:</span>
                        <span>${e.cashierName}</span>
                    </div>
                    ${e.customerName?`
                    <div class="info-row">
                        <span class="info-label">Client:</span>
                        <span style="font-weight:900">${e.customerName}</span>
                    </div>
                    `:""}
                </div>
                
                <!-- ITEMS -->
                <div class="items">
                    ${e.items.map(i=>`
                        <div class="item">
                            <div class="item-name">${i.name}</div>
                            <div class="item-details">
                                <span>${i.quantity} x ${o(i.unitPrice)}</span>
                                <span>${o(i.total)}</span>
                            </div>
                        </div>
                    `).join("")}
                </div>
                
                <!-- TOTALS -->
                <div class="totals">
                    <div class="total-row">
                        <span>SOUS-TOTAL:</span>
                        <span>${o(e.subtotal)} GNF</span>
                    </div>
                    ${e.discount&&e.discount>0?`
                    <div class="total-row" style="font-weight:900">
                        <span>REMISE:</span>
                        <span>-${o(e.discount)} GNF</span>
                    </div>
                    `:""}
                    <div class="total-row total-final">
                        <span>TOTAL:</span>
                        <span class="total-value">${o(e.total)}</span>
                    </div>
                </div>
                
                <!-- PAYMENT -->
                <div class="payment">
                    <div class="payment-method">${d[e.paymentMethod]}</div>
                    <div class="total-row">
                        <span style="font-weight:bold">Montant payé:</span>
                        <span style="font-weight:900">${o(e.amountPaid||e.total)} GNF</span>
                    </div>
                </div>
                
                <!-- FOOTER -->
                <div class="footer">
                    <div style="margin-bottom:3mm">★ MERCI DE VOTRE VISITE! ★</div>
                    <div style="margin-bottom:3mm">A bientôt chez ${e.shopName}</div>
                    <div style="margin-top:3mm; font-size:10px; text-transform:uppercase;">TOUT PRODUIT VENDU NE SERA NI REPRIS NI ÉCHANGÉ</div>
                    <div style="font-size:9px; font-weight:normal; margin-top:5mm">Logiciel: VELMO MARKET</div>
                </div>
            </div>
            
            <script>
                // Auto-print avec petit délai pour le rendu
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 300);
                };
                
                // Fermer après impression (ou annulation)
                window.onafterprint = function() {
                    setTimeout(function() {
                        window.close();
                    }, 500);
                };
            <\/script>
        </body>
        </html>
    `,n=window.open("","_blank","width=400,height=600");if(!n){alert("❌ Veuillez autoriser les pop-ups pour imprimer le reçu");return}n.document.open(),n.document.write(l),n.document.close()};export{y as p};
