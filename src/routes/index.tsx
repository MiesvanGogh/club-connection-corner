import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Loading } from "@/components/ui-kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HVCHTeam — teammanagement voor je voetbalteam" },
      {
        name: "description",
        content:
          "Aanwezigheid, opstellingen, vlaggers en statistieken voor je voetbalteam in één app.",
      },
      { property: "og:title", content: "HVCHTeam — teammanagement voor je voetbalteam" },
      {
        property: "og:description",
        content:
          "Aanwezigheid, opstellingen, vlaggers en statistieken voor je voetbalteam in één app.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.ready) return;
    navigate({ to: auth.isAuthenticated ? "/wedstrijden" : "/inloggen" });
  }, [auth.ready, auth.isAuthenticated, navigate]);

  return (
    <div className="grid min-h-screen place-items-center bg-frost-2">
      <div className="text-center">
        <div className="font-display text-3xl tracking-wide">
          HVCH<span className="text-pitch">Team</span>
        </div>
        <Loading />
      </div>
    </div>
  );
}
