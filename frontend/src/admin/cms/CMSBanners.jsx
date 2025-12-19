import "./CMSStyles.css";

export default function CMSBanners() {
  return (
    <div className="cms-container">
      <div className="cms-header">
        <h1>Banner Management</h1>
        <p>Manage homepage banners and promotional sliders</p>
      </div>

      <div className="cms-page-list">
        <div className="cms-page-card">
          <div>
            <h4>Homepage Main Banner</h4>
            <small>Top hero banner</small>
          </div>
          <button className="cms-btn small">Manage</button>
        </div>

        <div className="cms-page-card">
          <div>
            <h4>Offer Slider</h4>
            <small>Seasonal promotions</small>
          </div>
          <button className="cms-btn small">Manage</button>
        </div>

        <div className="cms-page-card">
          <div>
            <h4>Category Banners</h4>
            <small>Category landing pages</small>
          </div>
          <button className="cms-btn small">Manage</button>
        </div>
      </div>
    </div>
  );
}
