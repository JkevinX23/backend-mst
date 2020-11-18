import app from './App'

require('dotenv').config()

app.listen(process.env.PORT || 3333)
