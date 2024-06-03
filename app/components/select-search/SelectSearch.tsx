/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useEffect, useRef, useState } from "react";

import { Xmark } from "iconoir-react";
import { useClientRect } from "~/services";

interface Option {
  label: string;
  value: string;
}

interface Props {
  name: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  showClearButton?: boolean;
  options: Option[];
}

export function SelectSearch({
  options,
  name,
  label,
  placeholder,
  defaultValue,
  showClearButton,
}: Props) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedValue, setSelectedValue] = useState<Option>(() => {
    if (defaultValue) {
      const selectedvalue = options.find(({ value }) => value === defaultValue);

      if (selectedvalue) {
        return selectedvalue;
      }
    }

    return {
      label: "",
      value: "",
    };
  });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [rect, ref] = useClientRect<HTMLDivElement>();

  useEffect(() => {
    const resetHandler = () => {
      setSelectedValue({
        label: "",
        value: "",
      });
    };

    inputRef.current?.form?.addEventListener("reset", resetHandler);

    return () => document.removeEventListener("reset", resetHandler);
  }, []);

  const onOptionClick = (option: Option) => () => {
    setSelectedValue(option);

    inputRef.current!.value = option.value;

    (document.activeElement as HTMLElement).blur();
  };

  const onClearSelection = () => {
    setSelectedValue({
      label: "",
      value: "",
    });
  };

  const viewOptions =
    searchTerm.trim() === ""
      ? options
      : options.filter((item) =>
          item.label.toLowerCase().includes(searchTerm.toLowerCase()),
        );

  return (
    <div
      className="dropdown w-full"
      ref={ref}
      onClick={() => searchInputRef.current?.focus()}
    >
      <label htmlFor={name} className="label">
        <span className="label-text">{label}</span>
      </label>

      <div className="join w-full">
        <input
          type="text"
          className="input join-item input-bordered flex-1"
          value={selectedValue.label}
          placeholder={label ?? placeholder}
          readOnly
        />
        {showClearButton && (
          <div
            className="btn join-item text-error"
            data-testid="clear-text"
            onClick={onClearSelection}
          >
            <Xmark className="h-6 w-6" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        className="hidden"
        type="text"
        name={name}
        data-testid="autocomplete-hidden"
      />

      <ul
        className="menu dropdown-content z-[1] max-h-80 flex-nowrap overflow-auto rounded-box bg-base-100 p-0 shadow"
        style={{ width: rect.width }}
      >
        {viewOptions.length === 0 ? (
          <li>
            <button className="italic" onClick={(e) => e.preventDefault()}>
              No items
            </button>
          </li>
        ) : (
          <li className="sticky top-0 z-10 mb-4 bg-white p-2">
            <input
              type="text"
              className="input input-bordered text-white"
              placeholder="Start typing to search..."
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
            />
          </li>
        )}
        {viewOptions.map((option, index) => (
          <li key={index}>
            <button onClick={onOptionClick(option)}>{option.label}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
