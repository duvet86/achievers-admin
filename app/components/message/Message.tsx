import { Check, WarningCircle } from "iconoir-react";
import { useEffect, useState } from "react";

interface MessageProps {
  successMessage: string | undefined | null;
  errorMessage: string | undefined | null;
}

export function Message({ successMessage, errorMessage }: MessageProps) {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    let n: number | undefined;
    if (isActive) {
      n = window.setTimeout(() => {
        setIsActive(false);
      }, 3000);
    }

    return () => {
      if (n) {
        clearTimeout(n);
      }
    };
  }, [isActive, successMessage]);

  return (
    <div data-testid="message">
      {isActive && successMessage && (
        <div className="flex gap-4 rounded-lg bg-success p-3 pr-12">
          <Check />
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="flex gap-4 rounded-lg bg-error p-3 pr-12">
          <WarningCircle />
          {errorMessage}
        </div>
      )}
    </div>
  );
}
