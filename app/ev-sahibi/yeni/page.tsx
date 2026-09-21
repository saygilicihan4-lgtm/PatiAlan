import { createListing } from "./actions";

export default async function NewHostListingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <section className="section narrow">
      <span className="eyebrow">Alan başvurusu</span>
      <h1>İlk alanını ekle</h1>
      <p className="lead">Alan önce taslak olarak oluşturulur. Doğrulama tamamlanmadan yayınlanamaz.</p>
      {params.error ? <p className="notice errorNotice">{params.error}</p> : null}
      <form className="form" action={createListing}>
        <label>Alan adı<input name="title" placeholder="Örn. Sarıyer geniş bahçe" required /></label>
        <div className="form2">
          <label>İl<select name="city" defaultValue="İstanbul"><option>İstanbul</option></select></label>
          <label>İlçe<input name="district" placeholder="Sarıyer" required /></label>
        </div>
        <div className="form2">
          <label>Alan büyüklüğü (m²)<input name="area_m2" type="number" min="1" placeholder="650" required /></label>
          <label>Çit yüksekliği (cm)<input name="fence_height_cm" type="number" min="0" placeholder="180" required /></label>
        </div>
        <div className="form2">
          <label>Saatlik fiyat (TL)<input name="hourly_price_tl" type="number" min="100" step="1" defaultValue="299" required /></label>
          <label>Alan tamamen kapalı mı?<select name="fully_fenced" defaultValue="yes"><option value="yes">Evet</option><option value="no">Hayır / kısmen</option></select></label>
        </div>
        <div className="form2">
          <label>Her gün başlangıç<input name="start_local" type="time" defaultValue="08:00" required /></label>
          <label>Her gün bitiş<input name="end_local" type="time" defaultValue="22:00" required /></label>
        </div>
        <label>Kısa açıklama<textarea name="description" rows={5} placeholder="Alanı, zemini ve çevresini açıklayın..." required /></label>
        <label className="check"><input name="usage_right" type="checkbox" required /> Alanı kiralamaya/kullandırmaya yetkili olduğumu beyan ederim.</label>
        <button className="primary" type="submit">Taslak alanı oluştur</button>
      </form>
    </section>
  );
}
