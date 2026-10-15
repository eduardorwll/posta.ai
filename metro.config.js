const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Ignora diretórios de backend e infraestrutura (volumes do PostgreSQL com permissões restritas)
const existingBlockList = Array.isArray(config.resolver.blockList)
  ? config.resolver.blockList
  : [config.resolver.blockList].filter(Boolean);

config.resolver.blockList = [
  ...existingBlockList,
  /.*[/\\](?:infra|backend)(?:[/\\]|$).*/,
];

module.exports = withNativewind(config, { inlineRem: 16 });
