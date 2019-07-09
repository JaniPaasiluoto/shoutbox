'use strict';

const redis = require('redis');
const bcrypt = require('bcrypt');
const db = redis.createClient(); //creates long-running Redis connection
db.on('connect', () => console.log('Redis client connected to server'));
db.on('ready', () => console.log('Redis server is ready'));
db.on('error', err => console.error('Redis error', err));

class User {
  constructor(obj) {
    for (let key in obj) {
      this[key] = obj[key];
    }
  }
  toJSON() {
    return {
      id: this.id,
      name: this.name
    };
  }

  save(cb) {
    if (this.id) { //user already exists if an ID is set
      this.update(cb);
    } else {
      db.incr('users:ids', (err, id) => { //creates a unique ID
        if (err) return cb(err);
        this.id = id; //sets the ID so it'll be saved
        this.hashPassword((err) => { //Hashes the password
          if(err) return cb(err);
          this.update(cb); //saves the user properties
        });
      });
    }
  }

  update(cb) {
    const id = this.id;
    db.set(`user:id:${this.name}`, id, (err) => { //indexes users by name
      if(err) return cb(err);
      db.hmset(`user:${id}`, this, (err) => { //Uses Redis to store the current class's properties
        cb(err);
      });
    });
  }

  hashPassword(cb) {
    bcrypt.genSalt(12, (err, salt) => { //generates a 12-character salt
      if (err) return cb(err);
      this.salt = salt; //sets salt so it'll be saved
      bcrypt.hash(this.pass, salt, (err, hash) => { //generates hash
        if (err) return cb(err);
        this.pass = hash; //sets hash so it'll be saved by update()

        cb();
      });
    });
  }

  static getByName(name, cb) {
    User.getId(name, (err, id) => { //looks up user by ID
      if (err) return cb(err);
      User.get(id, cb); //grabs user with the ID
    });
  }

  static getId(name, cb) {
    db.get(`user:id:${name}`, cb); //gets ID indexed by name
  }

  static get(id, cb) {
    db.hgetall(`user:${id}`, (err, user) => { //fetches plain-object hash
      if (err) return cb(err);
      cb(null, new User(user)); //converts plain object to a new User object
    });
  }

  static authenticate(name, pass, cb) {
    User.getByName(name, (err, user) => { // looks up user by name
      if (err) return cb(err);
      if (!user.id) return cb(); //user doen't exist
      bcrypt.hash(pass, user.salt, (err, hash) => { //hashes the give password
        if (err) return cb(err);
        if (hash == user.pass) return cb(null, user); //match found
        cb(); //invalid password
      });
    });
  }
}
module.exports = User;
