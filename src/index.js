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

//função para realizar a soma do saldo da conta 
function getBalance(statement){
    
    const balance = statement.reduce((acc, operation) => {
        if(operation.type === "credit"){
            return acc + operation.amount;

        } else{
            return acc - operation.amount;
        }
    }, 0);

    return balance;
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

//Deposita em conta
app.post('/deposit', verifyIfExistsAccountCPF, (request, response) => {
    const { description, amount } = request.body; 

    const { customer } = request;

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "credit"
    };

    customer.statement.push(statementOperation);

    return response.status(201).send();
})

//Debito da conta 
app.post("/withdraw", verifyIfExistsAccountCPF, (request, response) =>{
    const { amount } = request.body;
    const { customer } = request;


    const balance = getBalance(customer.statement);


    if(balance < amount){
        return response.status(400).json({error: "Insufficient Funds"})
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: "debit"
    };

    customer.statement.push(statementOperation);


    return response.status(201).send();
})

//busca o deposito pela data
app.get("/statement/date",verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;
    const { date } = request.query;

    const dateFormat = new Date(date + " 00:00");
    
    const statement = customer.statement.filter(
        (statement) => 
        statement.created_at.toDateString() ===
        new Date(dateFormat).toDateString()
    );

    return response.json(statement);
})

//Atualizar informação 
app.put("/account",verifyIfExistsAccountCPF, (request, response) => {
    const { name } = request.body;
    const { customer } = request;

    customer.name = name;

    return response.status(201).send();

})

app.get("/account", verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;

    return response.json(customer);
})

//deletar conta
app.delete("/account", verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;
    customers.splice(customer, 1);

    return response.status(200).json(customers);
})

//balancete da conta
app.get("/balance", verifyIfExistsAccountCPF,(request, response) => {
    const { customer }  = request;

    const balance = getBalance(customer.statement);

    return response.json(balance);
})
//localhost:8080
app.listen(8080);