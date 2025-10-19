// Script de prueba para la API de reportes
const fetch = require("node-fetch");

async function testReportes() {
  try {
    console.log("Testing /api/reportes/ventas?periodo=dia...");
    const response = await fetch(
      "http://localhost:3000/api/reportes/ventas?periodo=dia"
    );
    const data = await response.json();

    console.log("Status:", response.status);
    console.log("Data:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testReportes();
