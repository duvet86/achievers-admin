import { useEffect, useState } from "react";

import { Check, SaveActionFloppy, WarningCircle } from "iconoir-react";

interface Props {
  label?: string;
  successMessage?: string | null;
  errorMessage?: string | null;
  sticky?: boolean;
}

export function SubmitFormButton({
  successMessage,
  errorMessage,
  sticky,
  label = "Save",
}: Props) {
  const className = "mt-6 flex items-center justify-between";

  return (
    <div
      data-testid="container"
      className={sticky ? className + " sticky bottom-0" : className}
    >
      <Message
        key={Date.now()}
        errorMessage={errorMessage}
        successMessage={successMessage}
      />

      <button className="btn btn-primary w-52 gap-5" type="submit">
        <SaveActionFloppy className="h-6 w-6" />
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
