export {};

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Logs in with a random user. Yields the user and adds an alias to the user
       *
       * @returns {typeof login}
       * @memberof Chainable
       * @example
       *    cy.login()
       * @example
       *    cy.login({ email: 'whatever@example.com' })
       */
      login: typeof login;

      /**
       * Extends the standard visit command to wait for the page to load
       *
       * @returns {typeof visitAndCheck}
       * @memberof Chainable
       * @example
       *    cy.visitAndCheck('/')
       *  @example
       *    cy.visitAndCheck('/', 500)
       */
      visitAndCheck: typeof visitAndCheck;
    }
  }
}

function login() {
  // cy.log("TENANT_ID:");
  // cy.log(Cypress.env("TENANT_ID"));

  cy.visit("https://achievers-webapp.azurewebsites.net/");

  cy.get("button").should("be.visible");

  cy.request({
    method: "POST",
    url: `https://login.microsoftonline.com/${Cypress.env(
      "TENANT_ID"
    )}/oauth2/v2.0/token`,
    form: true,
    body: {
      grant_type: "password",
      client_id: Cypress.env("CLIENT_ID"),
      client_secret: Cypress.env("CLIENT_SECRET"),
      scope: "openid profile email",
      username: "test@achieversclubwa.org.au",
      password: "QFh7eDe0c5Db",
      // resource: "clientId",
    },
  }).then((response) => {
    console.log(response);
    // defined in step 2
    // injectTokens(response);
  });

  // loginButton.click();

  // cy.location("pathname")
  //   .should("contain", "login.microsoftonline.com")
  //   .wait(1000);

  // const input = cy.find("input");

  // cy.get("input").type("Hello, World");

  // cy.pause();

  // cy.location("pathname").should("contain", "login.microsoftonline").wait(1000);

  // cy.then(() => ({ email })).as("user");
  // cy.exec(
  //   `npx ts-node --require tsconfig-paths/register ./cypress/support/create-user.ts "${email}"`
  // ).then(({ stdout }) => {
  //   const cookieValue = stdout
  //     .replace(/.*<cookie>(?<cookieValue>.*)<\/cookie>.*/s, "$<cookieValue>")
  //     .trim();
  //   cy.setCookie("__session", cookieValue);
  // });
  // return cy.get("@user");
}

// We're waiting a second because of this issue happen randomly
// https://github.com/cypress-io/cypress/issues/7306
// Also added custom types to avoid getting detached
// https://github.com/cypress-io/cypress/issues/7306#issuecomment-1152752612
// ===========================================================
function visitAndCheck(url: string, waitTime: number = 1000) {
  cy.visit(url);
  cy.location("pathname").should("contain", url).wait(waitTime);
}

Cypress.Commands.add("login", login);
Cypress.Commands.add("visitAndCheck", visitAndCheck);
