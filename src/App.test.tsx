import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import App from "./App";

it("renders the home page", () => {
  render(<App />);
  expect(screen.getByRole("heading", { level: 1 })).toBeDefined();
});
