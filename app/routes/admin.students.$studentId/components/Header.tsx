import { BinFull, NavArrowDown, OnTag, WarningTriangle } from "iconoir-react";

import { Message, StateLink, Title } from "~/components";

interface Props {
  title: string;
  endDate: Date | null | undefined;
  successMessage?: string;
}

export function Header({ title, endDate, successMessage }: Props) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:gap-10">
      <Title>{title}</Title>

      <Message key={Date.now()} successMessage={successMessage} />

      {endDate && (
        <p
          title="archived"
          className="bg-error mb-4 flex items-center gap-2 rounded-sm px-6 py-2"
        >
          <WarningTriangle className="h-6 w-6" />
          This student is archived!
        </p>
      )}

      <div className="flex-1"></div>

      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn w-full gap-2 sm:w-40">
          Actions
          <NavArrowDown className="h-6 w-6" />
        </div>
        <ul
          tabIndex={0}
          className="menu dropdown-content rounded-box border-base-300 bg-base-100 w-52 border p-2 shadow-sm"
        >
          {endDate ? (
            <li>
              <StateLink
                to="re-enable"
                relative="path"
                className="text-success gap-4 font-semibold"
              >
                <OnTag className="h-6 w-6" />
                Re enable student
              </StateLink>
            </li>
          ) : (
            <li>
              <StateLink
                to="archive"
                className="text-error gap-4 font-semibold"
              >
                <BinFull className="h-6 w-6" />
                Archive
              </StateLink>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
