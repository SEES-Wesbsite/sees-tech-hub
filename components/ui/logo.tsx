import React from "react";

export type LogoVariant = "logomark" | "wordmark" | "horizontal" | "vertical";

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
  textClassName?: string;
}

export function Logo({
  variant = "logomark",
  className = "",
  textClassName = "text-xl font-serif font-semibold tracking-tighter uppercase",
}: LogoProps) {
  const renderLogomark = (customClass?: string) => (
    <div
      className={`flex items-center justify-center bg-brand rounded-full shrink-0 shadow-sm ${customClass}`}
    >
      <img
        src="/logo/logomark.svg"
        alt="SEES Tech Hub"
        className="w-[85%] h-[95%] object-cover mt-1.5"
      />
    </div>
  );

  const renderWordmark = (customClass?: string) => (
    <span className={`text-foreground ${textClassName} ${customClass || ""}`}>
      SEES <span className="text-brand">Tech Hub</span>
    </span>
  );

  if (variant === "logomark") {
    return renderLogomark(className || "w-10 h-10");
  }

  if (variant === "wordmark") {
    return renderWordmark(className);
  }

  if (variant === "horizontal") {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {renderLogomark("w-10 h-10")}
        {renderWordmark()}
      </div>
    );
  }

  if (variant === "vertical") {
    return (
      <div
        className={`flex flex-col items-center gap-3 text-center ${className}`}
      >
        {renderLogomark("w-12 h-12")}
        {renderWordmark()}
      </div>
    );
  }

  return null;
}
