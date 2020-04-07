import express from 'express'
import app from './app.js'


//port and host
const port = 8000
const host = '127.0.0.1'

const server = app.listen(port, host, ()=>{
    console.log(`server is running at http://${host}:${port}`)
})