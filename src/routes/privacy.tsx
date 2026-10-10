import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPolicyPage } from "./privacy-policy";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [{ title: "Privacy Policy — Driv A Long Private Limited" }],
  }),
  component: PrivacyPolicyPage,
});
