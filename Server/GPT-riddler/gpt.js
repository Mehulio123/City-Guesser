// We import the OpenAI package we wany
const { Configuration, OpenAIApi } = require("openai");

//we make a open AI configuration; telling it what API key to use
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
//OPEN_API_KEY is in the .env file

const openai = new OpenAIApi(configuration);
//we made a variable openai which now holds a client that can talk to gpt

async function generateRiddle(cityName) {//making a function
    //await tells the program to wait until gpt sends a response
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
        {
            role: "user",
            content: `Write a fun, slightly tricky riddle about the city "${cityName}". Do NOT mention the city name. Make it 7 lines.`,
            },  
        ]
    }); 
    //pulling out what gpt wrote
    return response.data.choices[0].message.content.trim();
}

module.exports = {generateRiddle};