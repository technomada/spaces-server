# spaces server
Spaces synchronized messages server for node js.

```sh
$ git clone https://github.com/technomada/spaces-server.git

$ cd spaces-server
$ npm i
$ npm start
```

## api

where **abc** = messge set filter.

#### About Space
http://localhost:3000/about/abc
```{"since":12,"series":"d2797f09-dc40-45e5-bf22-15ebf3dd9576","stats":false}```

#### Post Item 
http://localhost:3000/put/abc?body=hello
```{"item":25,"series":"d2797f09-dc40-45e5-bf22-15ebf3dd9576"}```

#### Get Item
http://localhost:3000/get/abc
```{"list":["hi"],"since":1,"series":"d2797f09-dc40-45e5-bf22-15ebf3dd9576"}```

#### Get Item (since another)
http://localhost:3000/get/abc/1
```{"list":["hi"],"since":2,"series":"d2797f09-dc40-45e5-bf22-15ebf3dd9576"}```
