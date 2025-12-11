import React, { useState } from "react";
import QRCode from "react-qr-code";
import { supabase } from "../supabaseClient.jsx";
import JSZip from "jszip";
import { jsPDF } from "jspdf";
import * as ReactDOM from "react-dom";

// Generate 8-char uppercase code
function shortCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

// Convert rendered QR to PNG by rendering offscreen
async function renderQRCodeToPNG(code) {
  return new Promise((resolve) => {
    // Off-screen container
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "0";
    document.body.appendChild(container);

    const mountPoint = document.createElement("div");
    container.appendChild(mountPoint);

    // Render QR component
    ReactDOM.render(<QRCode value={code} size={256} />, mountPoint);

    // Wait briefly for SVG to appear
    setTimeout(() => {
      const svg = mountPoint.querySelector("svg");

      if (!svg) {
        console.error("QR SVG not found for code:", code);
        document.body.removeChild(container);
        resolve(null);
        return;
      }

      const serializer = new XMLSerializer();
      const svgData = serializer.serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        URL.revokeObjectURL(url);
        document.body.removeChild(container);

        resolve(canvas.toDataURL("image/png"));
      };

      img.src = url;
    }, 50);
  });
}

// ----------------------------
// MAIN COMPONENT
// ----------------------------
export default function TicketGenerator() {
  const [count, setCount] = useState(1);
  const [created, setCreated] = useState([]);
  const [loading, setLoading] = useState(false);

  async function createTickets() {
    setLoading(true);
    const out = [];

    for (let i = 0; i < count; i++) {
      const code = shortCode();
      const { data, error } = await supabase
        .from("tickets")
        .insert([{ code, metadata: { source: "panel" } }])
        .select()
        .single();

      if (error) {
        console.error("Insert error:", error);
      } else {
        out.push(data);
      }
    }

    setCreated(out);
    setLoading(false);
  }

  // ----------------------------
  // PDF DOWNLOAD
  // ----------------------------
  async function downloadPDF() {
    if (created.length === 0) return;

    const pdf = new jsPDF();
    pdf.setFontSize(14);

    for (let i = 0; i < created.length; i++) {
      const t = created[i];

      const png = await renderQRCodeToPNG(t.code);
      if (!png) continue;

      if (i > 0) pdf.addPage();

      pdf.text(`Ticket Code: ${t.code}`, 10, 10);
      pdf.addImage(png, "PNG", 10, 20, 60, 60);
      pdf.text(`Created: ${new Date(t.created_at).toLocaleString()}`, 10, 90);
    }

    pdf.save("tickets.pdf");
  }

  // ----------------------------
  // ZIP DOWNLOAD
  // ----------------------------
  async function downloadZIP() {
    if (created.length === 0) return;

    const zip = new JSZip();

    for (const t of created) {
      const png = await renderQRCodeToPNG(t.code);
      if (!png) continue;

      const base64 = png.split(",")[1];
      zip.file(`${t.code}.png`, base64, { base64: true });
    }

    const blob = await zip.generateAsync({ type: "blob" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "tickets.zip";
    link.click();

    URL.revokeObjectURL(link.href);
  }

  // ----------------------------
  // RENDER
  // ----------------------------
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-lg font-semibold mb-3">Create Tickets</h2>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="number"
          value={count}
          min={1}
          onChange={(e) => setCount(Number(e.target.value))}
          className="border px-2 py-1 rounded"
        />
        <button
          onClick={createTickets}
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >
          {loading ? "Creating..." : "Create"}
        </button>

        {created.length > 0 && (
          <>
            <button
              onClick={downloadPDF}
              className="bg-green-600 text-white px-4 py-1 rounded"
            >
              PDF
            </button>

            <button
              onClick={downloadZIP}
              className="bg-indigo-600 text-white px-4 py-1 rounded"
            >
              ZIP
            </button>
          </>
        )}
      </div>

      {/* Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {created.map((t) => (
          <div key={t.id} className="border p-3 rounded text-center">
            <div style={{ width: 128, height: 128 }} className="mx-auto">
              <QRCode value={t.code} />
            </div>

            <div className="mt-2 font-mono text-sm">{t.code}</div>

            <div className="text-xs text-gray-500">
              {new Date(t.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
