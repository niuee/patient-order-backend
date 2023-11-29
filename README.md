# Patient Order System API Backend

This is specifically for the pre interview assessment of Jubo Frontend developer position.
This is the api end point for the patient order system.

[Demo Link](http://vntchang.dev/patientOrderDemo/)

```
/patients for getting the patients list
```

```
/patient/:patientId for getting the a specific patient
```

```
/patientOrders/:patientId for getting orders for a specific patient
```

```
/orderHistory/:orderId for getting the order edit history for a specific order
```

```
/order for editing and inserting new orders
```

To Run the server, clone the repo and run
```
npm install 
```

To transpile the source code run
```
npm run build
```

To run the server use the command
```
npm run serve ${PORT}
```