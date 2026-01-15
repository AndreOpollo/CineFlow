import * as SQLite from 'expo-sqlite'

export const db = SQLite.openDatabaseSync('cineflow.db')

db.execSync('PRAGMA foreign_keys=ON')
db.execSync('PRAGMA journal_mode=WAL')
db.execSync('PRAGMA synchronous=NORMAL')

console.log("Database connected!")