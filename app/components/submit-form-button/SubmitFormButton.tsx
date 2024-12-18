import classnames from "classnames";
import { FloppyDiskArrowIn } from "iconoir-react";

import { Message } from "../message/Message";

interface Props {
  label?: string;
  successMessage?: string | null;
  errorMessage?: string | null;
  sticky?: boolean;
  className?: string;
  disabled?: boolean;
}

export function SubmitFormButton({
  successMessage,
  errorMessage,
  sticky,
  className,
  label = "Save",
  disabled = false,
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

      <button
        className="btn btn-primary w-48 gap-2"
        type="submit"
        disabled={disabled}
      >
        <FloppyDiskArrowIn className="h-6 w-6" />
        {label}
      </button>
    </div>
  );
}
