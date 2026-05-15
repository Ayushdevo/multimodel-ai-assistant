const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = 'Enter Your Api Key';
const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log("Available models:");
    data.models.forEach(m => console.log(m.name));
  } catch (e) {
    console.error(e);
  }
}
run();
