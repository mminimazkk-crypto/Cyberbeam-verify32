import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AlertCircle, ArrowUpRight, Check, LockKeyhole } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

type GatewayStatus = 'success' | 'error' | null;

function getGatewayStatus(): GatewayStatus {
  if (typeof window === 'undefined') return null;
  const status = new URLSearchParams(window.location.search).get('status');
  return status === 'success' || status === 'error' ? status : null;
}

function SignalMark() {
  return (
    <span className="cb-mark-symbol" aria-hidden="true">
      <span />
    </span>
  );
}

function DiscordGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19.54 5.15A16.2 16.2 0 0 0 15.47 4l-.5 1.03a14.2 14.2 0 0 0-5.94 0L8.53 4a16.2 16.2 0 0 0-4.07 1.15C1.88 9.02 1.18 12.8 1.53 16.53A16.4 16.4 0 0 0 6.54 19l1.21-1.64a10.2 10.2 0 0 1-1.9-.91l.47-.36c3.67 1.72 7.65 1.72 11.28 0l.48.36c-.61.36-1.25.66-1.91.91L17.46 19a16.4 16.4 0 0 0 5-2.47c.42-4.33-.72-8.08-2.92-11.38ZM8.3 14.5c-1.1 0-2-1-2-2.22 0-1.22.88-2.22 2-2.22s2 1 2 2.22c0 1.22-.9 2.22-2 2.22Zm7.4 0c-1.1 0-2-1-2-2.22 0-1.22.88-2.22 2-2.22s2 1 2 2.22c0 1.22-.9 2.22-2 2.22Z"
      />
    </svg>
  );
}

function StatusMessage({ status }: { status: GatewayStatus }) {
  if (!status) return null;

  const isSuccess = status === 'success';
  return (
    <div
      className={`cb-message${isSuccess ? '' : ' is-error'}`}
      data-testid="status-callback"
      role={isSuccess ? 'status' : 'alert'}
      aria-live="polite"
    >
      {isSuccess ? <Check size={13} /> : <AlertCircle size={13} />}
      <span>
        {isSuccess
          ? 'Identity confirmed. Your access signal is being routed.'
          : 'The access signal was interrupted. Please try again.'}
      </span>
    </div>
  );
}

function Home() {
  const status = getGatewayStatus();
  return (
    <main className="cb-page" data-testid="page-gateway">
      <div className="cb-shell">
        <header className="cb-nav" data-testid="header-gateway">
          <div className="cb-mark" data-testid="text-brand">
            <SignalMark />
            <span>Cyber Beam</span>
          </div>
          <div className="cb-nav-meta" data-testid="status-system">
            <span className="cb-status-dot" aria-hidden="true" />
            <span>Channel secure</span>
          </div>
        </header>

        <section className="cb-main" aria-labelledby="gateway-title">
          <div className="cb-card" data-testid="card-gateway">
            <div className="cb-card-topline">
              <span>Private access portal</span>
              <span className="cb-card-index">CB / 001</span>
            </div>

            <div className="cb-visual" data-testid="visual-signal-chamber">
              <div className="cb-chamber-fallback" aria-hidden="true">
                <span className="cb-chamber-ring cb-chamber-ring-outer" />
                <span className="cb-chamber-ring cb-chamber-ring-inner" />
                <span className="cb-chamber-beam" />
              </div>
              <img
                src="/cyber-beam.gif"
                alt="Abstract monochrome signal chamber animation"
                data-testid="img-cyber-beam"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
            </div>

            <h1 className="cb-heading" id="gateway-title">
              Enter the
              <br />
              <em>signal chamber.</em>
            </h1>
            <p className="cb-description" data-testid="text-gateway-description">
              A quiet gateway to the Cyber Beam network. Verify your Discord identity
              to continue to the private channel.
            </p>

            <StatusMessage status={status} />

            <a
              href="/.netlify/functions/login"
              className="cb-login"
              data-testid="button-discord-login"
              aria-label="Continue with Discord"
            >
              <DiscordGlyph />
              <span>Continue with Discord</span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>

            <div className="cb-assurance" data-testid="text-privacy-assurance">
              <LockKeyhole size={11} aria-hidden="true" />
              <span className="cb-assurance-line" aria-hidden="true" />
              <span>OAuth 2.0 · no credentials stored</span>
            </div>
          </div>
        </section>

        <footer className="cb-footer" data-testid="footer-gateway">
          <div>
            <div className="cb-footer-rule" aria-hidden="true" />
            <span>Access protocol / 2025</span>
          </div>
          <span>Encrypted by default</span>
        </footer>
      </div>
    </main>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;