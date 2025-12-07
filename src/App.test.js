import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders Hermes header", () => {
  render(<App />);
  const headers = screen.getAllByText(/Hermes AI/i);
  expect(headers.length).toBeGreaterThan(0);
});
