'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes, Model } = require('sequelize');
require('dotenv').config({ path: path.join(__dirname, '/../.env') });

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../../config/config.js')[env];
const db = {};

// ✅ Initialize Sequelize instance
const sequelize = config.use_env_variable
  ? new Sequelize(process.env[config.use_env_variable], config)
  : new Sequelize(config.database, config.username, config.password, config);

// ✅ Load all model classes
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach((file) => {
    const modelClass = require(path.join(__dirname, file));
    if (typeof modelClass.init !== 'function') {
      console.error(`⚠️ Model ${file} is missing a static init() method`);
      return;
    }
    // Initialize the model
    modelClass.init(modelClass.fields, {
      sequelize,
      modelName: modelClass.name,
    });
    db[modelClass.name] = modelClass;
  });

// ✅ Setup associations if defined
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// ✅ Export Sequelize + all models
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
