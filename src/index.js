const { response, request } = require("express");
const express = require("express");
const { v4: uuidv4 } = require("uuid")


const app = express(); 

app.use(express.json());


const customers = [];

//Middleware
function verifyIfExistsAccountCPF(request, response, next){
    const { cpf } = request.headers;

    const customer = customers.find((customer) => customer.cpf === cpf);

    if(!customer){
        return response.status(400).json({error: "Customer not found"})
    } 

    request.customer = customer;

    return next();

}

//Criação de conta e confirmação se o CPF existe
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

// app.use(verifyIfExistsAccountCPF);

//Busca de um cpf 
app.get("/statement",verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;
    return response.json(customer.statement);
})

app.post('/deposit', verifyIfExistsAccountCPF, (request, response) => {
    const { description, amount } = request.body; 

    const { customer } = request;

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "Credit"
    };

    customer.statement.push(statementOperation);

    return response.status(201).send();
})

app.post("/withdraw")

//localhost:8080
app.listen(8080);