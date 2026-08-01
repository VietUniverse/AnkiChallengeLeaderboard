const { spawnSync } = require("child_process");

function setSecret(key, value) {
  console.log(`Setting secret: ${key}`);
  const result = spawnSync("npx.cmd", ["wrangler", "pages", "secret", "put", key, "--project-name", "haechivn-korean"], {
    input: value,
    encoding: "utf-8"
  });
  console.log(result.stdout);
  if (result.stderr) console.error(result.stderr);
}

// Environment secret placeholders
// setSecret("GOOGLE_CLIENT_ID", "YOUR_CLIENT_ID");
// setSecret("GOOGLE_CLIENT_SECRET", "YOUR_CLIENT_SECRET");
