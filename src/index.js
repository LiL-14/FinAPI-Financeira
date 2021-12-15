const { response } = require("express");
const express = require("express");
const { v4: uuidv4 } = require("uuid")


const app = express(); 

app.use(express.json());


const customers = [];

/** 
 * cpf - string
 * name- string
 * id - uuid
 * statement []
*/

app.post("/account", (request, response) => {

    const { cpf, name } = request.body;
    const customerAlredyExists = customers.some(
        (customer) => customer.cpf === cpf
    );

    if(customerAlredyExists){
        return response.status(400).json({error: "Customer alredy exists"})
    }

    const id = uuidv4();

    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: []
    });

    return response.status(201).send();

});

//localhost:8080
app.listen(8080);