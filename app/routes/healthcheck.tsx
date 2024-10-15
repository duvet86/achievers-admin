import { data } from "@remix-run/react";

export function loader() {
  return data("OK");
}
