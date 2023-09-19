const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const chalk = require('chalk');
const routes = require('./routes');
const cors = require('cors');


const app = express();

app.use(cors())
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', routes);

const PORT = config.get('port') ?? 8080;

async function start () {
    try {
        await mongoose.connect(config.get('mongoUri'));
        app.listen(PORT, () => {
            console.log(chalk.bgGreen('Server has been started on port ' + PORT));
        })
    } catch (e) {
        console.log(chalk.red(e.message));
        process.exit(1);
    }
}

start();
