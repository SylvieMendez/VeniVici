const Gallery = ({ images, onSelect }) => {
  const normalized = (images || []).map((it) =>
    typeof it === "string" ? { url: it } : it
  );

  return (
    <ul className="image-container">
      {normalized.map((pic, index) => (
        <li className="gallery" key={`${pic.url}-${index}`}>
          <button
            type="button"
            className="thumb-button"
            onClick={() => onSelect && onSelect(pic)}
            title={pic.title ? `Show ${pic.title}` : "Show this artwork"}
          >
            <img
              className="gallery-screenshot"
              src={pic.url}
              alt={pic.title || "Previous result"}
              width="120"
              height="120"
            />
          </button>
          {(pic.maker || pic.culture) && (
            <div className="thumb-caption">
              {pic.maker ? <div>{pic.maker}</div> : null}
              {pic.culture ? <div>{pic.culture}</div> : null}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

export default Gallery;
