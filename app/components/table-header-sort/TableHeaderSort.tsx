import { ArrowSeparateVertical, NavArrowDown, NavArrowUp } from "iconoir-react";

interface Props {
  sortPropName: string;
  sortPropValue: string;
  label: string;
}

export function TableHeaderSort({ sortPropName, sortPropValue, label }: Props) {
  return (
    <div className="flex gap-4">
      {!sortPropValue && (
        <button type="submit" name={sortPropName} value="desc">
          <ArrowSeparateVertical />
        </button>
      )}
      {sortPropValue &&
        (sortPropValue === "asc" ? (
          <button type="submit" name={sortPropName} value="desc">
            <NavArrowUp />
          </button>
        ) : (
          <button type="submit" name={sortPropName} value="asc">
            <NavArrowDown />
          </button>
        ))}
      {label}
    </div>
  );
}
