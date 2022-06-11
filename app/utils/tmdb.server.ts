import { MovieDb } from "moviedb-promise"

const key = process.env.TMDB_API_KEY
if (!key) {
  throw "api key is undefined"
}

export default new MovieDb(key)
