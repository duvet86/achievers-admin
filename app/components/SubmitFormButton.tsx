import { useEffect, useState } from "react";
import classnames from "classnames";

import { Check, FloppyDiskArrowIn, WarningCircle } from "iconoir-react";

interface Props {
  label?: string;
  successMessage: string | null | undefined;
  errorMessage?: string | null;
  sticky?: boolean;
  className?: string;
}

export function SubmitFormButton({
  successMessage,
  errorMessage,
  sticky,
  className,
  label = "Save",
}: Props) {
  return (
    <div
      data-testid="container"
      className={classnames("flex", className, {
        "sticky bottom-0": sticky,
      })}
    >
      <Message
        key={Date.now()}
        errorMessage={errorMessage}
        successMessage={successMessage}
      />

      <button className="btn btn-primary w-52 gap-5" type="submit">
        <FloppyDiskArrowIn className="h-6 w-6" />
        {label}
      </button>
    </div>
  );
}

interface MessageProps {
  successMessage: string | undefined | null;
  errorMessage: string | undefined | null;
}

function Message({ successMessage, errorMessage }: MessageProps) {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
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
  }, [isActive]);

  return (
    <div data-testid="message">
      {isActive && successMessage && (
        <div className="alert alert-success pr-12">
          <Check />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="alert alert-error pr-12">
          <WarningCircle />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
