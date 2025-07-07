import dayjs from "dayjs";
import {
  Sparks,
  Phone,
  MultiBubble,
  Journal,
  ShieldCheck,
  Group,
  Check,
  UserBadgeCheck,
  Xmark,
  ThumbsUp,
  WarningTriangle,
} from "iconoir-react";

import { StateLink } from "~/components";

interface Props {
  isWwcCheckExpired: boolean;
  isPoliceCheckExpired: boolean;
  welcomeCallCompleted: boolean;
  referencesCompleted: boolean;
  inductionCompleted: boolean;
  policeCheckCompleted: boolean;
  wwcCheckCompleted: boolean;
  approvalbyMRCCompleted: boolean;
  volunteerAgreementSignedOn: Date | null;
}

interface CheckStatusProps {
  isCompleted: boolean;
  isExpired?: boolean;
}

function CheckStatus({ isCompleted, isExpired }: CheckStatusProps) {
  if (isExpired) {
    return (
      <div className="flex items-center gap-4">
        <WarningTriangle className="text-warning h-6 w-6" /> Expired
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {isCompleted ? (
        <>
          <Check className="text-success h-6 w-6" /> Yes
        </>
      ) : (
        <>
          <Xmark className="text-error h-6 w-6" /> No
        </>
      )}
    </div>
  );
}

export function CheckList({
  isWwcCheckExpired,
  isPoliceCheckExpired,
  welcomeCallCompleted,
  referencesCompleted,
  inductionCompleted,
  policeCheckCompleted,
  wwcCheckCompleted,
  approvalbyMRCCompleted,
  volunteerAgreementSignedOn,
}: Props) {
  return (
    <div className="overflow-auto bg-white">
      <table className="table">
        <thead>
          <tr>
            <th align="left">Check list</th>
            <th align="left">Completed</th>
            <th align="center">Action</th>
          </tr>
        </thead>

        <tbody>
          <tr className="hover:bg-base-200">
            <td>
              <div className="flex items-center gap-4">
                <Sparks className="h-6 w-6" />
                Expression of interest
              </div>
            </td>
            <td>
              <div className="flex items-center gap-4">
                <Check className="text-success h-6 w-6" /> Yes
              </div>
            </td>
            <td>
              <StateLink
                className="btn btn-neutral btn-xs w-full gap-2"
                to="eoiProfile"
              >
                View
              </StateLink>
            </td>
          </tr>
          <tr className="hover:bg-base-200">
            <td>
              <div className="flex items-center gap-4">
                <Phone className="h-6 w-6" />
                Welcome call
              </div>
            </td>
            <td>
              <CheckStatus isCompleted={welcomeCallCompleted} />
            </td>
            <td>
              <StateLink
                className="btn btn-neutral btn-xs w-full gap-2"
                to="welcomeCall"
              >
                View
              </StateLink>
            </td>
          </tr>
          <tr className="hover:bg-base-200">
            <td>
              <div className="flex items-center gap-4">
                <MultiBubble className="h-6 w-6" />
                References
              </div>
            </td>
            <td>
              <CheckStatus isCompleted={referencesCompleted} />
            </td>
            <td>
              <StateLink
                className="btn btn-neutral btn-xs w-full gap-2"
                to="references"
              >
                View
              </StateLink>
            </td>
          </tr>
          <tr className="hover:bg-base-200">
            <td>
              <div className="flex items-center gap-4">
                <Journal className="h-6 w-6" />
                Induction
              </div>
            </td>
            <td>
              <CheckStatus isCompleted={inductionCompleted} />
            </td>
            <td>
              <StateLink
                className="btn btn-neutral btn-xs w-full gap-2"
                to="induction"
              >
                View
              </StateLink>
            </td>
          </tr>
          <tr className="hover:bg-base-200">
            <td>
              <div className="flex items-center gap-4">
                <ShieldCheck className="h-6 w-6" />
                Police check
              </div>
            </td>
            <td>
              <CheckStatus
                isCompleted={policeCheckCompleted}
                isExpired={isPoliceCheckExpired}
              />
            </td>
            <td>
              <StateLink
                className="btn btn-neutral btn-xs w-full gap-2"
                to="police-check"
              >
                View
              </StateLink>
            </td>
          </tr>
          <tr className="hover:bg-base-200">
            <td>
              <div className="flex items-center gap-4">
                <Group className="h-6 w-6" />
                WWC check
              </div>
            </td>
            <td>
              <CheckStatus
                isCompleted={wwcCheckCompleted}
                isExpired={isWwcCheckExpired}
              />
            </td>
            <td>
              <StateLink
                className="btn btn-neutral btn-xs w-full gap-2"
                to="wwc-check"
              >
                View
              </StateLink>
            </td>
          </tr>
          <tr className="hover:bg-base-200">
            <td>
              <div className="flex items-center gap-4">
                <ThumbsUp className="h-6 w-6" />
                Approval by MRC
              </div>
            </td>
            <td>
              <CheckStatus isCompleted={approvalbyMRCCompleted} />
            </td>
            <td>
              <StateLink
                className="btn btn-neutral btn-xs w-full gap-2"
                to="approval-mrc"
              >
                View
              </StateLink>
            </td>
          </tr>
        </tbody>

        <tfoot>
          <tr>
            <th>
              <div className="flex items-center gap-4">
                <UserBadgeCheck className="h-6 w-6" />
                Volunteer agreement
              </div>
            </th>
            <th>
              <CheckStatus isCompleted={volunteerAgreementSignedOn !== null} />
            </th>
            <th>
              {volunteerAgreementSignedOn
                ? dayjs(volunteerAgreementSignedOn).format("YYYY-MM-DD")
                : "-"}
            </th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
