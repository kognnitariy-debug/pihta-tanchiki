export function PixelTank() {
  return (
    <div className="pixel-tank" aria-label="Пиксельный танчик" role="img">
      <span className="tank-turret" />
      <span className="tank-body" />
      <span className="tank-track tank-track-left" />
      <span className="tank-track tank-track-right" />
      <span className="tank-barrel" />
    </div>
  );
}
