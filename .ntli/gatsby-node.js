import { integration } from "./index.js";
const { apiImplementations } = integration.netlifyConnectPlugin;

export const sourceNodes = apiImplementations.sourceNodes;
export const createSchemaCustomization = apiImplementations.createSchemaCustomization;
export const pluginOptionsSchema = apiImplementations.pluginOptionsSchema;