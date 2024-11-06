/* eslint-disable @typescript-eslint/no-var-requires */

async function start(watch) {
  const ctx = await require("esbuild").context({
    entryPoints: ["src/index.ts"],
    bundle: true,
    minify: process.env.NODE_ENV === "production",
    sourcemap: true,
    mainFields: ["module", "main"],
    external: ["coc.nvim"],
    platform: "node",
    target: "node18.0",
    outfile: "lib/index.js",
  });

  if (watch) {
    await ctx.watch(watch);
  } else {
    await ctx.dispose();
  }
}

let watch = false;

if (process.argv.length > 2 && process.argv[2] === "--watch") {
  console.log("watching...");
  watch = {
    onRebuild(error) {
      if (error) {
        console.error("watch build failed:", error);
      } else {
        console.log("watch build succeeded");
      }
    },
  };
}

start(watch)
  .then(() => console.log("Done."))
  .catch((error) => {
    console.error(error);
  });
