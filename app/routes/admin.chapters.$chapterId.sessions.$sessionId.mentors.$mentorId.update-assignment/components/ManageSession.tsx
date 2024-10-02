import type { Option } from "~/components";

import { FloppyDiskArrowIn, Trash } from "iconoir-react";
import { useState } from "react";

import { SelectSearch } from "~/components";

interface Props {
  name: string;
  placeholder: string;
  defaultValue: string | null;
  options: Option[];
}

export function ManageSession({
  name,
  placeholder,
  defaultValue,
  options,
}: Props) {
  const [remove, setRemove] = useState(defaultValue !== null);

  const handleChange = () => {
    setRemove(false);
  };

  return (
    <div className="flex flex-1 items-end gap-4">
      <SelectSearch
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        options={options}
        onChange={handleChange}
        showClearButton
      />

      {remove ? (
        <button
          className="btn btn-error w-48 gap-2"
          type="submit"
          name="action"
          value="remove"
        >
          <Trash />
          Remove
        </button>
      ) : (
        <button
          className="btn btn-primary w-48 gap-2"
          type="submit"
          name="action"
          value="save"
        >
          <FloppyDiskArrowIn />
          Save
        </button>
      )}
    </div>
  );
}
