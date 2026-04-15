const { defineConfig } = require('cypress');
const { Client } = require('pg');
require('dotenv').config();

module.exports = defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    charts: true,
    reportPageTitle: 'Relatório de Testes de API',
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
  },
  e2e: {
    baseUrl: 'http://localhost:3000', // Configuração da URL base da API
    experimentalRunAllSpecs: true,
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);

      // Task para interagir com o banco de dados
      on('task', {
        async queryDb(sql) {
          const client = new Client({
            connectionString: process.env.DATABASE_URL,
          });
          await client.connect();
          try {
            const res = await client.query(sql);
            return res.rows;
          } finally {
            await client.end();
          }
        },
      });
    },
  },
});
