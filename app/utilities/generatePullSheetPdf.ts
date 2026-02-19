import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { csv2json } from "json-2-csv";

type PullSheetRow = {
  "Product Line": string;
  "Product Name": string;
  Condition: string;
  Number: string;
  Set: string;
  Rarity: string;
  Quantity: string;
};

export function generatePullSheetPdf(csvText: string): void {
  const allRows = csv2json(csvText, {
    delimiter: { field: "," },
  }) as PullSheetRow[];

  // Filter out the footer row ("Orders Contained in Pull Sheet:")
  const cards = allRows.filter(
    (row) =>
      row["Product Name"] &&
      row["Quantity"] &&
      Number(row["Quantity"]) > 0
  );

  // Sort A–Z by card name
  cards.sort((a, b) =>
    a["Product Name"].localeCompare(b["Product Name"])
  );

  const totalQty = cards.reduce((sum, row) => sum + Number(row["Quantity"]), 0);
  const uniqueCards = cards.length;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("TCGPlayer Pull Sheet", 14, 14);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(`Generated: ${dateStr}`, 14, 20);
  doc.text(
    `${totalQty} total card${totalQty !== 1 ? "s" : ""}  \u2022  ${uniqueCards} unique`,
    14,
    25
  );

  autoTable(doc, {
    startY: 30,
    head: [["Qty", "Card Name", "Set", "#", "Rarity", "Condition"]],
    body: cards.map((row) => [
      row["Quantity"],
      row["Product Name"],
      row["Set"],
      row["Number"],
      row["Rarity"],
      row["Condition"],
    ]),
    styles: {
      fontSize: 8.5,
      cellPadding: 2,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [40, 40, 40],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 55 },
      3: { cellWidth: 12, halign: "center" },
      4: { cellWidth: 12, halign: "center" },
      5: { cellWidth: 30 },
    },
    margin: { top: 10, left: 14, right: 14 },
  });

  const dateFileStr = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .slice(0, 19);
  doc.save(`PullSheet_${dateFileStr}.pdf`);
}
