import React, { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { supabase } from "../supabaseClient";

export default function Scanner() {
  const [message, setMessage] = useState("");
  const [color, setColor] = useState("");
  const html5QrCodeRef = useRef(null);
  const lastScanRef = useRef("");

  useEffect(() => {
    let isMounted = true;

    async function startScanner() {
      try {
        const cameras = await Html5Qrcode.getCameras();

        if (!cameras || cameras.length === 0) {
          if (isMounted) {
            setMessage("No camera found");
            setColor("red");
          }
          return;
        }

        // Prefer back camera, fallback to first camera
        const backCamera =
          cameras.find((c) => c.label.toLowerCase().includes("back")) ||
          cameras[0];

        html5QrCodeRef.current = new Html5Qrcode("reader");

        await html5QrCodeRef.current.start(
          backCamera.id,
          { fps: 10, qrbox: { width: 250, height: 250 } },
          onScanSuccess,
          onScanError
        );

        if (isMounted) {
          setMessage("Scanner ready. Point camera at QR code.");
          setColor("#1e40af"); // blue
        }
      } catch (err) {
        setMessage("Camera access error: " + err.message);
        setColor("red");
      }
    }

    startScanner();

    return () => {
      isMounted = false;
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Fires on successful decode
  async function onScanSuccess(decodedText) {
    if (decodedText === lastScanRef.current) return;
    lastScanRef.current = decodedText;

    const code = decodedText.trim();

    setMessage(`Checking ticket: ${code}`);
    setColor("yellow");

    // Lookup ticket
    const { data: ticket, error: findError } = await supabase
      .from("tickets")
      .select("*")
      .eq("code", code)
      .maybeSingle();

    if (findError) {
      setMessage("Database error: " + findError.message);
      setColor("red");
      return;
    }

    if (!ticket) {
      setMessage("Invalid ticket (not found)");
      setColor("red");
      return;
    }

    if (ticket.used) {
      setMessage(`Ticket already used at ${ticket.used_at || "unknown time"}`);
      setColor("orange");
      return;
    }

    // Update ticket as used
    const { error: updateError } = await supabase
      .from("tickets")
      .update({
        used: true,
        used_at: new Date().toISOString(),
        used_by: "scanner-1"
      })
      .eq("code", code);

    if (updateError) {
      setMessage("Update error: " + updateError.message);
      setColor("red");
      return;
    }

    setMessage("Ticket valid — entry granted");
    setColor("green");

    // Allow next scan after delay
    setTimeout(() => {
      lastScanRef.current = "";
    }, 2500);
  }

  // Fires on scan attempts (ignored errors)
  function onScanError(err) {
    // No console spam — scanning errors are normal
  }

  return (
    <div className="p-4 text-center">
      <h1 className="text-xl font-bold">QR Ticket Scanner</h1>
      <div id="reader" className="mt-4"></div>

      <div
        className="mt-4 p-3 rounded text-white"
        style={{ background: color }}
      >
        {message}
      </div>
    </div>
  );
}
