import { Check, WarningCircle } from "iconoir-react";
import { useEffect, useState } from "react";

interface MessageProps {
  successMessage: string | undefined | null;
  errorMessage?: string | undefined | null;
  // The action/fetcher data the messages come from. A new object means a new
  // submission, so the success message is shown again even if its text is the same.
  result?: unknown;
}

export function Message({
  successMessage,
  errorMessage,
  result,
}: MessageProps) {
  const [isActive, setIsActive] = useState(true);
  const [prevResult, setPrevResult] = useState(result);

  if (result !== prevResult) {
    setPrevResult(result);
    setIsActive(true);
  }

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
  }, [isActive, successMessage, result]);

  return (
    <div data-testid="message">
      {isActive && successMessage && (
        <div className="bg-success flex gap-4 rounded-lg p-2 pr-12">
          <Check />
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-error flex gap-4 rounded-lg p-2 pr-12">
          <WarningCircle />
          {errorMessage}
        </div>
      )}
    </div>
  );
}
