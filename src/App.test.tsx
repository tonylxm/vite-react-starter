import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { expect, it } from "vitest";
import App from "./App";
import { AuthProvider } from "./lib/auth";

it("sends signed-out visitors from a private route to sign in", async () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
  expect(
    await screen.findByRole("heading", { level: 1, name: "Sign in" }),
  ).toBeDefined();
});
