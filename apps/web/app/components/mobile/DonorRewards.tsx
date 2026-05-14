import { MilestonesPanel } from "./MilestonesPanel";
import { MobileShell } from "./MobileShell";
import { ProvinceLeaderboard } from "./ProvinceLeaderboard";
import { ReferralPanel } from "./ReferralPanel";
import { RewardsPanel } from "./RewardsPanel";

export function DonorRewards() {
  return (
    <MobileShell active="profile">
      <header>
        <strong>Recompensas</strong>
        <p className="muted">Pontos, medalhas e ranking da comunidade.</p>
      </header>
      <RewardsPanel />
      <MilestonesPanel />
      <ReferralPanel />
      <ProvinceLeaderboard />
    </MobileShell>
  );
}
