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
      <div data-testid="message">
        {successMessage && (
          <div className="alert alert-success">
            <Check />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="alert alert-error">
            <WarningCircle />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      <button className="btn-primary btn w-52 gap-5" type="submit">
        <SaveActionFloppy className="h-6 w-6" />
        {label}
      </button>
    </div>
  );
}
