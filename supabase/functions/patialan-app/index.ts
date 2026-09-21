import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.116.0";

const html = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>PatiAlan — Köpeğin için özel alan</title>
<meta name="description" content="Köpeğiniz için güvenli, özel ve saatlik alanları keşfedin. İstanbul pilotu."/>
<style>
:root{--ink:#17231c;--green:#245d3b;--muted:#66736b;--line:#dce5df;--cream:#f6f3e9;--white:#fff}
*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;color:var(--ink);background:#fbfcfa}
a{text-decoration:none;color:inherit}.top{height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 6vw;border-bottom:1px solid var(--line);background:#fff;position:sticky;top:0;z-index:5}
.brand{font-size:26px;font-weight:900;letter-spacing:-1px}.brand b{color:var(--green)}.top .pill{padding:11px 16px;border:1px solid var(--ink);border-radius:999px;font-weight:800}
.hero{padding:80px 7vw;display:grid;grid-template-columns:1.1fr .9fr;gap:54px;align-items:center;background:linear-gradient(135deg,var(--cream),#f7fbf8)}
.eyebrow{font-size:12px;letter-spacing:1.4px;text-transform:uppercase;font-weight:900;color:var(--green)}
h1{font-size:62px;line-height:.98;letter-spacing:-3.3px;margin:14px 0 22px}h1 em{font-family:Georgia,serif;font-weight:400;color:var(--green)}
.lead{font-size:19px;line-height:1.65;color:var(--muted);max-width:650px}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}
.btn{border:0;border-radius:14px;padding:15px 20px;font-weight:900;font-size:15px;cursor:pointer}.primary{background:var(--green);color:#fff}.secondary{background:#fff;border:1px solid var(--line)}
.card{background:#fff;border:1px solid #e6ede8;border-radius:26px;padding:20px;box-shadow:0 24px 70px rgba(31,63,43,.12)}.map{height:360px;border-radius:20px;position:relative;overflow:hidden;background:radial-gradient(circle at 25% 28%,#cfe5d3 0 10%,transparent 11%),radial-gradient(circle at 68% 58%,#cde0ce 0 15%,transparent 16%),linear-gradient(145deg,#eef4ec,#dce8d8)}
.map:after{content:"";position:absolute;width:140%;height:18px;left:-20%;top:48%;transform:rotate(-22deg);background:#fff;opacity:.85}.pin{position:absolute;z-index:2;background:var(--ink);color:#fff;padding:8px 11px;border-radius:999px;font-weight:900}.p1{left:24%;top:25%}.p2{left:63%;top:57%}.p3{left:52%;top:75%}.search{position:absolute;z-index:3;left:20px;right:20px;top:20px;background:#fff;padding:14px 16px;border-radius:14px;font-weight:800}
.section{padding:70px 7vw}.section h2{font-size:36px;letter-spacing:-1.5px;margin:10px 0 10px}.sub{color:var(--muted);max-width:760px;line-height:1.6}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:30px}
.space{border:1px solid var(--line);border-radius:20px;background:#fff;overflow:hidden}.visual{height:190px;padding:14px;display:flex;align-items:flex-end;background:linear-gradient(145deg,#cfe2cf,#86a88d);color:#fff;font-weight:900}.body{padding:18px}.meta{font-size:13px;color:var(--muted);display:flex;justify-content:space-between}.body h3{margin:8px 0 12px}.chips{display:flex;gap:7px;flex-wrap:wrap}.chips span{font-size:12px;background:#eef4ef;border-radius:999px;padding:7px 9px}.price{margin-top:16px;font-weight:900}.price small{font-weight:500;color:var(--muted)}
.notice{margin-top:22px;padding:14px 16px;background:#eef6f0;border:1px solid var(--line);border-radius:14px;color:#476153}
.forms{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:32px}.form{background:#fff;border:1px solid var(--line);border-radius:22px;padding:24px}.form h3{font-size:24px;margin-top:0}.form label{display:grid;gap:7px;font-size:13px;font-weight:800;margin:13px 0}.form input,.form select{width:100%;padding:13px;border:1px solid #ccd8d0;border-radius:11px;font:inherit}.form button{width:100%;margin-top:8px}.status{min-height:24px;font-size:13px;margin-top:10px;color:var(--green);font-weight:800}
.footer{padding:30px 7vw;border-top:1px solid var(--line);display:flex;justify-content:space-between;color:var(--muted);font-size:13px}
.badge{display:inline-block;background:#fff;border:1px solid var(--line);padding:8px 10px;border-radius:999px;font-size:12px;font-weight:800}
@media(max-width:900px){.hero{grid-template-columns:1fr;padding:55px 22px}.section{padding:52px 22px}h1{font-size:47px}.grid,.forms{grid-template-columns:1fr}.top{padding:0 20px}.map{height:300px}.footer{padding:24px 22px;gap:16px;flex-direction:column}}
</style>
</head>
<body>
<header class="top"><div class="brand">PatiAlan<b>.</b></div><a class="pill" href="#pilot">İstanbul pilotuna katıl</a></header>
<section class="hero">
<div>
<span class="eyebrow">İstanbul pilotu · Private Pet Spaces</span>
<h1>Köpeğin özgürce koşsun.<br><em>Alan yalnızca sizin olsun.</em></h1>
<p class="lead">Kalabalık köpek parkı yok. Rastgele karşılaşma yok. Doğrulanmış özel bahçe ve alanları saatlik rezerve etmeyi hedefleyen PatiAlan pilotu.</p>
<div class="actions"><a class="btn primary" href="#alanlar">Pilot alanları gör</a><a class="btn secondary" href="#pilot">Alanımı listelemek istiyorum</a></div>
<p class="notice">Canlı pilot altyapısı aktiftir. Aşağıdaki alan kartları ürün deneyimini göstermek için örnektir; ücretli rezervasyon açılmadan önce her gerçek alan ayrıca doğrulanacaktır.</p>
</div>
<div class="card"><div class="map"><div class="search">📍 İstanbul · Özel alan</div><div class="pin p1">299₺</div><div class="pin p2">349₺</div><div class="pin p3">449₺</div></div></div>
</section>

<section class="section" id="alanlar">
<span class="eyebrow">Ürün deneyimi</span><h2>Nasıl görünecek?</h2><p class="sub">PatiAlan'ın ilk sürümünde kullanıcılar çit, alan büyüklüğü, gölge, su, otopark ve müsait saate göre özel alan seçecek.</p>
<div class="grid">
<div class="space"><div class="visual">650 m² özel alan</div><div class="body"><div class="meta"><span>Sarıyer</span><span class="badge">Pilot örneği</span></div><h3>Tam çitli geniş yeşil bahçe</h3><div class="chips"><span>Tam çitli</span><span>Su</span><span>Gölge</span></div><div class="price">299 TL <small>/ hedef saatlik başlangıç</small></div></div></div>
<div class="space"><div class="visual">1.200 m² özel alan</div><div class="body"><div class="meta"><span>Büyükçekmece</span><span class="badge">Pilot örneği</span></div><h3>Doğa içinde özel oyun alanı</h3><div class="chips"><span>Agility</span><span>Otopark</span><span>Su</span></div><div class="price">349 TL <small>/ hedef saatlik başlangıç</small></div></div></div>
<div class="space"><div class="visual">900 m² özel alan</div><div class="body"><div class="meta"><span>Beykoz</span><span class="badge">Pilot örneği</span></div><h3>Orman kenarında gölgeli bahçe</h3><div class="chips"><span>Yüksek çit</span><span>Sessiz</span><span>Gölge</span></div><div class="price">449 TL <small>/ hedef saatlik başlangıç</small></div></div></div>
</div>
</section>

<section class="section" id="pilot">
<span class="eyebrow">Ön kayıt</span><h2>İlk kullanıcı ve alan sahiplerini topluyoruz.</h2><p class="sub">Ön kayıt ücretsizdir. Bu form rezervasyon veya ödeme oluşturmaz.</p>
<div class="forms">
<form class="form" data-kind="guest"><h3>Köpek sahibiyim</h3>
<label>Adınız<input name="name" required minlength="2"></label>
<label>E-posta<input name="email" type="email" required></label>
<label>İlçe<input name="district" placeholder="Örn. Kadıköy"></label>
<input name="company" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px">
<button class="btn primary" type="submit">Pilot listesine katıl</button><div class="status"></div></form>
<form class="form" data-kind="host"><h3>Alan sahibiyim</h3>
<label>Adınız<input name="name" required minlength="2"></label>
<label>E-posta<input name="email" type="email" required></label>
<label>Telefon<input name="phone" inputmode="tel"></label>
<label>İlçe<input name="district" required placeholder="Örn. Sarıyer"></label>
<label>Yaklaşık alan (m²)<input name="area_m2" type="number" min="1"></label>
<input name="company" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px">
<button class="btn primary" type="submit">Alanımı ön kayıt yap</button><div class="status"></div></form>
</div>
</section>
<footer class="footer"><strong>PatiAlan · Private Pet Spaces</strong><span>V0.1 İstanbul pilotu · Ödeme henüz açık değildir.</span></footer>
<script>
document.querySelectorAll('form[data-kind]').forEach(form=>{
 form.addEventListener('submit',async e=>{
  e.preventDefault(); const status=form.querySelector('.status'); const btn=form.querySelector('button');
  status.textContent='Gönderiliyor…'; btn.disabled=true;
  const fd=new FormData(form); const body=Object.fromEntries(fd.entries()); body.kind=form.dataset.kind;
  if(body.company){status.textContent='Teşekkürler.';return}
  if(body.area_m2) body.area_m2=Number(body.area_m2); else delete body.area_m2;
  delete body.company;
  try{
   const r=await fetch(location.href,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
   const j=await r.json();
   if(!r.ok) throw new Error(j.error||'Gönderilemedi');
   status.textContent='✓ Ön kaydın alındı.'; form.reset();
  }catch(err){status.textContent='Bir hata oluştu. Lütfen tekrar dene.'}
  finally{btn.disabled=false}
 })
});
</script>
</body></html>`;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  if (req.method === "OPTIONS") return new Response(null, { status: 204 });

  const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}");
  const secret = secretKeys.default ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!secret || !supabaseUrl) return json({ error: "backend_not_configured" }, 500);

  const admin = createClient(supabaseUrl, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (req.method === "GET" && url.searchParams.get("health") === "1") {
    const { count, error } = await admin.from("pilot_leads").select("id", { count: "exact", head: true });
    return json({ ok: !error, service: "patialan-live-pilot", leads: count ?? 0, database: error ? "error" : "ok" }, error ? 500 : 200);
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      if (body.company) return json({ ok: true });
      const kind = body.kind === "host" ? "host" : body.kind === "guest" ? "guest" : null;
      const name = String(body.name ?? "").trim().slice(0, 120);
      const email = String(body.email ?? "").trim().toLowerCase().slice(0, 240);
      const phone = String(body.phone ?? "").trim().slice(0, 40) || null;
      const district = String(body.district ?? "").trim().slice(0, 100) || null;
      const areaM2 = body.area_m2 == null ? null : Number(body.area_m2);

      if (!kind || name.length < 2 || !email.includes("@")) return json({ error: "Geçersiz form." }, 400);
      if (areaM2 !== null && (!Number.isInteger(areaM2) || areaM2 <= 0 || areaM2 > 10000000)) return json({ error: "Alan büyüklüğü geçersiz." }, 400);

      const { error } = await admin.from("pilot_leads").insert({
        kind, name, email, phone, district, area_m2: areaM2, source: "edge_pilot"
      });
      if (error) {
        console.error("pilot_lead_insert_failed", error);
        return json({ error: "Kayıt alınamadı." }, 500);
      }
      return json({ ok: true }, 201);
    } catch {
      return json({ error: "Geçersiz istek." }, 400);
    }
  }

  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=60" },
  });
});
