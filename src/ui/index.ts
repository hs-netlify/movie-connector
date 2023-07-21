import { NetlifyIntegrationUI } from "@netlify/sdk";

const integrationUI = new NetlifyIntegrationUI("movie-integration");

const surface = integrationUI.addSurface("integrations-settings");

const root = surface.addRoute("/");

root.addText({
    value: "Welcome to the movie-integration integration UI. This is where you can create your own custom UI for your integration, which will be displayed in the Netlify UI."
});

export { integrationUI };

