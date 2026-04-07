import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon (PNG) — used when saving to Home Screen and for some Safari tabs. */
export default function AppleIcon() {
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
          borderRadius: 40,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 26,
            left: 128,
            width: 36,
            height: 36,
            borderRadius: 18,
            background: "#facc15",
            border: "3px solid #ca8a04",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "rotate(-7deg)",
          }}
        >
          <div
            style={{
              width: 102,
              height: 136,
              background: "#e7e5e4",
              border: "4px solid #78716c",
              borderRadius: 12,
              display: "flex",
              flexDirection: "column",
              padding: 14,
              gap: 10,
            }}
          >
            <div
              style={{
                height: 16,
                background: "#57534e",
                borderRadius: 4,
              }}
            />
            <div
              style={{
                height: 10,
                background: "#a8a29e",
                borderRadius: 4,
                width: "72%",
              }}
            />
            <div
              style={{
                height: 10,
                background: "#a8a29e",
                borderRadius: 4,
                width: "88%",
              }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 12,
                marginTop: 8,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  background: "#ffffff",
                  border: "4px solid #292524",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    background: "#1c1917",
                    marginLeft: 2,
                    marginTop: 2,
                  }}
                />
              </div>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  background: "#ffffff",
                  border: "4px solid #292524",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    background: "#1c1917",
                    marginLeft: -2,
                    marginTop: 4,
                  }}
                />
              </div>
            </div>
            <div
              style={{
                marginTop: 4,
                width: "70%",
                marginLeft: "15%",
                height: 6,
                borderBottom: "4px solid #292524",
                borderRadius: 4,
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
