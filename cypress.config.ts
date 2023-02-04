import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents: (on, config) => {
      const isDev = config.watchForFileChanges;
      const port = process.env.PORT ?? (isDev ? "3000" : "8811");
      const configOverrides: Partial<Cypress.PluginConfigOptions> = {
        baseUrl: `http://localhost:${port}`,
        video: !process.env.CI,
        screenshotOnRunFailure: !process.env.CI,
      };

      // To use this:
      // cy.task('log', whateverYouWantInTheTerminal)
      on("task", {
        log: (message) => {
          console.log(message);

          return null;
        },
      });

      return { ...config, ...configOverrides };
    },
  },
  env: {
    DATABASE_URL:
      "mysql://achievers:TFzwC2gVr5xTSu2Byw@achievers-mysql.mysql.database.azure.com:3306/achievers?sslcert=DigiCertGlobalRootCA.crt.pem",
    SESSION_SECRET: "2e9e9dd46268d088ab72795371c49b1e",
    CLIENT_ID: "03ccc390-72dc-4337-9c02-4bb3919ba451",
    CLIENT_SECRET: "OnO8Q~tp0ObxGICgw2.DYfyvxEmycxCoPS.XNafL",
    TENANT_ID: "5cf7a1f7-4da4-47a9-813b-c8d1f7c97fa6",
    REDIRECT_URI: "http://localhost:3000/auth/microsoft/callback",
  },
});
