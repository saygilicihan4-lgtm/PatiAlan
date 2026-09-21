export async function GET() {
  return Response.json({ ok: true, service: "patialan", version: "0.1.0" });
}
