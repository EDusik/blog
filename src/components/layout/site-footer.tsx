import type { NetworkQuality } from "@/types";
import { GithubIcon, LinkedInIcon } from "@/components/ui/icons";
import { SyncedStatusLabel } from "@/components/ui/synced-status-label";

type Props = {
  footer: string;
  syncedLabel: string;
  networkStatus: Record<NetworkQuality, string>;
};

export function SiteFooter({ footer, syncedLabel, networkStatus }: Props) {
  return (
    <footer className="site-footer">
      <div className="footer-social">
        <a
          className="icon-link"
          href="https://github.com/EDusik"
          aria-label="GitHub"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GithubIcon />
        </a>
        <a
          className="icon-link"
          href="https://www.linkedin.com/in/eduardo-dos-santos-dusik/"
          aria-label="LinkedIn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <LinkedInIcon />
        </a>
      </div>
      {footer ? (
        <span className="site-footer-middle">{footer}</span>
      ) : (
        <span className="site-footer-middle" aria-hidden="true" />
      )}
      <div className="site-footer-right">
        <SyncedStatusLabel syncedLabel={syncedLabel} networkStatus={networkStatus} />
      </div>
    </footer>
  );
}
