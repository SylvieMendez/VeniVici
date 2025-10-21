import { useState } from "react";
import Gallery from "../components/Gallery.jsx";
import "./App.css";

const ACCESS_KEY = import.meta.env.VITE_APP_ACCESS_KEY;

const RENDER_WIDTH = 800;
const RENDER_HEIGHT = 800;

export default function App() {
  const [currentImage, setCurrentImage] = useState(null);
  const [currentMeta, setCurrentMeta] = useState(null); 
  const [prevImages, setPrevImages] = useState([]);     
  const [ban, setBan] = useState({
    maker: new Set(),
    culture: new Set(),
    classification: new Set(),
  });
  const [loading, setLoading] = useState(false);

  const buildObjectUrl = () => {
    const params = new URLSearchParams({
      apikey: ACCESS_KEY,
      hasimage: "1",
      size: "1",
      fields: [
        "objectid",
        "title",
        "people",
        "culture",
        "classification",
        "primaryimageurl",
        "images",
        "dated",
      ].join(","),
      sort: "random",
    });
    return `https://api.harvardartmuseums.org/object?${params.toString()}`;
  };

  const pickImageUrl = (rec) =>
    rec?.primaryimageurl || rec?.images?.[0]?.baseimageurl || null;

  const pickAttributes = (rec) => ({
    maker: rec?.people?.[0]?.name || "Unknown maker",
    culture: rec?.culture || "Unknown culture",
    classification: rec?.classification || "Unclassified",
  });

  const isBanned = (attrs) =>
    ban.maker.has(attrs.maker) ||
    ban.culture.has(attrs.culture) ||
    ban.classification.has(attrs.classification);

  const fetchRandom = async () => {
    setLoading(true);
    try {
      for (let tries = 0; tries < 8; tries++) {
        const url = buildObjectUrl();
        const res = await fetch(url);
        const data = await res.json();
        const rec = data?.records?.[0];
        if (!rec) continue;

        const img = pickImageUrl(rec);
        if (!img) continue;

        const attrs = pickAttributes(rec);
        if (isBanned(attrs)) continue;

        const withSize = `${img}?width=${RENDER_WIDTH}&height=${RENDER_HEIGHT}`;

        setCurrentImage(withSize);
        const meta = {
          title: rec.title || "Untitled",
          dated: rec.dated || "",
          ...attrs,
        };
        setCurrentMeta(meta);
        setPrevImages((arr) => [{ url: withSize, ...meta }, ...arr]);
        return;
      }
      alert("Everything I found matches your Ban List. Remove some bans and try again.");
    } catch {
      alert("Fetch failed—check your Harvard API key and network.");
    } finally {
      setLoading(false);
    }
  };

  const toggleBan = (key, value) => {
    setBan((prev) => {
      const next = { ...prev, [key]: new Set(prev[key]) };
      next[key].has(value) ? next[key].delete(value) : next[key].add(value);
      return next;
    });
  };

  return (
    <div className="layout">
      <aside className="panel panel--left">
        <h3>Who have we seen so far?</h3>
        <Gallery
          images={prevImages}
          onSelect={(item) => {
            setCurrentImage(item.url);
            setCurrentMeta({
              title: item.title,
              maker: item.maker,
              culture: item.culture,
              classification: item.classification,
              dated: item.dated,
            });
          }}
        />
      </aside>

      <main className="center">
        <h1 className="title">Veni Vici!</h1>
        <p className="subtitle">Discover artworks from the Harvard Art Museums</p>

        <div className="card">
          {currentMeta?.title && <h2 className="object-title">{currentMeta.title}</h2>}
          {currentImage ? (
            <>
              <div className="chip-row">
                {currentMeta?.maker && (
                  <button
                    className={`chip ${ban.maker.has(currentMeta.maker) ? "chip--banned" : ""}`}
                    onClick={() => toggleBan("maker", currentMeta.maker)}
                    title="Ban/unban this maker"
                  >
                    {currentMeta.maker}
                  </button>
                )}
                {currentMeta?.culture && (
                  <button
                    className={`chip ${ban.culture.has(currentMeta.culture) ? "chip--banned" : ""}`}
                    onClick={() => toggleBan("culture", currentMeta.culture)}
                    title="Ban/unban this culture"
                  >
                    {currentMeta.culture}
                  </button>
                )}
                {currentMeta?.classification && (
                  <button
                    className={`chip ${ban.classification.has(currentMeta.classification) ? "chip--banned" : ""}`}
                    onClick={() => toggleBan("classification", currentMeta.classification)}
                    title="Ban/unban this classification"
                  >
                    {currentMeta.classification}
                  </button>
                )}
              </div>

              <div className="image-wrap">
                <img
                  src={currentImage}
                  alt={currentMeta?.title || "Artwork"}
                  className="hero-image"
                />
              </div>
            </>
          ) : (
            <div className="placeholder">Click Discover to start!</div>
          )}

          <button className="discover" onClick={fetchRandom} disabled={loading}>
            {loading ? "Discovering…" : "🔎 Discover"}
          </button>
        </div>
      </main>

      <aside className="panel panel--right">
        <h3>Ban List</h3>
        <p className="muted">Click an attribute chip to add/remove it here.</p>

        {["maker", "culture", "classification"].map((k) => (
          <div key={k} className="ban-group">
            <div className="ban-label">{k}</div>
            <div className="ban-chips">
              {[...ban[k]].length ? (
                [...ban[k]].map((v) => (
                  <button key={v} className="pill" onClick={() => toggleBan(k, v)}>
                    {v} ✕
                  </button>
                ))
              ) : (
                <div className="muted small">(empty)</div>
              )}
            </div>
          </div>
        ))}
      </aside>
    </div>
  );
}
