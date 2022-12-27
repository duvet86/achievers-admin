import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router";

import Header from "~/components/Header";

test("Header snapshot", async () => {
  const { baseElement } = render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );

  expect(baseElement).toMatchSnapshot();
});
