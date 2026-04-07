import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** PNG favicon — iOS Safari ignores SVG icons; this route serves a tiny raster. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f5f4",
          borderRadius: 6,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 4,
            left: 21,
            width: 7,
            height: 7,
            borderRadius: 4,
            background: "#facc15",
            border: "1px solid #ca8a04",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 12,
              height: 16,
              background: "#e7e5e4",
              border: "1px solid #78716c",
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              padding: 2,
              gap: 2,
            }}
          >
            <div
              style={{
                height: 3,
                background: "#57534e",
                borderRadius: 1,
              }}
            />
            <div
              style={{
                height: 2,
                background: "#a8a29e",
                borderRadius: 1,
                width: "72%",
              }}
            />
            <div
              style={{
                height: 2,
                background: "#a8a29e",
                borderRadius: 1,
                width: "88%",
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
