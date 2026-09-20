import Deploy from "@/components/Deploy";
import { Logo } from "@/components/Logo";
import Link from "next/link";

export default function Home() {
  return (
    <main className="landing-shell">
      <style>{`
        .landing-shell { width: 100% !important; max-width: none !important; margin-left: auto !important; margin-right: auto !important; overflow-x: hidden; padding-top: clamp(1.5rem, 3vw, 3rem); }
        .landing-copy, .landing-section, .landing-cta, .landing-footer { box-sizing: border-box; width: min(100%, 1400px) !important; margin-left: auto !important; margin-right: auto !important; }
        .landing-section { padding-left: clamp(1.5rem, 4vw, 4rem) !important; padding-right: clamp(1.5rem, 4vw, 4rem) !important; }
        .landing-copy { box-sizing: border-box; display: flex; min-height: 23rem; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 1.5rem 2rem; text-align: center; }
        .landing-copy h1 { font-family: var(--font-season); font-size: clamp(3.2rem, 4.4vw, 5.2rem); font-weight: 300; line-height: .94; letter-spacing: -.06em; white-space: nowrap; }
        .landing-copy p { max-width: 35rem; margin-top: 1.4rem; color: var(--muted-foreground); font-size: clamp(1rem, 1.3vw, 1.15rem); line-height: 1.5; }
        .landing-copy a { display: inline-flex; align-items: center; gap: .5rem; margin-top: 1.7rem; border-radius: .45rem; background: var(--foreground); color: var(--background); padding: .72rem 1rem; font-size: .875rem; font-weight: 500; transition: opacity .2s ease, transform .2s ease; }
        .landing-copy a:hover { opacity: .78; }
        .landing-copy a:hover svg { transform: translateX(.18rem); }
        .landing-copy a svg { transition: transform .2s ease; }
        .landing-copy small { margin-top: 1.35rem; color: #969a95; font-size: .72rem; }
        .landing-preview-wrap { width: calc(100% - 1.25rem); max-width: none; margin: 0 auto; padding: 1rem 0 5rem; }
        .landing-preview { display: flex; align-items: center; justify-content: center; min-height: clamp(22rem, 42vw, 34rem); overflow: hidden; border: 0; border-radius: 1.15rem; background: url('/images/ladakh-dashboard-bg.png') center / cover no-repeat; box-shadow: 0 20px 55px rgb(15 35 45 / 18%); padding: clamp(2rem, 5vw, 4.5rem); }
        .preview-deploy { width: min(100%, 40rem); overflow: hidden; border: 1px solid #e3e6e3; border-radius: .85rem; background: #fff; box-shadow: 0 16px 38px rgb(15 35 45 / 14%); }
        .preview-deploy-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; border-bottom: 1px solid #edf0ef; padding: 1.15rem 1.4rem; }
        .preview-deploy-head strong { color: #22282a; font-size: 1rem; font-weight: 600; letter-spacing: -.02em; }
        .preview-deploy-head span { color: #97a09e; font-family: var(--font-geist-mono), monospace; font-size: .72rem; letter-spacing: .04em; text-transform: uppercase; }
        .landing-section { padding: clamp(3rem, 6vw, 5rem) max(1.5rem, calc((100vw - 90rem) / 2)); }
        .landing-kicker { color: #7b837f; font-size: .68rem; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; }
        .landing-section h2 { margin-top: 1.1rem; font-family: var(--font-season); font-size: clamp(2.4rem, 2.8vw, 3.4rem); font-weight: 300; line-height: .93; letter-spacing: -.06em; }
        .landing-quote > div { max-width: 54rem; margin-top: 1.75rem; }
        .quote-mark { display: block; margin-bottom: .35rem; color: #a9e552; font-family: var(--font-season); font-size: 3.5rem; line-height: 1; }
        .landing-quote blockquote { font-family: var(--font-season); font-size: clamp(1.9rem, 3.2vw, 3.2rem); font-weight: 300; line-height: 1.05; letter-spacing: -.05em; }
        .landing-quote cite { display: block; margin-top: 1.35rem; color: #77807a; font-family: var(--font-geist); font-size: .82rem; font-style: normal; }
        .site-footer { display: grid; width: min(calc(100% - 3rem), 98rem); min-height: 10rem; margin: 0 auto 3rem; grid-template-columns: 1fr auto; grid-template-rows: auto 1fr; align-items: start; gap: 2rem; overflow: hidden; border-radius: 1rem; background: #1a1d19; padding: clamp(2rem, 4vw, 3.5rem); color: #aaaFA8; font-size: .8rem; }
        .site-footer .brand { align-self: start; color: #f7f7f2; font-size: 2.2rem; }
        .site-footer > span { align-self: end; }
        .site-footer nav { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 1.5rem; color: #f7f7f2; font-size: .875rem; }
        .site-footer a { transition: color .2s ease; }
        .site-footer a:hover { color: #bdf254; }
        @media (max-width: 700px) { .landing-copy { min-height: 27rem; padding-top: 3rem; } .landing-copy h1 { max-width: 12ch; font-size: clamp(3rem, 12vw, 4rem); white-space: normal; } .landing-preview-wrap { width: calc(100% - 1rem); padding: 1.5rem 0 2rem; } .landing-preview { min-height: 18rem; padding: 1.5rem 1rem; } .landing-quote { grid-template-columns: 1fr; } .site-footer { width: calc(100% - 2rem); min-height: 17rem; margin-bottom: 2rem; grid-template-columns: 1fr; grid-template-rows: auto 1fr auto; padding: 2rem; } .site-footer nav { align-self: center; justify-content: flex-start; } .site-footer > span { align-self: end; } }
      `}</style>
      <style>{`
        .landing-copy, .landing-section, .site-footer { box-sizing: border-box; width: calc(100% - 1.25rem) !important; margin-left: auto !important; margin-right: auto !important; }
        .landing-copy { min-height: 19rem; padding-top: 2rem; padding-bottom: 1.5rem; }
        .landing-copy h1 { font-size: clamp(2.5rem, 3.4vw, 4rem); }
        .landing-copy p { margin-top: 1rem; font-size: clamp(.9rem, 1.05vw, 1rem); }
        .landing-copy a { margin-top: 1.25rem; padding: .62rem .9rem; font-size: .8rem; }
        .landing-copy small { margin-top: 1rem; font-size: .65rem; }
        .landing-copy { display: grid; min-height: 30rem; grid-template-columns: minmax(0, 1.1fr) minmax(20rem, .9fr); align-items: center; gap: clamp(3rem, 9vw, 10rem); overflow: hidden; border-radius: 1.25rem; background: radial-gradient(circle at 20% 115%, rgb(135 45 63 / 30%), transparent 34%), radial-gradient(circle at 96% 110%, rgb(38 55 113 / 30%), transparent 35%), #0d0e0d; padding: clamp(2.5rem, 6vw, 6rem); color: #f7f7f2; text-align: left; }
        .landing-copy { background: transparent; color: var(--foreground); }
        .landing-copy .landing-hero-detail p { color: var(--muted-foreground); }
        .landing-copy .landing-hero-actions a { background: var(--foreground); color: var(--background); }
        .landing-copy .landing-hero-actions .landing-github-link { border-color: var(--border); background: transparent; color: var(--foreground); }
        .landing-copy .landing-hero-detail small { color: var(--muted-foreground); }
        .landing-copy .landing-hero-title h1 { max-width: 9ch; margin: 0; color: inherit; font-family: var(--font-geist); font-size: clamp(3.2rem, 5.2vw, 6.25rem); font-weight: 400; line-height: .9; letter-spacing: -.075em; white-space: normal; }
        .landing-copy .landing-hero-title em { font-family: var(--font-season); font-weight: 300; }
        .landing-hero-detail { display: flex; flex-direction: column; align-items: flex-start; }
        .landing-copy .landing-hero-detail p { max-width: 32rem; margin: 0; color: rgb(255 255 255 / 70%); font-size: clamp(1rem, 1.35vw, 1.2rem); line-height: 1.55; }
        .landing-hero-actions { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 1.8rem; }
        .landing-copy .landing-hero-actions a { display: inline-flex; align-items: center; margin: 0; border: 1px solid transparent; border-radius: .55rem; background: #f7f7f2; padding: .75rem 1rem; color: #171817; font-size: .85rem; font-weight: 600; }
        .landing-copy .landing-hero-actions .landing-github-link { border-color: rgb(255 255 255 / 14%); background: rgb(255 255 255 / 9%); color: #f7f7f2; }
        .landing-copy .landing-hero-detail small { margin-top: 1.2rem; color: rgb(255 255 255 / 46%); font-size: .68rem; }
        .landing-copy { min-height: 0; align-items: start; padding-top: 5.5rem; padding-bottom: .75rem; }
        .landing-hero-detail { margin-top: .4rem; transform: none; }
        .landing-copy .landing-hero-detail p { color: #484b48 !important; font-size: 1rem; }
        .landing-copy .landing-hero-actions { gap: .6rem; margin-top: 1.25rem; }
        .landing-copy .landing-hero-actions a { background: #171817 !important; padding: .6rem .85rem; color: #fff !important; font-size: .78rem; }
        .landing-copy .landing-hero-actions .landing-github-link { border-color: #d7d9d4 !important; background: transparent !important; color: #171817 !important; }
        .landing-github-link svg { width: .95rem; height: .95rem; margin-right: .38rem; }
        .landing-copy .landing-hero-detail small { color: #747873 !important; }
        @media (max-width: 700px) { .landing-copy, .landing-section, .site-footer { width: calc(100% - 1rem) !important; } .landing-copy { min-height: 34rem; grid-template-columns: 1fr; gap: 2.5rem; padding: 2rem; } .landing-copy .landing-hero-title h1 { font-size: clamp(2.75rem, 12vw, 4rem); } .landing-copy .landing-hero-detail p { max-width: 100%; } .landing-hero-actions { width: 100%; } }
      `}</style>
      <section className="landing-copy">
        <div className="landing-hero-title"><h1>Deploy what truly <em>matters.</em></h1></div>
        <div className="landing-hero-detail">
          <p>Connect a public GitHub repository and Zellr handles the build, hosting, and live URL—so you can go from commit to a shareable site without configuration.</p>
          <div className="landing-hero-actions">
            <Link href="#deploy">Start deploying</Link>
            <a className="landing-github-link" href="https://github.com/nikhil008-git/zellr/" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.2-3.37-1.2-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.41c.85 0 1.7.12 2.5.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.35 4.79-4.58 5.05.36.32.68.93.68 1.87 0 1.35-.01 2.44-.01 2.77 0 .27.18.59.69.49A10.24 10.24 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z" /></svg>
              Star on GitHub
            </a>
          </div>
        </div>
      </section>

      <section id="deploy" className="landing-preview-wrap" aria-label="Deploy a repository">
        <div className="landing-preview">
          <div className="preview-deploy">
            <div className="preview-deploy-head"><strong>Start a new deployment</strong><span>github.com</span></div>
            <Deploy />
          </div>
        </div>
      </section>

      <section className="landing-section landing-quote">
        <p className="landing-kicker">Built for teams that move</p>
        <div><span className="quote-mark">“</span><blockquote>One simple path from the repository your team knows to a URL everyone can use.</blockquote><cite>Zellr deployment workflow</cite></div>
      </section>

      <footer className="site-footer">
        <Logo className="brand" />
        <nav aria-label="Footer navigation">
          <Link href="#deploy">Deploy</Link>
        </nav>
        <span>© 2026 Zellr</span>
      </footer>
    </main>
  );
}
