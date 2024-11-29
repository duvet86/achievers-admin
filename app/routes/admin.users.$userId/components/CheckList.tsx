import { Link, useNavigate } from "react-router";

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
        <WarningTriangle className="h-6 w-6 text-warning" /> Expired
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {isCompleted ? (
        <>
          <Check className="h-6 w-6 text-success" /> Yes
        </>
      ) : (
        <>
          <Xmark className="h-6 w-6 text-error" /> No
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
  const navigate = useNavigate();

  const handleRowClick = (to: string) => () => {
    void navigate(to);
  };

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
          <tr
            className="cursor-pointer hover:bg-base-200"
            onClick={handleRowClick("eoiProfile")}
          >
            <td className="border">
              <div className="flex items-center gap-4">
                <Sparks className="h-6 w-6" />
                Expression of interest
              </div>
            </td>
            <td className="border">
              <div className="flex items-center gap-4">
                <Check className="h-6 w-6 text-success" /> Yes
              </div>
            </td>
            <td className="border">
              <Link
                className="btn btn-neutral btn-xs w-full gap-2"
                to="eoiProfile"
              >
                View
              </Link>
            </td>
          </tr>
          <tr
            className="cursor-pointer hover:bg-base-200"
            onClick={handleRowClick("welcomeCall")}
          >
            <td className="border">
              <div className="flex items-center gap-4">
                <Phone className="h-6 w-6" />
                Welcome call
              </div>
            </td>
            <td className="border">
              <CheckStatus isCompleted={welcomeCallCompleted} />
            </td>
            <td className="border">
              <Link
                className="btn btn-neutral btn-xs w-full gap-2"
                to="welcomeCall"
              >
                View
              </Link>
            </td>
          </tr>
          <tr
            className="cursor-pointer hover:bg-base-200"
            onClick={handleRowClick("references")}
          >
            <td className="border">
              <div className="flex items-center gap-4">
                <MultiBubble className="h-6 w-6" />
                References
              </div>
            </td>
            <td className="border">
              <CheckStatus isCompleted={referencesCompleted} />
            </td>
            <td className="border">
              <Link
                className="btn btn-neutral btn-xs w-full gap-2"
                to="references"
              >
                View
              </Link>
            </td>
          </tr>
          <tr
            className="cursor-pointer hover:bg-base-200"
            onClick={handleRowClick("induction")}
          >
            <td className="border">
              <div className="flex items-center gap-4">
                <Journal className="h-6 w-6" />
                Induction
              </div>
            </td>
            <td className="border">
              <CheckStatus isCompleted={inductionCompleted} />
            </td>
            <td className="border">
              <Link
                className="btn btn-neutral btn-xs w-full gap-2"
                to="induction"
              >
                View
              </Link>
            </td>
          </tr>
          <tr
            className="cursor-pointer hover:bg-base-200"
            onClick={handleRowClick("police-check")}
          >
            <td className="border">
              <div className="flex items-center gap-4">
                <ShieldCheck className="h-6 w-6" />
                Police check
              </div>
            </td>
            <td className="border">
              <CheckStatus
                isCompleted={policeCheckCompleted}
                isExpired={isPoliceCheckExpired}
              />
            </td>
            <td className="border">
              <Link
                className="btn btn-neutral btn-xs w-full gap-2"
                to="police-check"
              >
                View
              </Link>
            </td>
          </tr>
          <tr
            className="cursor-pointer hover:bg-base-200"
            onClick={handleRowClick("wwc-check")}
          >
            <td className="border">
              <div className="flex items-center gap-4">
                <Group className="h-6 w-6" />
                WWC check
              </div>
            </td>
            <td className="border">
              <CheckStatus
                isCompleted={wwcCheckCompleted}
                isExpired={isWwcCheckExpired}
              />
            </td>
            <td className="border">
              <Link
                className="btn btn-neutral btn-xs w-full gap-2"
                to="wwc-check"
              >
                View
              </Link>
            </td>
          </tr>
          <tr
            className="cursor-pointer hover:bg-base-200"
            onClick={handleRowClick("approval-mrc")}
          >
            <td className="border">
              <div className="flex items-center gap-4">
                <ThumbsUp className="h-6 w-6" />
                Approval by MRC
              </div>
            </td>
            <td className="border">
              <CheckStatus isCompleted={approvalbyMRCCompleted} />
            </td>
            <td className="border">
              <Link
                className="btn btn-neutral btn-xs w-full gap-2"
                to="approval-mrc"
              >
                View
              </Link>
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
