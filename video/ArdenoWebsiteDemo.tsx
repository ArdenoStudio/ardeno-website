import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

export const VIDEO_WIDTH = 1920;
export const VIDEO_HEIGHT = 1080;
export const VIDEO_FPS = 30;
export const VIDEO_DURATION_FRAMES = 2100;

const RED = "#E50914";
const BG = "#080809";
const PANEL = "#111114";
const TEXT = "#F7F4F0";
const MUTED = "rgba(247,244,240,0.64)";
const HAIRLINE = "rgba(255,255,255,0.09)";
const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
const EASE_IN_OUT = Easing.bezier(0.45, 0, 0.55, 1);
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "Inter, Arial, sans-serif";

type Scene = {
  from: number;
  duration: number;
  image: string;
  number: string;
  eyebrow: string;
  title: string;
  body: string;
  proof: string;
  side: "left" | "right";
  imagePosition?: string;
  highlight?: { x: number; y: number; label: string };
};

const scenes: Scene[] = [
  {
    from: 150,
    duration: 270,
    image: "demo-captures/hero.png",
    number: "01",
    eyebrow: "Landing experience",
    title: "The first screen makes the offer clear immediately.",
    body: "Brand positioning, CTAs, availability, and trust signals sit above the fold without diluting the cinematic feel.",
    proof: "Hero messaging / CTAs / proof points",
    side: "right",
    highlight: { x: 0.17, y: 0.55, label: "Primary CTA" },
  },
  {
    from: 390,
    duration: 270,
    image: "demo-captures/work.png",
    number: "02",
    eyebrow: "Selected work",
    title: "A project archive that shows range at a glance.",
    body: "Hospitality, wellness, events, luxury, food, and aviation concepts are presented in one premium system.",
    proof: "Six showcased project directions",
    side: "left",
    highlight: { x: 0.78, y: 0.57, label: "Live preview" },
  },
  {
    from: 630,
    duration: 270,
    image: "demo-captures/services.png",
    number: "03",
    eyebrow: "Services",
    title: "The service offer is easy to understand and easy to buy.",
    body: "Design, creative development, conversion strategy, and mobile-first execution are separated into clear buying paths.",
    proof: "Four core studio disciplines",
    side: "right",
    highlight: { x: 0.24, y: 0.63, label: "Service cards" },
  },
  {
    from: 870,
    duration: 270,
    image: "demo-captures/process.png",
    number: "04",
    eyebrow: "Process",
    title: "Delivery is framed as a concrete, trackable timeline.",
    body: "Discovery, UX, visual design, development, and launch become a client-friendly framework instead of vague agency language.",
    proof: "Strategy to launch workflow",
    side: "left",
    highlight: { x: 0.72, y: 0.58, label: "Progress model" },
  },
  {
    from: 1110,
    duration: 240,
    image: "demo-captures/about.png",
    number: "05",
    eyebrow: "Studio story",
    title: "The brand has a point of view, not just a portfolio.",
    body: "The about section anchors Ardeno in Colombo while keeping the tone sharp, ambitious, and globally relevant.",
    proof: "Identity / detail / ambition",
    side: "right",
  },
  {
    from: 1320,
    duration: 270,
    image: "demo-captures/ai-assistant.png",
    number: "06",
    eyebrow: "AI assistant",
    title: "Visitors can qualify their project without leaving the page.",
    body: "The assistant answers questions about pricing, timelines, redesigns, portals, and process right inside the site.",
    proof: "Instant project guidance",
    side: "left",
    imagePosition: "center right",
    highlight: { x: 0.88, y: 0.49, label: "Assistant panel" },
  },
  {
    from: 1560,
    duration: 240,
    image: "demo-captures/contact.png",
    number: "07",
    eyebrow: "Contact",
    title: "The final section keeps the next step obvious.",
    body: "Direct email, WhatsApp, social links, and a strong start-project CTA close the loop for serious inquiries.",
    proof: "Email / WhatsApp / social",
    side: "right",
    highlight: { x: 0.32, y: 0.42, label: "Start project" },
  },
  {
    from: 1770,
    duration: 240,
    image: "demo-captures/inquiry.png",
    number: "08",
    eyebrow: "Inquiry flow",
    title: "The conversion moment stays focused and premium.",
    body: "The modal asks for only the useful project details while preserving the Ardeno visual system.",
    proof: "Name / budget / message",
    side: "left",
    highlight: { x: 0.61, y: 0.75, label: "Send message" },
  },
];

const clamp = (
  frame: number,
  input: [number, number],
  output: [number, number],
  easing = EASE_OUT,
) =>
  interpolate(frame, input, output, {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const sceneOpacity = (frame: number, duration: number) => {
  const enter = clamp(frame, [0, 42], [0, 1]);
  const exit = clamp(frame, [duration - 44, duration], [1, 0], Easing.in(Easing.cubic));
  return Math.min(enter, exit);
};

const LogoLockup: React.FC<{ small?: boolean }> = ({ small = false }) => (
  <div style={{ display: "flex", alignItems: "center", gap: small ? 14 : 18 }}>
    <Img
      src={staticFile("ardeno-logo.png")}
      style={{
        width: small ? 42 : 66,
        height: small ? 42 : 66,
        objectFit: "contain",
        filter: "drop-shadow(0 0 22px rgba(229,9,20,0.42))",
      }}
    />
    <div>
      <div
        style={{
          color: TEXT,
          fontFamily: SANS,
          fontWeight: 850,
          fontSize: small ? 15 : 25,
          letterSpacing: small ? 3 : 4,
          lineHeight: 1,
        }}
      >
        ARDENO
      </div>
      <div
        style={{
          color: "rgba(247,244,240,0.72)",
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: small ? 14 : 22,
          letterSpacing: small ? 3 : 4,
          lineHeight: 1.1,
        }}
      >
        STUDIO
      </div>
    </div>
  </div>
);

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const sweep = clamp(Math.sin(frame / 58), [-1, 1], [0.18, 0.42], EASE_IN_OUT);

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(120deg, rgba(229,9,20,0.14), transparent 28%, transparent 68%, rgba(255,255,255,0.04))",
          opacity: sweep,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.055,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${RED}, rgba(255,255,255,0.45), transparent)`,
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(8,8,9,0.1), rgba(8,8,9,0.56)), linear-gradient(90deg, rgba(8,8,9,0.92), rgba(8,8,9,0.45), rgba(8,8,9,0.88))",
        }}
      />
    </AbsoluteFill>
  );
};

const BrowserFrame: React.FC<{ scene: Scene; frame: number }> = ({ scene, frame }) => {
  const isRight = scene.side === "right";
  const mediaIn = clamp(frame, [4, 76], [0, 1]);
  const mediaExit = clamp(frame, [scene.duration - 48, scene.duration], [1, 0], Easing.in(Easing.cubic));
  const panelWidth = 1080;
  const panelHeight = 666;
  const panelLeft = isRight ? 730 : 110;
  const panelTop = 202;
  const imageZoom = clamp(frame, [0, scene.duration], [1.0, 1.055], EASE_IN_OUT);
  const imageY = clamp(frame, [0, scene.duration], [0, -16], EASE_IN_OUT);
  const travel = isRight ? 84 : -84;
  const opacity = mediaIn * mediaExit;

  return (
    <div
      style={{
        position: "absolute",
        left: panelLeft,
        top: panelTop,
        width: panelWidth,
        height: panelHeight,
        opacity,
        transform: `translateX(${interpolate(mediaIn, [0, 1], [travel, 0])}px) scale(${interpolate(
          mediaIn,
          [0, 1],
          [0.965, 1],
        )})`,
        transformOrigin: isRight ? "right center" : "left center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -22,
          borderRadius: 38,
          background: "linear-gradient(135deg, rgba(229,9,20,0.2), rgba(255,255,255,0.04), transparent)",
          opacity: 0.42,
          filter: "blur(18px)",
        }}
      />
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          borderRadius: 30,
          border: `1px solid ${HAIRLINE}`,
          background: PANEL,
          boxShadow: "0 44px 120px rgba(0,0,0,0.64), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            height: 46,
            display: "flex",
            alignItems: "center",
            padding: "0 22px",
            gap: 12,
            borderBottom: "1px solid rgba(255,255,255,0.075)",
            background: "rgba(15,15,18,0.98)",
          }}
        >
          {[RED, "rgba(255,214,88,0.38)", "rgba(75,214,113,0.34)"].map((color) => (
            <div key={color} style={{ width: 11, height: 11, borderRadius: 99, background: color }} />
          ))}
          <div
            style={{
              marginLeft: 18,
              width: 238,
              height: 22,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.075)",
              background: "rgba(255,255,255,0.035)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              color: "rgba(247,244,240,0.42)",
              fontFamily: SANS,
              fontSize: 11,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: 99, background: "#31d979" }} />
            ardenostudio.lk
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 46, bottom: 0, overflow: "hidden" }}>
          <Img
            src={staticFile(scene.image)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: scene.imagePosition ?? "center center",
              transform: `translateY(${imageY}px) scale(${imageZoom})`,
              filter: "saturate(0.98) contrast(1.04)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(0,0,0,0.0), rgba(0,0,0,0.18))",
            }}
          />
        </div>
        {scene.highlight ? <FocusPulse scene={scene} frame={frame} width={panelWidth} height={panelHeight - 46} /> : null}
      </div>
    </div>
  );
};

const FocusPulse: React.FC<{ scene: Scene; frame: number; width: number; height: number }> = ({
  scene,
  frame,
  width,
  height,
}) => {
  if (!scene.highlight) return null;

  const visible = clamp(frame, [92, 126], [0, 1]) * clamp(frame, [scene.duration - 70, scene.duration - 34], [1, 0]);
  const beat = clamp(frame % 42, [0, 18, 42], [0.6, 1, 0.6], EASE_IN_OUT);
  const x = scene.highlight.x * width;
  const y = 46 + scene.highlight.y * height;

  return (
    <div style={{ opacity: visible }}>
      <div
        style={{
          position: "absolute",
          left: x - 24,
          top: y - 24,
          width: 48,
          height: 48,
          borderRadius: 999,
          border: `2px solid ${RED}`,
          transform: `scale(${beat})`,
          boxShadow: "0 0 28px rgba(229,9,20,0.55)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: x - 5,
          top: y - 5,
          width: 10,
          height: 10,
          borderRadius: 999,
          background: RED,
          boxShadow: "0 0 18px rgba(229,9,20,0.88)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: x + 24,
          top: y - 15,
          color: TEXT,
          fontFamily: SANS,
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 2,
          textTransform: "uppercase",
          background: "rgba(8,8,9,0.78)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 999,
          padding: "8px 12px",
        }}
      >
        {scene.highlight.label}
      </div>
    </div>
  );
};

const SceneText: React.FC<{ scene: Scene; frame: number }> = ({ scene, frame }) => {
  const isRightMedia = scene.side === "right";
  const textLeft = isRightMedia ? 112 : 1250;
  const textWidth = isRightMedia ? 520 : 560;
  const textIn = clamp(frame, [26, 82], [0, 1]);
  const textExit = clamp(frame, [scene.duration - 54, scene.duration - 16], [1, 0], Easing.in(Easing.cubic));
  const opacity = textIn * textExit;

  return (
    <div
      style={{
        position: "absolute",
        left: textLeft,
        top: 230,
        width: textWidth,
        opacity,
        transform: `translateY(${interpolate(textIn, [0, 1], [34, 0])}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 28,
          color: RED,
          fontFamily: SANS,
          fontSize: 14,
          fontWeight: 900,
          letterSpacing: 4,
          textTransform: "uppercase",
        }}
      >
        <span style={{ color: "rgba(247,244,240,0.38)", letterSpacing: 2 }}>{scene.number}</span>
        <span style={{ width: 36, height: 2, background: RED, display: "block" }} />
        {scene.eyebrow}
      </div>
      <h2
        style={{
          margin: 0,
          color: TEXT,
          fontFamily: SERIF,
          fontSize: 58,
          lineHeight: 1.02,
          fontWeight: 400,
          letterSpacing: -1.2,
        }}
      >
        {scene.title}
      </h2>
      <p
        style={{
          margin: "28px 0 0",
          color: MUTED,
          fontFamily: SANS,
          fontSize: 21,
          lineHeight: 1.55,
          fontWeight: 500,
        }}
      >
        {scene.body}
      </p>
      <div
        style={{
          marginTop: 34,
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          color: "rgba(247,244,240,0.82)",
          fontFamily: SANS,
          fontSize: 15,
          fontWeight: 800,
          letterSpacing: 1,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.045)",
          borderRadius: 999,
          padding: "12px 16px",
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: 99, background: RED }} />
        {scene.proof}
      </div>
    </div>
  );
};

const DemoScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const opacity = sceneOpacity(frame, scene.duration);

  return (
    <AbsoluteFill style={{ opacity }}>
      <BrowserFrame scene={scene} frame={frame} />
      <SceneText scene={scene} frame={frame} />
    </AbsoluteFill>
  );
};

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const title = clamp(frame, [18, 78], [0, 1]);
  const subtitle = clamp(frame, [74, 128], [0, 1]);
  const fade = clamp(frame, [170, 210], [1, 0], Easing.in(Easing.cubic));

  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <div style={{ position: "absolute", left: 112, top: 86, opacity: title }}>
        <LogoLockup />
      </div>
      <div
        style={{
          position: "absolute",
          left: 112,
          bottom: 158,
          width: 780,
          transform: `translateY(${interpolate(title, [0, 1], [34, 0])}px)`,
          opacity: title,
        }}
      >
        <div
          style={{
            color: RED,
            fontFamily: SANS,
            fontSize: 16,
            fontWeight: 900,
            letterSpacing: 5,
            textTransform: "uppercase",
            marginBottom: 26,
          }}
        >
          Full website demo
        </div>
        <h1
          style={{
            margin: 0,
            color: TEXT,
            fontFamily: SERIF,
            fontSize: 90,
            lineHeight: 0.96,
            fontWeight: 400,
            letterSpacing: -2,
          }}
        >
          Ardeno Studio, from first impression to inquiry.
        </h1>
        <p
          style={{
            color: MUTED,
            fontFamily: SANS,
            fontSize: 24,
            lineHeight: 1.5,
            width: 610,
            marginTop: 30,
            opacity: subtitle,
            transform: `translateY(${interpolate(subtitle, [0, 1], [22, 0])}px)`,
          }}
        >
          A section-by-section walkthrough of the live website experience.
        </p>
      </div>
      <IntroStack frame={frame} />
    </AbsoluteFill>
  );
};

const IntroStack: React.FC<{ frame: number }> = ({ frame }) => {
  const images = ["demo-captures/hero.png", "demo-captures/work.png", "demo-captures/services.png"];
  const progress = clamp(frame, [56, 132], [0, 1]);

  return (
    <div style={{ position: "absolute", right: 122, top: 182, width: 760, height: 650 }}>
      {images.map((image, index) => {
        const offset = index * 34;
        const rotate = [-4, 2.5, -1.5][index];
        const scale = [0.92, 0.96, 1][index];
        return (
          <div
            key={image}
            style={{
              position: "absolute",
              right: offset,
              top: offset,
              width: 650,
              height: 366,
              borderRadius: 26,
              overflow: "hidden",
              border: `1px solid ${HAIRLINE}`,
              background: PANEL,
              boxShadow: "0 34px 90px rgba(0,0,0,0.56)",
              opacity: progress,
              transform: `translateY(${interpolate(progress, [0, 1], [50 + index * 18, 0])}px) rotate(${rotate}deg) scale(${scale})`,
            }}
          >
            <Img src={staticFile(image)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        );
      })}
    </div>
  );
};

const Header: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 56,
      left: 78,
      right: 78,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      zIndex: 20,
    }}
  >
    <LogoLockup small />
    <div
      style={{
        color: "rgba(247,244,240,0.54)",
        fontFamily: SANS,
        fontSize: 13,
        fontWeight: 800,
        letterSpacing: 4,
        textTransform: "uppercase",
      }}
    >
      Website walkthrough
    </div>
  </div>
);

const ProgressRail: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = clamp(frame, [0, VIDEO_DURATION_FRAMES - 1], [0, 1], Easing.linear);

  return (
    <div style={{ position: "absolute", left: 78, right: 78, bottom: 46, zIndex: 30 }}>
      <div style={{ height: 2, background: "rgba(255,255,255,0.1)" }}>
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${RED}, rgba(247,244,240,0.72))`,
          }}
        />
      </div>
      <div
        style={{
          marginTop: 13,
          display: "flex",
          justifyContent: "space-between",
          color: "rgba(247,244,240,0.36)",
          fontFamily: SANS,
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        <span>ardeno-studio-website.vercel.app</span>
        <span>70 second demo</span>
      </div>
    </div>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const intro = clamp(frame, [0, 64], [0, 1]);
  const opacity = sceneOpacity(frame, 150);

  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <Img
        src={staticFile("demo-captures/inquiry.png")}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.22,
          transform: `scale(${clamp(frame, [0, 150], [1.02, 1.08], EASE_IN_OUT)})`,
          filter: "saturate(0.9) contrast(1.08)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(8,8,9,0.56), rgba(8,8,9,0.92)), radial-gradient(circle at 50% 44%, rgba(229,9,20,0.18), transparent 36%)",
        }}
      />
      <div style={{ opacity: intro, transform: `translateY(${interpolate(intro, [0, 1], [28, 0])}px)` }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 38 }}>
          <LogoLockup />
        </div>
        <h2
          style={{
            margin: 0,
            color: TEXT,
            fontFamily: SERIF,
            fontSize: 84,
            lineHeight: 0.98,
            fontWeight: 400,
            letterSpacing: -1.6,
          }}
        >
          Build something iconic.
        </h2>
        <p style={{ marginTop: 28, color: MUTED, fontFamily: SANS, fontSize: 24 }}>
          ardeno-studio-website.vercel.app
        </p>
      </div>
    </AbsoluteFill>
  );
};

export const ArdenoWebsiteDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Background />
      <Header />
      <Sequence from={0} durationInFrames={210} premountFor={30}>
        <Intro />
      </Sequence>
      {scenes.map((scene) => (
        <Sequence key={scene.number} from={scene.from} durationInFrames={scene.duration} premountFor={30}>
          <DemoScene scene={scene} />
        </Sequence>
      ))}
      <Sequence from={1950} durationInFrames={150} premountFor={30}>
        <Outro />
      </Sequence>
      <ProgressRail />
    </AbsoluteFill>
  );
};
