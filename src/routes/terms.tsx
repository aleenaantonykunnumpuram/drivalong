import { createFileRoute } from "@tanstack/react-router";
import { TermsOfServicePage } from "./terms-of-service";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [{ title: "Terms of Service — Driv A Long Private Limited" }],
  }),
  component: TermsOfServicePage,
});
