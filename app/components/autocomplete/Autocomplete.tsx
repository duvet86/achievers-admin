import { useEffect, useState } from "react";

import { Xmark } from "iconoir-react";
import { useClientRect } from "~/services";

interface AutocompleteOption {
  label: string;
  value: string;
}

interface Props {
  name: string;
  placeholder?: string;
  initialOptions: AutocompleteOption[];
}

export function Autocomplete({ initialOptions, name, placeholder }: Props) {
  const [selectedValue, setSelectedValue] = useState<AutocompleteOption>({
    label: "",
    value: "",
  });
  const [options, setOptions] = useState<AutocompleteOption[]>([]);
  const [rect, ref] = useClientRect<HTMLDivElement>();

  useEffect(() => {
    setOptions(initialOptions);
    setSelectedValue({
      label: "",
      value: "",
    });
  }, [initialOptions]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOptions = initialOptions.filter((item) =>
      item.label.toLowerCase().includes(e.target.value.toLowerCase()),
    );

    setOptions(newOptions);
    setSelectedValue({
      label: e.target.value,
      value: "",
    });
  };

  const onOptionClick =
    (option: AutocompleteOption) =>
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      setSelectedValue(option);
      (document.activeElement as HTMLElement).blur();
    };

  return (
    <div className="dropdown w-full" ref={ref}>
      <div className="join w-full">
        <input
          type="text"
          className="input join-item input-bordered w-5/6"
          value={selectedValue.label}
          placeholder={placeholder}
          onChange={onChange}
        />
        <div
          className="btn join-item w-1/6 text-error"
          data-testid="clear-text"
          onClick={() =>
            setSelectedValue({
              label: "",
              value: "",
            })
          }
        >
          <Xmark className="h-6 w-6" />
        </div>
      </div>

      <input
        type="hidden"
        name={name}
        data-testid="autocomplete-hidden"
        value={selectedValue.value}
      />

      <ul
        className="menu dropdown-content z-[1] max-h-80 w-52 flex-nowrap overflow-auto rounded-box bg-base-100 p-2 shadow"
        style={{ width: rect.width }}
      >
        {options.length === 0 && (
          <li>
            <button className="italic" onClick={(e) => e.preventDefault()}>
              No items
            </button>
          </li>
        )}
        {options.map((option, index) => (
          <li key={index}>
            <button onClick={onOptionClick(option)}>{option.label}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
