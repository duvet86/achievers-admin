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
      className={classnames("z-10 flex", className, {
        "sticky bottom-0": sticky,
      })}
    >
      <Message
        // eslint-disable-next-line react-hooks/purity
        key={Date.now()}
        errorMessage={errorMessage}
        successMessage={successMessage}
      />

      <button
        className="btn btn-primary w-48"
        type="submit"
        disabled={disabled}
      >
        <FloppyDiskArrowIn />
        {label}
      </button>
    </div>
  );
}
