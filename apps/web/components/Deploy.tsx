"use client";

import { useState } from "react";
import axios from "axios";

export default function Deploy({ initialRepoUrl = "" }: { initialRepoUrl?: string }) {
  const [repoUrl, setRepoUrl] = useState(initialRepoUrl);
  const [loading, setLoading] = useState(false);
  const [deploymentId, setDeploymentId] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const siteDomain =
    process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "zellr.nikhilwho.in";
  const apiUrl = process.env.NEXT_PUBLIC_UPLOAD_API_URL ?? "";
  const isLocal =
    apiUrl.includes("localhost") || apiUrl.includes("127.0.0.1");

  // Local preview uses the browser-resolved *.localhost domain on :3001.
  const liveHost = isLocal
    ? `${deploymentId}.${siteDomain}:3001`
    : `${deploymentId}.${siteDomain}`;
  const liveHref = isLocal
    ? `http://${liveHost}/`
    : `https://${liveHost}`;
  const isReady = status === "deployed";
  const statusLabel = status === "uploaded" ? "Building your project" : isReady ? "Live and ready to share" : status === "failed" ? "Build needs attention" : "Waiting to deploy";

  const deployRepo = async () => {
    if (!repoUrl) {
      setError("Please enter a GitHub repository URL");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${apiUrl}/upload`, {
        repoUrl,
      });

      const { id } = response.data;
      setDeploymentId(id);
      setStatus("uploaded");

      const pollStatus = async () => {
        try {
          const statusResponse = await axios.get(
            `${apiUrl}/status?id=${id}`,
          );
          const deploymentStatus = statusResponse.data.status;
          setStatus(deploymentStatus);

          if (deploymentStatus === "deployed") {
            setLoading(false);
          } else if (deploymentStatus === "failed") {
            setError("The build failed. Check the deploy-service terminal for details.");
            setLoading(false);
          } else {
            setTimeout(pollStatus, 2000);
          }
        } catch (err) {
          console.error("Error polling status:", err);
          setTimeout(pollStatus, 2000);
        }
      };

      pollStatus();
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Deployment failed";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <form
      className="deploy-form"
      aria-busy={loading}
      onSubmit={(event) => {
        event.preventDefault();
        deployRepo();
      }}
    >
      <label htmlFor="repoUrl" className="deploy-field-label">
        GitHub repository URL
      </label>
      <div className="deploy-primary-row">
        <input
          id="repoUrl"
          type="url"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/username/repository"
          autoComplete="url"
          required
          disabled={loading}
          className="deploy-url-input"
        />
        <button
          type="submit"
          disabled={loading}
          className="deploy-button"
        >
          <span>{loading ? "Deploying…" : "Deploy project"}</span>
          {!loading && (
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
              <path d="M4 12 12 4M6.5 4H12v5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>

      {error && (
        <p className="deploy-error" role="alert">
          {error}
        </p>
      )}

      {deploymentId && (
        <div className="deployment-result">
          <div className="deployment-result-head"><span className={`deployment-state deployment-state-${status}`} /><p><strong>{statusLabel}</strong><small>Deployment ID · {deploymentId}</small></p></div>
          {isReady && (
            <>
              <p className="deployment-live">
                Live at{" "}
                <a
                  href={liveHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono underline underline-offset-4 hover:opacity-70"
                >
                  {liveHost}
                </a>
              </p>
              {isLocal && (
                <div className="deployment-command">
                  <p>To open it in the browser, map the subdomain to this machine first:</p>
                  <code>{`sudo sh -c 'echo "127.0.0.1 ${deploymentId}.${siteDomain}" >> /etc/hosts'`}</code>
                  <p>Then visit <span>{liveHref}</span></p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </form>
  );
}
