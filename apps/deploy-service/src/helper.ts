import { exec } from "child_process";
import path from "path";
import type { FrameworkDetection } from "./framework.js";

export function buildProject(id: string, detection: FrameworkDetection) {
  return new Promise<void>((resolve, reject) => {
    // Must match downloadS3Folder / copyFinalDist (process.cwd()/output/...)
    const projectPath = path.join(process.cwd(), `output/${id}`);

    console.log("Building at:", projectPath);

    const installCommand = detection.packageManager === "npm" ? "npm install" : `${detection.packageManager} install`;
    const child = exec(`cd "${projectPath}" && ${installCommand} && ${detection.buildCommand}`);

    child.stdout?.on("data", (data) => {
      console.log("stdout:", data.toString());
    });

    child.stderr?.on("data", (data) => {
      console.error("stderr:", data.toString());
    });

    child.on("close", (code) => {
      if (code === 0) {
        console.log("Build finished successfully");
        resolve();
      } else {
        reject(new Error(`Build failed with exit code ${code}`));
      }
    });
  });
}
