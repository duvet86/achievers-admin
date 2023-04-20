import { SaveActionFloppy } from "iconoir-react";

interface Props {
  label?: string;
  message?: string | null;
  sticky?: boolean;
}

export function SubmitFormButton({ message, sticky, label = "Save" }: Props) {
  const className = "mt-6 flex items-center justify-between";

  return (
    <div
      data-testid="container"
      className={sticky ? className + " sticky bottom-0" : className}
    >
      <div
        data-testid="message"
        className={message ? "bg-white p-2 font-medium text-error" : ""}
      >
        {message}
      </div>

      <button className="btn-primary btn w-52 gap-5" type="submit">
        <SaveActionFloppy className="h-6 w-6" />
        {label}
      </button>
    </div>
  );
}
