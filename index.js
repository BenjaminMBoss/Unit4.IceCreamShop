const pg = require('pg')
const client = new pg.Client('postgres://localhost/icecream_db')
const express = require('express')
const app = express();

app.get('/api/flavors', async (req,res,next) => {
    try {
        const SQL = `
        SELECT *
        FROM flavors
        `

        const response = await client.query(SQL)
        res.send(response.rows)
    } catch (error) {
        next(error)
    }
})

app.get('/api/flavors/:id', async (req,res,next) => {
    try {
        const SQL = `
            SELECT * FROM flavors WHERE id=$1
        `
        const response = await client.query(SQL, [req.params.id])

        if (!response.rows.length) {
            next({
                name: "id error",
                message:  `flavor with ${req.params.id} does not exist`
            })
        } else {
            res.send(response.rows[0])
        }
    } catch (error) {
        next(error)
    }
})

app.delete('/api/flavors/:id',async (req,res,next) => {
    try {
        const SQL = `
        DELETE FROM flavors WHERE id=$1
        `
        const response = await client.query(SQL, [req.params.id])
        res.sendStatus(204)
    } catch (error) {
        next(error)
    }
})

app.use((error,req,res,next) => {
    res.status(500)
    res.send(error)
})

app.use('*', (req,res,next) => {
    res.send('No such route exists')
})

const start = async () => {
    await client.connect();
    console.log('connected to db')
    const SQL = `
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors(
        id SERIAL PRIMARY KEY,
        name VARCHAR(20)
    );

    INSERT INTO flavors(name) VALUES ('Vanilla');
    INSERT INTO flavors(name) VALUES ('Chocolate');
    INSERT INTO flavors(name) VALUES ('Strawberry');
    INSERT INTO flavors(name) VALUES ('Cookies and Cream');
    INSERT INTO flavors(name) VALUES ('Mint Chocolate Chip');
    `
    await client.query(SQL)
    console.log('created table and seeded')

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`listening at port ${port}`)
    })
}

start();