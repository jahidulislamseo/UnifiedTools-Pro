import { NextRequest, NextResponse } from "next/server";
import tls from "tls";

function parseHost(url: string) {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname;
  } catch {
    return "";
  }
}

function formatDate(value: string | Date) {
  return new Date(value).toISOString().replace("T", " ").replace("Z", " UTC");
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const url = req.nextUrl.searchParams.get("url") || "";
  const host = parseHost(url);
  if (!host) {
    return NextResponse.json({ error: true, reason: "Invalid URL or hostname." }, { status: 400 });
  }

  return new Promise<NextResponse>((resolve) => {
    const socket = tls.connect(
      {
        host,
        port: 443,
        servername: host,
        rejectUnauthorized: false,
        timeout: 12000,
      },
      () => {
        const cert = socket.getPeerCertificate(true) as any;
        if (!cert || Object.keys(cert).length === 0) {
          resolve(NextResponse.json({ error: true, reason: "Failed to read certificate." }, { status: 500 }));
          socket.end();
          return;
        }

        const validFrom = new Date(cert.valid_from);
        const validTo = new Date(cert.valid_to);
        const now = new Date();
        const daysRemaining = Math.round((validTo.getTime() - now.getTime()) / 86400000);
        const isExpired = now > validTo;
        const isNotYetValid = now < validFrom;

        const subjectAltName = Array.isArray(cert.subjectaltname)
          ? cert.subjectaltname
          : typeof cert.subjectaltname === "string"
          ? cert.subjectaltname.split(/,\s*/)
          : [];

        resolve(
          NextResponse.json({
            host,
            validFrom: formatDate(validFrom),
            validTo: formatDate(validTo),
            daysRemaining,
            isExpired,
            isNotYetValid,
            issuer: cert.issuer || {},
            subject: cert.subject || {},
            subjectAltName,
            fingerprint: cert.fingerprint || "",
            serialNumber: cert.serialNumber || "",
            signatureAlgorithm: cert.signatureAlgorithm || "",
            authorizationError: socket.authorizationError || null,
            raw: {
              authorized: socket.authorized,
              authorizedOn: socket.authorized ? formatDate(new Date()) : null,
            },
          },
          { status: 200 })
        );
        socket.end();
      }
    );

    socket.on("error", (error) => {
      resolve(NextResponse.json({ error: true, reason: error.message }, { status: 502 }));
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve(NextResponse.json({ error: true, reason: "Connection timed out." }, { status: 504 }));
    });
  });
}
