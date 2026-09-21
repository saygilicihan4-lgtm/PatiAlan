import { headers } from "next/headers";
import { login, signup } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const params = await searchParams;
  const headerStore = await headers();
  const host = headerStore.get("host") ?? "";
  const protocol = headerStore.get("x-forwarded-proto") ?? "https";
  const origin = host ? `${protocol}://${host}` : "";
  const next = params.next?.startsWith("/") ? params.next : "/panel";

  return (
    <section className="section narrow">
      <span className="eyebrow">PatiAlan hesabı</span>
      <h1>Giriş yap veya hesap oluştur</h1>
      <p className="lead">Rezervasyon ve alan yönetimi için hesabını kullan.</p>
      {params.error ? <p className="notice errorNotice">{params.error}</p> : null}
      {params.message ? <p className="notice">{params.message}</p> : null}

      <div className="authGrid">
        <form className="form" action={login}>
          <h2>Giriş</h2>
          <input type="hidden" name="next" value={next} />
          <label>E-posta<input name="email" type="email" autoComplete="email" required /></label>
          <label>Şifre<input name="password" type="password" autoComplete="current-password" required /></label>
          <button className="primary" type="submit">Giriş yap</button>
        </form>

        <form className="form" action={signup}>
          <h2>Yeni hesap</h2>
          <input type="hidden" name="origin" value={origin} />
          <label>Ad<input name="display_name" autoComplete="name" required /></label>
          <label>E-posta<input name="email" type="email" autoComplete="email" required /></label>
          <label>Şifre<input name="password" type="password" minLength={8} autoComplete="new-password" required /></label>
          <button className="secondary" type="submit">Hesap oluştur</button>
        </form>
      </div>
    </section>
  );
}
