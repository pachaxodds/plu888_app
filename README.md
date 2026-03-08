# Readme

Create by Pacharawit Pluwan

ใช้ Gemini ในการช่วยเขียนในส่วนของการ migrate database และช่วยเขียน logic ในการคำนวณรายได้
ใช้ Copilot ในการช่วยเขียน Unit test

วิธีรัน

1. เปิด Docker ขึ้นมาแล้วรันคำสั่ง

```
docker compose up -d
```

2. รันคำสั่งเพื่อเปิดหน้าเว็บ

```
bin/dev
```

แล้วเข้าไปที่ http://localhost:3000/

3. หากต้องการเข้า Database ให้ใช้ connection นี้

```
Port: 5432
User: plu888
Password: password
Database: plu888-app
```

4. รัน unit test

```
npm test
```
