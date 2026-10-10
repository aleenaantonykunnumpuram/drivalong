import { createFileRoute } from "@tanstack/react-router";
import { RefundPolicyPage } from "./refund-policy";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [{ title: "Refund and Cancellation Policy — Driv A Long Private Limited" }],
  }),
  component: RefundPolicyPage,
});
