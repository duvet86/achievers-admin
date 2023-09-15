import type { SerializeFrom } from "@remix-run/node";
import type { loader } from "../index";

import { Link } from "@remix-run/react";

import {
  Sparks,
  Phone,
  MultiBubble,
  Journal,
  ShieldCheck,
  Group,
  Check,
  VerifiedUser,
  Cancel,
  ThumbsUp,
} from "iconoir-react";
import dayjs from "dayjs";

interface Props {
  loaderData: SerializeFrom<typeof loader>;
}

interface CheckStatusProps {
  isCompleted: boolean;
}

function CheckStatus({ isCompleted }: CheckStatusProps) {
  return (
    <div className="flex items-center gap-4">
      {isCompleted ? (
        <>
          <Check className="h-6 w-6 text-success" /> Yes
        </>
      ) : (
        <>
          <Cancel className="h-6 w-6 text-error" /> No
        </>
      )}
    </div>
  );
}

export function CheckList({
  loaderData: {
    welcomeCallCompleted,
    referencesCompleted,
    inductionCompleted,
    policeCheckCompleted,
    wwcCheckCompleted,
    approvalbyMRCCompleted,
    volunteerAgreementSignedOn,
  },
}: Props) {
  return (
    <div className="overflow-auto">
      <table className="table">
        <thead>
          <tr>
            <th align="left" className="p-2">
              Check list
            </th>
            <th align="left" className="p-2">
              Completed
            </th>
            <th align="center" className="p-2">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td className="border p-2">
              <div className="flex items-center gap-4">
                <Sparks className="h-6 w-6" />
                Expression of interest
              </div>
            </td>
            <td className="border p-2">
              <div className="flex items-center gap-4">
                <Check className="h-6 w-6 text-success" /> Yes
              </div>
            </td>
            <td className="border p-2">
              <Link
                className="btn btn-xs w-full gap-2"
                to="eoiProfile"
                relative="path"
              >
                View
              </Link>
            </td>
          </tr>
          <tr>
            <td className="border p-2">
              <div className="flex items-center gap-4">
                <Phone className="h-6 w-6" />
                Welcome call
              </div>
            </td>
            <td className="border p-2">
              <CheckStatus isCompleted={welcomeCallCompleted} />
            </td>
            <td className="border p-2">
              <Link
                className="btn btn-xs w-full gap-2"
                to="welcomeCall"
                relative="path"
              >
                View
              </Link>
            </td>
          </tr>
          <tr>
            <td className="border p-2">
              <div className="flex items-center gap-4">
                <MultiBubble className="h-6 w-6" />
                References
              </div>
            </td>
            <td className="border p-2">
              <CheckStatus isCompleted={referencesCompleted} />
            </td>
            <td className="border p-2">
              <Link
                className="btn btn-xs w-full gap-2"
                to="references"
                relative="path"
              >
                View
              </Link>
            </td>
          </tr>
          <tr>
            <td className="border p-2">
              <div className="flex items-center gap-4">
                <Journal className="h-6 w-6" />
                Induction
              </div>
            </td>
            <td className="border p-2">
              <CheckStatus isCompleted={inductionCompleted} />
            </td>
            <td className="border p-2">
              <Link
                className="btn btn-xs w-full gap-2"
                to="induction"
                relative="path"
              >
                View
              </Link>
            </td>
          </tr>
          <tr>
            <td className="border p-2">
              <div className="flex items-center gap-4">
                <ShieldCheck className="h-6 w-6" />
                Police check
              </div>
            </td>
            <td className="border p-2">
              <CheckStatus isCompleted={policeCheckCompleted} />
            </td>
            <td className="border p-2">
              <Link
                className="btn btn-xs w-full gap-2"
                to="police-check"
                relative="path"
              >
                View
              </Link>
            </td>
          </tr>
          <tr>
            <td className="border p-2">
              <div className="flex items-center gap-4">
                <Group className="h-6 w-6" />
                WWC check
              </div>
            </td>
            <td className="border p-2">
              <CheckStatus isCompleted={wwcCheckCompleted} />
            </td>
            <td className="border p-2">
              <Link
                className="btn btn-xs w-full gap-2"
                to="wwc-check"
                relative="path"
              >
                View
              </Link>
            </td>
          </tr>
          <tr>
            <td className="border p-2">
              <div className="flex items-center gap-4">
                <ThumbsUp className="h-6 w-6" />
                Approval by MRC
              </div>
            </td>
            <td className="border p-2">
              <CheckStatus isCompleted={approvalbyMRCCompleted} />
            </td>
            <td className="border p-2">
              <Link
                className="btn btn-xs w-full gap-2"
                to="approval-mrc"
                relative="path"
              >
                View
              </Link>
            </td>
          </tr>
        </tbody>

        <tfoot>
          <tr>
            <th className="p-2">
              <div className="flex items-center gap-4">
                <VerifiedUser className="h-6 w-6" />
                Volunteer agreement
              </div>
            </th>
            <th className="p-2">
              <CheckStatus isCompleted={volunteerAgreementSignedOn !== null} />
            </th>
            <th className="p-2">
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
